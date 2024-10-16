import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../components/ui/select";
import { sendGet, getDataFromId, convertIsoToDate, sendDelete, parseDate, isValidDate, sendPut, getIdFromData } from "../functions";
import { Search, Trash, CircleCheckBig, Printer } from 'lucide-react';
import IMask from 'imask';
import { CustomAlertDialog, CustomConfirmDialog } from "../components/alert";
import CulturaLogo from '../assets/culturaLogo.png';

export default function Faturas() {

    const dataInicioSearchRef = useRef<HTMLInputElement>(null);
    const dataFimSearchRef = useRef<HTMLInputElement>(null);
    const dataPagamentoRef = useRef<HTMLInputElement>(null);

    const [dataInicioSearch, setDataInicioSearch] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('pt-BR'));
    const [dataFimSearch, setDataFimSearch] = useState(new Date().toLocaleDateString('pt-BR'));
    const [formasPagamento, setFormasPagamento] = useState<any[]>([]);

    const [situacaoFaturaSearch, setSituacaoFaturaSearch] = useState('todos');
    const [tipoDataSearch, setTipoDataSearch] = useState('vencimento');
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
    const [dataPagamento, setDataPagamento] = useState('');
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [faturas, setFaturas] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [mes, setMes] = useState((Number(new Date().getMonth()) + 2).toString());
    const [ano, setAno] = useState(Number(new Date().getFullYear()));

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertConfirmMessage, setAlertConfirmMessage] = useState<string | null>(null);

    useEffect(() => {
        showFaturas();
        loadFormasPagamento();
        const applyMasks = () => {
            if (dataInicioSearchRef.current) {
                IMask(dataInicioSearchRef.current, {
                    mask: '00/00/0000',
                });
            }
            if (dataFimSearchRef.current) {
                IMask(dataFimSearchRef.current, {
                    mask: '00/00/0000',
                });
            }
        };
        const timer = setTimeout(applyMasks, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (situacaoFaturaSearch) {
            showFaturas();
        }
    }, [situacaoFaturaSearch]);

    useEffect(() => {
        if (tipoDataSearch) {
            showFaturas();
        }
    }, [tipoDataSearch]);

    useEffect(() => {
        showFaturas();
    }, [situacaoFaturaSearch, tipoDataSearch]);
    useEffect(() => {
        showFaturas();
    }, []);

    const loadFormasPagamento = async () => {
        const response = await sendGet('/formaPagamento/04390988077');
        if (response) {
            setFormasPagamento(response);
        } else {
            setAlertMessage("Erro ao carregar os formas de pagamento!");
        }
    }

    const showFaturas = async () => {

        const dataInicio = dataInicioSearchRef.current?.value;
        const dataFim = dataFimSearchRef.current?.value;

        let faturas = [];

        const response = await sendGet('/faturamento/04390988077');

        if (response) {
            const faturasCompletas = await Promise.all(response.map(async (fatura: any) => {
                const valorNumerico = parseFloat(fatura.valor);
                const valorString = valorNumerico.toFixed(2).replace('.', ',');
                const maskedValue = IMask.createMask({
                    mask: 'R$ num',
                    blocks: {
                        num: {
                            mask: Number,
                            thousandsSeparator: '.',
                            radix: ',',
                            scale: 2,
                            signed: false,
                            normalizeZeros: true,
                            padFractionalZeros: true,
                        }
                    }
                });
                maskedValue.resolve(valorString);
                const valorFinal = maskedValue.value;
                const clienteNome = await getDataFromId(fatura.id_cliente, '/clientes/04390988077', 'nomeFantasia');
                const programaNome = await getDataFromId(fatura.id_programa, '/programacao/04390988077', 'programa');
                const formaPagamentoDescricao = await getDataFromId(fatura.id_formaPagamento, '/formaPagamento/04390988077', 'formaPagamento');

                return {
                    ...fatura,
                    valorFinal,
                    clienteNome,
                    programaNome,
                    formaPagamentoDescricao,
                };
            }));

            if (dataInicio && dataFim && isValidDate(dataInicio) && isValidDate(dataFim)) {
                const inicioDate = parseDate(dataInicio);
                const fimDate = parseDate(dataFim);

                if (!inicioDate || !fimDate) {
                    setAlertMessage("Datas inválidas!");
                    return;
                }

                inicioDate.setHours(0, 0, 0, 0);
                fimDate.setHours(23, 59, 59, 999);

                const tipoData = tipoDataSearch;
                const situacao = situacaoFaturaSearch;

                faturas = faturasCompletas

                if (situacao === 'pendentes') {
                    faturas = faturasCompletas.filter(fatura => fatura.dataPagamento === null);
                } else if (situacao === 'pagas') {
                    faturas = faturasCompletas.filter(fatura => fatura.dataPagamento !== null);
                }

                if (tipoData === 'vencimento') {
                    faturas = faturas.filter(fatura => {
                        const dataVencimento = new Date(fatura.dataVencimento);
                        return dataVencimento >= inicioDate && dataVencimento <= fimDate;
                    });
                } else if (tipoData === 'pagamento') {
                    faturas = faturas.filter(fatura => {
                        const dataPagamento = fatura.dataPagamento ? new Date(fatura.dataPagamento) : null;
                        return dataPagamento && dataPagamento >= inicioDate && dataPagamento <= fimDate;
                    });
                } else if (tipoData === 'emissao') {
                    faturas = faturas.filter(fatura => {
                        const dataEmissao = new Date(fatura.dataEmissao);
                        return dataEmissao >= inicioDate && dataEmissao <= fimDate;
                    });
                }

                setFaturas(faturas);

            } else {
                setAlertMessage("Datas inválidas!");
                return;
            }
        } else {
            setAlertMessage("Erro ao carregar as faturas!");
        }
    }


    const handleConfigs = async () => {
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        const body = { usuario: 'Guilherme' };
        const response = await sendDelete(`/faturamento/${id}`, body);
        if (response) {
            showFaturas();
        } else {
            setAlertMessage("Erro ao deletar a fatura!");
            console.log(response);
        }
        setAlertConfirmMessage(null);
    }

    // Payment Logic ////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        if (isPaymentDialogOpen) {
            const applyMasks = () => {
                if (dataPagamentoRef.current) {
                    IMask(dataPagamentoRef.current, {
                        mask: '00/00/0000',
                    });
                }
            };
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }
    }, [isPaymentDialogOpen]);

    const hendleOpenPayment = async (fatura: any) => {
        setIsPaymentDialogOpen(true);
        setSelectedFatura(fatura);
        setDataPagamento('');
        setMetodoPagamento(await getDataFromId(fatura.id_formaPagamento, '/formaPagamento/04390988077', 'formaPagamento'));
    };

    const handlePaymanent = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!(isValidDate(dataPagamento))) {
            setAlertMessage("Data de pagamento inválida!");
            return;
        }
        const body = {
            dataPagamento: parseDate(dataPagamento),
            id_formaPagamento: getIdFromData(metodoPagamento, 'formaPagamento', '/formaPagamento/04390988077'),
        };
        try {
            const response = await sendPut('/faturamento/' + selectedFatura.id + '/pagamento', body);
            if (response) {
                await showFaturas();
                setIsPaymentDialogOpen(false)
            } else {
                setAlertMessage("Erro ao processar a solicitação");
            };
        } catch (error) {
            console.log(error);
        }
    }

    // Print Report Logic ////////////////////////////////////////////////////////////////////////////////////////
    const handlePrintReport = () => {
        let somaValor = 0;
        const maskedValue = IMask.createMask({
            mask: 'R$ num',
            blocks: {
                num: {
                    mask: Number,
                    thousandsSeparator: '.',
                    radix: ',',
                    scale: 2,
                    signed: false,
                    normalizeZeros: true,
                    padFractionalZeros: true,
                }
            }
        });
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Relatório de Faturas</title>');
            printWindow.document.write('<style>');
            printWindow.document.write(`
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid black; padding: 2px; text-align: left; }
                th { background-color: #f2f2f2; }
            `);
            printWindow.document.write('</style></head><body>');
            printWindow.document.write('<h2>Relatório de Faturas</h2>');
            printWindow.document.write('<table>');
            printWindow.document.write('<tr><th>Cliente</th><th style="text-aling: center;">Vencimento</th><th style="text-aling: center;">Pagamento</th><th style="text-aling: right;">Valor</th><th>Forma de Pagamento</th></tr>');
            faturas.forEach((fatura) => {
                printWindow.document.write(`
                    <tr>
                        <td>${fatura.clienteNome}</td>
                        <td style="text-aling: center;">${fatura.dataVencimento ? new Date(fatura.dataVencimento).toLocaleDateString('pt-BR') : ''}</td>
                        <td style="text-aling: center;">${fatura.dataPagamento ? new Date(fatura.dataPagamento).toLocaleDateString('pt-BR') : 'Pendente'}</td>
                        <td style="text-aling: right;">${fatura.valorFinal}</td>
                        <td>${fatura.formaPagamentoDescricao}</td>
                    </tr>
                `);
                somaValor += parseFloat(fatura.valor);
            });
            maskedValue.resolve(somaValor.toFixed(2).replace('.', ','));
            const valorFinalTotal = maskedValue.value;
            printWindow.document.write(`<tr><td>Total</td><td></td><td></td><td>${valorFinalTotal}</td><td></td></tr>`);
            printWindow.document.write('</table>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } else {
            setAlertMessage("Erro ao gerar o relatório de impressão!");
        }
    };

    // Gera Todos os Boletos ////////////////////////////////////////////////////////////////////////////////////////
    const handleAllBoletos = async () => {

        let boletoHtml = `
            <html>
                <head>
                    <title>Boleto</title>
                <head>
                <style>
                    html, body, div, span, applet, object, iframe,
                    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
                    a, abbr, acronym, address, big, cite, code,
                    del, dfn, em, img, ins, kbd, q, s, samp,
                    small, strike, strong, sub, sup, tt, var,
                    b, u, i, center,
                    dl, dt, dd, ol, ul, li,
                    fieldset, form, label, legend,
                    table, caption, tbody, tfoot, thead, tr, th, td,
                    article, aside, canvas, details, embed, 
                    figure, figcaption, footer, header, hgroup, 
                    menu, nav, output, ruby, section, summary,
                    time, mark, audio, video {
                        margin: 0;
                        padding: 0;
                        border: 0;
                        font-size: 100%;
                        font: inherit;
                        vertical-align: baseline;
                    }
                    /* HTML5 display-role reset for older browsers */
                    article, aside, details, figcaption, figure, 
                    footer, header, hgroup, menu, nav, section {
                        display: block;
                    }
                    body {
                        line-height: 1;
                    }
                    ol, ul {
                        list-style: none;
                    }
                    blockquote, q {
                        quotes: none;
                    }
                    blockquote:before, blockquote:after,
                    q:before, q:after {
                        content: '';
                        content: none;
                    }
                    table {
                        border-collapse: collapse;
                        border-spacing: 0;
                    }
                    h1{
                        font-size: 14px;
                    }
                    p{
                        font-size: 12px;
                    }
                    .boleto {
                        page-break-after: always; /* Garante que cada boleto esteja em uma nova página */
                        margin-bottom: 20px;
                    }
                </style>
                <body>
        `

        for (const fatura of faturas) {

            const clientes = await sendGet('/clientes/04390988077');
            const clienteInfo = clientes.find((cliente: any) => cliente.id === fatura.id_cliente);
            const contratos = await sendGet('/contratos/04390988077');
            const contratoInfo = contratos.find((contrato: any) => contrato.id === fatura.id_contrato);
            const corretor = await getDataFromId(contratoInfo.id_corretor, '/corretores/04390988077', 'nome');

            boletoHtml += `
           <div style="font-family: Arial, sans-serif; padding: 20px;" class="boleto">
                <div style='width: 100%; display: flex; justify-content: space-between; align-items: flex-end;'>
                    <div id="logoContainer"></div> 
                    <div style='display: flex; flex-direction: column; align-items: flex-end; gap: 5px;'>
                        <h1 style="font-weight: bold;">Rádio Cultura Canguçu Ltda</h1>
                        <p>Rua Professor André Puente, 203</p>
                        <p>CEP: 96600-000 - Canguçu, Rio Grande do Sul, Brasil</p>
                        <p>CNPJ: 25.043.065/0001-45</p>
                        <p>Telefone: (53) 3252-1144 || (53) 9 9952-1144</p>
                        <p>E-mail: culturaam1030@gmail.com</p>
                    </div> 
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <div style="display: flex; justify-content: center; align-items: center;">
                    <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                        <div>
                            <p>Cliente:</p>
                            <h1 style="font-weight: bold;">${fatura.clienteNome}</h1>
                        </div>
                        <div>
                            <p>Endereço:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.endereco}</h1>
                        </div>
                        <div>
                            <p>Município:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.cidade}</h1>
                        </div>
                        <div>
                            <p>CNPJ:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.cnpj}</h1>
                        </div>
                    </div>
                    <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                        <div>
                            <p>Fone:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.fone}</h1>
                        </div>
                        <div>
                            <p>CEP:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.cep}</h1>
                        </div>
                        <div>
                            <p>Estado:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.estado}</h1>
                        </div>
                        <div>
                            <p>Programa:</p>
                            <h1 style="font-weight: bold;">${fatura.programaNome}</h1>
                        </div>
                    </div>
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p>Data de Emissão:</p>
                        <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataEmissao)}</h1>
                    </div>
                    <div>
                        <p>Data de Vencimento:</p>
                        <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataVencimento)}</h1>
                    </div>
                    <div>
                        <p>Data de Pagamento:</p>
                        <h1 style="font-weight: bold;">${fatura.dataPagamento ? convertIsoToDate(fatura.dataPagamento) : 'Pendente'}</h1>
                    </div>
                    <div>
                        <p>Valor:</p>
                        <h1 style="font-weight: bold;">${fatura.valorFinal}</h1>
                    </div>
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p>Corretor:</p>
                        <h1 style="font-weight: bold;">${corretor}</h1>
                    </div>
                    <div>
                        <p>Descrição:</p>
                        <h1 style="font-weight: bold;">${contratoInfo.descritivo}</h1>
                    </div>
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <p>Reconheço(emos) a exatidão desta Duplicata de Prestação de Serviço na importância acima que pagarei(emos) à Rádio Cultura Canguçu Ltda. no vencimento acima indicado.</p>
                <div style="display: flex; justify-content: center; align-items: center; gap: 200px; margin-top: 80px;">
                    <p style="border-top: 1px solid gray; padding: 5px 40px;">Assinatura do Emitente</p>
                    <p style="border-top: 1px solid gray; padding: 5px 40px;">Assinatura do Sacado</p>
                </div>
                <hr style="border: 3px dotted black; width: 100%; margin-top: 30px;" />
                <div style='width: 100%; display: flex; justify-content: space-between; align-items: flex-end;'>
                    <div id="logoContainer"></div> 
                    <div style='display: flex; flex-direction: column; align-items: flex-end; gap: 5px;'>
                        <h1 style="font-weight: bold;">Rádio Cultura Canguçu Ltda</h1>
                        <p>Rua Professor André Puente, 203</p>
                        <p>CEP: 96600-000 - Canguçu, Rio Grande do Sul, Brasil</p>
                        <p>CNPJ: 25.043.065/0001-45</p>
                        <p>Telefone: (53) 3252-1144 || (53) 9 9952-1144</p>
                        <p>E-mail: culturaam1030@gmail.com</p>
                    </div> 
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <div style="display: flex; justify-content: center; align-items: center;">
                    <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                        <div>
                            <p>Cliente:</p>
                            <h1 style="font-weight: bold;">${fatura.clienteNome}</h1>
                        </div>
                        <div>
                            <p>Endereço:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.endereco}</h1>
                        </div>
                        <div>
                            <p>Município:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.cidade}</h1>
                        </div>
                        <div>
                            <p>CNPJ:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.cnpj}</h1>
                        </div>
                    </div>
                    <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                        <div>
                            <p>Fone:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.fone}</h1>
                        </div>
                        <div>
                            <p>CEP:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.cep}</h1>
                        </div>
                        <div>
                            <p>Estado:</p>
                            <h1 style="font-weight: bold;">${clienteInfo.estado}</h1>
                        </div>
                        <div>
                            <p>Programa:</p>
                            <h1 style="font-weight: bold;">${fatura.programaNome}</h1>
                        </div>
                    </div>
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p>Data de Emissão:</p>
                        <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataEmissao)}</h1>
                    </div>
                    <div>
                        <p>Data de Vencimento:</p>
                        <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataVencimento)}</h1>
                    </div>
                    <div>
                        <p>Data de Pagamento:</p>
                        <h1 style="font-weight: bold;">${fatura.dataPagamento ? convertIsoToDate(fatura.dataPagamento) : 'Pendente'}</h1>
                    </div>
                    <div>
                        <p>Valor:</p>
                        <h1 style="font-weight: bold;">${fatura.valorFinal}</h1>
                    </div>
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p>Corretor:</p>
                        <h1 style="font-weight: bold;">${corretor}</h1>
                    </div>
                    <div>
                        <p>Descrição:</p>
                        <h1 style="font-weight: bold;">${contratoInfo.descritivo}</h1>
                    </div>
                </div>
                <hr style="border: 1px solid black; width: 100%;" />
            </div>
           `
        }

        boletoHtml += `
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(boletoHtml);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        } else {
            setAlertMessage("Erro ao gerar o relatório de impressão!");
        }

    }

    // Gera Boleto da Fatura ////////////////////////////////////////////////////////////////////////////////////////
    const handleBoletos = async (fatura: any) => {

        const clientes = await sendGet('/clientes/04390988077');
        const clienteInfo = clientes.find((cliente: any) => cliente.id === fatura.id_cliente);
        const contratos = await sendGet('/contratos/04390988077');
        const contratoInfo = contratos.find((contrato: any) => contrato.id === fatura.id_contrato);
        const corretor = await getDataFromId(contratoInfo.id_corretor, '/corretores/04390988077', 'nome');

        const boleto = `
            <html>
                <head>
                    <title>Boleto</title>
                <head>
                <style>
                    html, body, div, span, applet, object, iframe,
                    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
                    a, abbr, acronym, address, big, cite, code,
                    del, dfn, em, img, ins, kbd, q, s, samp,
                    small, strike, strong, sub, sup, tt, var,
                    b, u, i, center,
                    dl, dt, dd, ol, ul, li,
                    fieldset, form, label, legend,
                    table, caption, tbody, tfoot, thead, tr, th, td,
                    article, aside, canvas, details, embed, 
                    figure, figcaption, footer, header, hgroup, 
                    menu, nav, output, ruby, section, summary,
                    time, mark, audio, video {
                        margin: 0;
                        padding: 0;
                        border: 0;
                        font-size: 100%;
                        font: inherit;
                        vertical-align: baseline;
                    }
                    /* HTML5 display-role reset for older browsers */
                    article, aside, details, figcaption, figure, 
                    footer, header, hgroup, menu, nav, section {
                        display: block;
                    }
                    body {
                        line-height: 1;
                    }
                    ol, ul {
                        list-style: none;
                    }
                    blockquote, q {
                        quotes: none;
                    }
                    blockquote:before, blockquote:after,
                    q:before, q:after {
                        content: '';
                        content: none;
                    }
                    table {
                        border-collapse: collapse;
                        border-spacing: 0;
                    }
                    h1{
                        font-size: 14px;
                    }
                    p{
                        font-size: 12px;
                    }
                </style>
                <body>
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <div style='width: 100%; display: flex; justify-content: space-between; align-items: flex-end;'>
                            <div id="logoContainer"></div> 
                            <div style='display: flex; flex-direction: column; align-items: flex-end; gap: 5px;'>
                                <h1 style="font-weight: bold;">Rádio Cultura Canguçu Ltda</h1>
                                <p>Rua Professor André Puente, 203</p>
                                <p>CEP: 96600-000 - Canguçu, Rio Grande do Sul, Brasil</p>
                                <p>CNPJ: 25.043.065/0001-45</p>
                                <p>Telefone: (53) 3252-1144 || (53) 9 9952-1144</p>
                                <p>E-mail: culturaam1030@gmail.com</p>
                            </div> 
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <div style="display: flex; justify-content: center; align-items: center;">
                            <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                                <div>
                                    <p>Cliente:</p>
                                    <h1 style="font-weight: bold;">${fatura.clienteNome}</h1>
                                </div>
                                <div>
                                    <p>Endereço:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.endereco}</h1>
                                </div>
                                <div>
                                    <p>Município:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.cidade}</h1>
                                </div>
                                <div>
                                    <p>CNPJ:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.cnpj}</h1>
                                </div>
                            </div>
                            <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                                <div>
                                    <p>Fone:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.fone}</h1>
                                </div>
                                <div>
                                    <p>CEP:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.cep}</h1>
                                </div>
                                <div>
                                    <p>Estado:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.estado}</h1>
                                </div>
                                <div>
                                    <p>Programa:</p>
                                    <h1 style="font-weight: bold;">${fatura.programaNome}</h1>
                                </div>
                            </div>
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p>Data de Emissão:</p>
                                <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataEmissao)}</h1>
                            </div>
                            <div>
                                <p>Data de Vencimento:</p>
                                <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataVencimento)}</h1>
                            </div>
                            <div>
                                <p>Data de Pagamento:</p>
                                <h1 style="font-weight: bold;">${fatura.dataPagamento ? convertIsoToDate(fatura.dataPagamento) : 'Pendente'}</h1>
                            </div>
                            <div>
                                <p>Valor:</p>
                                <h1 style="font-weight: bold;">${fatura.valorFinal}</h1>
                            </div>
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p>Corretor:</p>
                                <h1 style="font-weight: bold;">${corretor}</h1>
                            </div>
                            <div>
                                <p>Descrição:</p>
                                <h1 style="font-weight: bold;">${contratoInfo.descritivo}</h1>
                            </div>
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <p>Reconheço(emos) a exatidão desta Duplicata de Prestação de Serviço na importância acima que pagarei(emos) à Rádio Cultura Canguçu Ltda. no vencimento acima indicado.</p>
                        <div style="display: flex; justify-content: center; align-items: center; gap: 200px; margin-top: 80px;">
                            <p style="border-top: 1px solid gray; padding: 5px 40px;">Assinatura do Emitente</p>
                            <p style="border-top: 1px solid gray; padding: 5px 40px;">Assinatura do Sacado</p>
                        </div>

                        <hr style="border: 3px dotted black; width: 100%; margin-top: 30px;" />

                        <div style='width: 100%; display: flex; justify-content: space-between; align-items: flex-end;'>
                            <div id="logoContainer"></div> 
                            <div style='display: flex; flex-direction: column; align-items: flex-end; gap: 5px;'>
                                <h1 style="font-weight: bold;">Rádio Cultura Canguçu Ltda</h1>
                                <p>Rua Professor André Puente, 203</p>
                                <p>CEP: 96600-000 - Canguçu, Rio Grande do Sul, Brasil</p>
                                <p>CNPJ: 25.043.065/0001-45</p>
                                <p>Telefone: (53) 3252-1144 || (53) 9 9952-1144</p>
                                <p>E-mail: culturaam1030@gmail.com</p>
                            </div> 
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <div style="display: flex; justify-content: center; align-items: center;">
                            <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                                <div>
                                    <p>Cliente:</p>
                                    <h1 style="font-weight: bold;">${fatura.clienteNome}</h1>
                                </div>
                                <div>
                                    <p>Endereço:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.endereco}</h1>
                                </div>
                                <div>
                                    <p>Município:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.cidade}</h1>
                                </div>
                                <div>
                                    <p>CNPJ:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.cnpj}</h1>
                                </div>
                            </div>
                            <div style="width: 50%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                                <div>
                                    <p>Fone:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.fone}</h1>
                                </div>
                                <div>
                                    <p>CEP:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.cep}</h1>
                                </div>
                                <div>
                                    <p>Estado:</p>
                                    <h1 style="font-weight: bold;">${clienteInfo.estado}</h1>
                                </div>
                                <div>
                                    <p>Programa:</p>
                                    <h1 style="font-weight: bold;">${fatura.programaNome}</h1>
                                </div>
                            </div>
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p>Data de Emissão:</p>
                                <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataEmissao)}</h1>
                            </div>
                            <div>
                                <p>Data de Vencimento:</p>
                                <h1 style="font-weight: bold;">${convertIsoToDate(fatura.dataVencimento)}</h1>
                            </div>
                            <div>
                                <p>Data de Pagamento:</p>
                                <h1 style="font-weight: bold;">${fatura.dataPagamento ? convertIsoToDate(fatura.dataPagamento) : 'Pendente'}</h1>
                            </div>
                            <div>
                                <p>Valor:</p>
                                <h1 style="font-weight: bold;">${fatura.valorFinal}</h1>
                            </div>
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p>Corretor:</p>
                                <h1 style="font-weight: bold;">${corretor}</h1>
                            </div>
                            <div>
                                <p>Descrição:</p>
                                <h1 style="font-weight: bold;">${contratoInfo.descritivo}</h1>
                            </div>
                        </div>
                        <hr style="border: 1px solid black; width: 100%;" />
                    </div>
                </body>
            </html>
        `

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(boleto);

            const img = printWindow.document.createElement('img');
            img.src = CulturaLogo;
            img.style.width = '200px';
            img.style.height = 'auto';
            const logoContainer = printWindow.document.getElementById('logoContainer');
            if (logoContainer) {
                logoContainer.appendChild(img);
            }

            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            setAlertMessage("Erro ao gerar o relatório de impressão!");
        }

    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Fatuaras</CardTitle>
                    <CardDescription>Aqui você pode ver e gerar novas faturas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between w-11/12 m-auto my-3">
                        <div>
                            <Label>Buscar entre datas de Vencimento</Label>
                            <div className="flex items-center justify-start gap-2">
                                <Select onValueChange={(value) => setSituacaoFaturaSearch(value)} value={situacaoFaturaSearch}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Situação'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="todos" >Todos</SelectItem>
                                            <SelectItem value="pendentes">Pendentes</SelectItem>
                                            <SelectItem value="pagas">Pagas</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={(value) => setTipoDataSearch(value)} value={tipoDataSearch}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Tipo de Data'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="vencimento" >Vencimento</SelectItem>
                                            <SelectItem value="pagamento">Pagamento</SelectItem>
                                            <SelectItem value="emissao">Emissão</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Input placeholder="Inicio" ref={dataInicioSearchRef} value={dataInicioSearch} onInput={(e: any) => setDataInicioSearch(e.target.value)} />
                                <Input placeholder="Fim" ref={dataFimSearchRef} value={dataFimSearch} onInput={(e: any) => setDataFimSearch(e.target.value)} />
                                <Button variant={"secondary"} onClick={showFaturas}><Search size={20} /></Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant={"secondary"} onClick={handlePrintReport}>Imprimir Relatório</Button>
                            <Button onClick={handleConfigs}>Gerar Faturas</Button>
                            <Button onClick={handleAllBoletos}>Imprimir Faturas</Button>
                        </div>
                    </div>
                    <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[60vh] overflow-y-auto">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead align="left">Cliente</TableHead>
                                    <TableHead align="left">Programa</TableHead>
                                    <TableHead align="left">Data Emissão</TableHead>
                                    <TableHead align="left">Data Vencimento</TableHead>
                                    <TableHead align="left">Data Pagamento</TableHead>
                                    <TableHead align="left">Valor</TableHead>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {faturas.map((fatura) => (
                                    <TableRow key={fatura.id}>
                                        <TableCell>{fatura.clienteNome}</TableCell>
                                        <TableCell>{fatura.programaNome}</TableCell>
                                        <TableCell>{convertIsoToDate(fatura.dataEmissao)}</TableCell>
                                        <TableCell>{convertIsoToDate(fatura.dataVencimento)}</TableCell>
                                        <TableCell>{fatura.dataPagamento ? convertIsoToDate(fatura.dataPagamento) : 'Pendente'}</TableCell>
                                        <TableCell>{fatura.valorFinal}</TableCell>
                                        {!fatura.dataPagamento ? (
                                            <TableCell>
                                                <CircleCheckBig className="w-4 h-4 cursor-pointer" onClick={() => hendleOpenPayment(fatura)} />
                                            </TableCell>
                                        ) : <TableCell></TableCell>}
                                        <TableCell>
                                            <Printer className="w-4 h-4 cursor-pointer" onClick={() => handleBoletos(fatura)} />
                                        </TableCell>
                                        <TableCell>
                                            <Trash className="w-4 h-4 cursor-pointer" onClick={() => {
                                                setAlertConfirmMessage("Tem certeza que deseja excluir esta fatura?")
                                                setSelectedFatura(fatura);
                                            }} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Informações para gerar faturas</DialogTitle>
                    </DialogHeader>
                    <form action="" className="flex flex-col">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Mes</Label>
                                <Select onValueChange={(value) => setMes(value)} value={mes}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Mês'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="1" >Janeiro</SelectItem>
                                            <SelectItem value="2">Fevereiro</SelectItem>
                                            <SelectItem value="3">Março</SelectItem>
                                            <SelectItem value="4">Abril</SelectItem>
                                            <SelectItem value="5">Maio</SelectItem>
                                            <SelectItem value="6">Junho</SelectItem>
                                            <SelectItem value="7">Julho</SelectItem>
                                            <SelectItem value="8">Agosto</SelectItem>
                                            <SelectItem value="9">Setembro</SelectItem>
                                            <SelectItem value="10">Outubro</SelectItem>
                                            <SelectItem value="11">Novembro</SelectItem>
                                            <SelectItem value="12">Dezembro</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Ano</Label>
                                <Input placeholder="Ano" type="number" value={ano} onChange={(e: any) => setAno(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant={"outline"}>Cancelar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar pagamento de fatura</DialogTitle>
                    </DialogHeader>
                    <form action="" className="flex flex-col">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Data de pagamento</Label>
                                <Input placeholder="Data de pagamento" type="text" ref={dataPagamentoRef} value={dataPagamento} onChange={(e: any) => setDataPagamento(e.target.value)} />
                            </div>
                            <div>
                                <Label>Mes</Label>
                                <Select onValueChange={(value) => setMetodoPagamento(value)} value={metodoPagamento}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Forma de Pagamento'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {formasPagamento.map((formas) => (
                                                <SelectItem key={formas.id} value={formas.formaPagamento}>{formas.formaPagamento}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant={"outline"}>Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handlePaymanent}>Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />}
            {alertConfirmMessage && <CustomConfirmDialog message={alertConfirmMessage} onConfirm={() => handleDelete(selectedFatura.id)} onCancel={() => setAlertConfirmMessage(null)} />}
        </div>
    )
}