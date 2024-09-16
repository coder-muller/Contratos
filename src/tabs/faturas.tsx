import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../components/ui/select";
import { sendGet, sendPost, getDataFromId, convertIsoToDate, sendDelete, parseDate, isValidDate, sendPut, getIdFromData } from "../functions";
import { Search, Trash, CircleCheckBig } from 'lucide-react';
import IMask from 'imask';
import { CustomAlertDialog, CustomConfirmDialog } from "../components/alert";

export default function Faturas() {

    const dataInicioSearchRef = useRef<HTMLInputElement>(null);
    const dataFimSearchRef = useRef<HTMLInputElement>(null);
    const dataPagamentoRef = useRef<HTMLInputElement>(null);

    const [dataInicioSearch, setDataInicioSearch] = useState(new Date( new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('pt-BR'));
    const [dataFimSearch, setDataFimSearch] = useState(new Date().toLocaleDateString('pt-BR'));
    const [formasPagamento, setFormasPagamento] = useState<any[]>([]);

    const [situacaoFaturaSearch, setSituacaoFaturaSearch] = useState('todos');
    const [tipoDataSearch, setTipoDataSearch] = useState('vencimento');
    const [selectedFatura, setSelectedFatura] = useState<any>(null);
    const [dataPagamento, setDataPagamento] = useState('');
    const [metodoPagamento, setMetodoPagamento] = useState('');
    const [faturas, setFaturas] = useState<any[]>([]);
    const [faturasFiltradas, setFaturasFiltradas] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [mes, setMes] = useState((Number(new Date().getMonth()) + 2).toString());
    const [ano, setAno] = useState(Number(new Date().getFullYear()));

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertConfirmMessage, setAlertConfirmMessage] = useState<string | null>(null);

    useEffect(() => {
        loadFaturas();
        handleSearch();
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
            handleSearch();
        }
    }, [situacaoFaturaSearch]);

    useEffect(() => {
        if (tipoDataSearch) {
            handleSearch();
        }
    }, [tipoDataSearch]);

    useEffect(() => {
        handleSearch();
    }, [situacaoFaturaSearch, tipoDataSearch]);
    useEffect(() => {
        handleSearch();
    }, []);

    const loadFaturas = async () => {
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
            setFaturas(faturasCompletas);
            setFaturasFiltradas(faturasCompletas);
        } else {
            setAlertMessage("Erro ao carregar as faturas!");
        }
    }

    const loadFormasPagamento = async () => {
        const response = await sendGet('/formaPagamento/04390988077');
        if (response) {
            setFormasPagamento(response);
        } else {
            setAlertMessage("Erro ao carregar os formas de pagamento!");
        }
    }

    const handleSearch = async () => {
        const dataInicio = dataInicioSearchRef.current?.value;
        const dataFim = dataFimSearchRef.current?.value;

        if (!dataInicio || !dataFim) {
            await loadFaturas();
            return;
        }
        if (dataInicio && dataFim && isValidDate(dataInicio) && isValidDate(dataFim)) {
            const inicioDate = parseDate(dataInicio);
            const fimDate = parseDate(dataFim);

            if (!inicioDate || !fimDate) {
                setAlertMessage("Datas inválidas!");
                return;
            }

            const tipoData = tipoDataSearch;
            const situacao = situacaoFaturaSearch;
            let faturasFiltradas = faturas;
            if (situacao === 'pendentes') {
                faturasFiltradas = faturasFiltradas.filter(fatura => fatura.dataPagamento === null);
            } else if (situacao === 'pagas') {
                faturasFiltradas = faturasFiltradas.filter(fatura => fatura.dataPagamento !== null);
            }
            if (tipoData === 'vencimento') {
                faturasFiltradas = faturasFiltradas.filter(fatura => {
                    const dataVencimento = new Date(fatura.dataVencimento);
                    return dataVencimento >= inicioDate && dataVencimento <= fimDate;
                });
            } else if (tipoData === 'pagamento') {
                faturasFiltradas = faturasFiltradas.filter(fatura => {
                    const dataPagamento = fatura.dataPagamento ? new Date(fatura.dataPagamento) : null;
                    return dataPagamento && dataPagamento >= inicioDate && dataPagamento <= fimDate;
                });
            } else if (tipoData === 'emissao') {
                faturasFiltradas = faturasFiltradas.filter(fatura => {
                    const dataEmissao = new Date(fatura.dataEmissao);
                    return dataEmissao >= inicioDate && dataEmissao <= fimDate;
                });
            }
            setFaturasFiltradas(faturasFiltradas);
        } else {
            setAlertMessage("Datas inválidas!");
        }
    };


    const handleConfigs = async () => {
        setIsDialogOpen(true);
    };



    const hendleGenerate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!ano || ano < new Date().getFullYear()) {
            setAlertMessage("Ano inválido!");
            return;
        }
        setIsDialogOpen(false);
        const contratos = await sendGet('/contratos/04390988077');
        if (contratos) {
            const activeContratos = contratos.filter((contrato: any) => contrato.status === 'ativo');
            if (activeContratos.length === 0) {
                setAlertMessage("Não há contratos ativos para gerar faturas!");
                return;
            }
            for (const contrato of activeContratos) {
                const check = await sendGet('/faturamento/04390988077');
                const dataVencimentoContrato = new Date(ano, (Number(mes) - 1), Number(contrato.diaVencimento));
                let filter = check.filter((fatura: any) => fatura.id_contrato === contrato.id);
                filter = filter.filter((fatura: any) => {
                    const dataVencimentoFatura = new Date(fatura.dataVencimento);
                    return dataVencimentoFatura.getTime() === dataVencimentoContrato.getTime();
                });
                if (filter.length > 0) {
                    continue;
                }
                const body = {
                    chave: '04390988077',
                    id_cliente: contrato.id_cliente,
                    id_contrato: contrato.id,
                    id_programa: contrato.id_programa,
                    dataEmissao: new Date(),
                    dataVencimento: dataVencimentoContrato,
                    valor: contrato.valor,
                    id_formaPagamento: contrato.id_formaPagamento,
                };
                await sendPost('/faturamento', body);
            }
            setAlertMessage("Faturas geradas com sucesso!");
            await handleSearch();
        } else {
            setAlertMessage("Erro ao carregar os contratos!");
        }
    };

    const handleDelete = async (id: string) => {
        const body = { usuario: 'Guilherme' };
        const response = await sendDelete(`/faturamento/${id}`, body);
        if (response) {
            await loadFaturas();
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
                await loadFaturas();
                await handleSearch();
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
            printWindow.document.write('<tr><th>Cliente</th><th>Vencimento</th><th>Pagamento</th><th>Valor</th><th>Forma de Pagamento</th></tr>');
            faturasFiltradas.forEach((fatura) => {
                printWindow.document.write(`
                    <tr>
                        <td>${fatura.clienteNome}</td>
                        <td>${fatura.dataVencimento ? new Date(fatura.dataVencimento).toLocaleDateString('pt-BR') : ''}</td>
                        <td>${fatura.dataPagamento ? new Date(fatura.dataPagamento).toLocaleDateString('pt-BR'  ) : 'Pendente'}</td>
                        <td>${fatura.valorFinal}</td>
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
                                <Button variant={"secondary"} onClick={handleSearch}><Search size={20} /></Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <Button variant={"secondary"} onClick={handlePrintReport}>Imprimir Relatório</Button>
                            <Button onClick={handleConfigs}>Gerar Faturas</Button>
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
                                {faturasFiltradas.map((fatura) => (
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
                            <Button type="button" onClick={hendleGenerate}>Gerar</Button>
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
