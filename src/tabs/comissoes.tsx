import { sendGet, sendPost, sendPut, sendDelete, getIdFromData, getDataFromId } from '../functions';
import { Trash, Pencil, Search, HandHelping } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/table';
import { useState, useEffect, useRef } from 'react';
import IMask from 'imask';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { CustomAlertDialog } from '../components/alert';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function Comissoes() {

    interface CorretorData {
        id: number;
        chave: string,
        nome: string,
        endereco: string,
        email: string,
        fone: string,
        dataAdmissao: string,
    }

    interface FaturaData {
        id: number;
        chave: string,
        id_cliente: number,
        id_contrato: number,
        id_programa: number,
        dataEmissao: string,
        dataVencimento: string,
        dataPagamento: string,
        valor: string,
        id_formaPagamento: number,
        descritivo: string,
    }

    interface FaturaCompletasData {
        id: number;
        chave: string,
        nomeFantasia: string,
        id_cliente: number,
        id_contrato: number,
        id_programa: number,
        id_corretor: number,
        dataEmissao: string,
        dataVencimento: string,
        dataPagamento: string,
        valor: string,
        id_formaPagamento: number,
        descritivo: string,
        comissao: string,
        comissaoCorretor: number,
    }

    interface ContratoData {
        id: number;
        chave: string,
        id_cliente: number,
        id_programa: number,
        dataEmissao: string,
        numInsercoes: number,
        valor: string,
        id_formaPagamento: number,
        diaVencimento: string,
        comissao: string,
        status: string,
        id_corretor: number,
        descritivo: string,
    }

    const [dataInicioSearch, setDataInicioSearch] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('pt-BR'));
    const [dataFimSearch, setDataFimSearch] = useState(new Date().toLocaleDateString('pt-BR'));
    const dataInicioSearchRef = useRef<HTMLInputElement>(null);
    const dataFimSearchRef = useRef<HTMLInputElement>(null);

    const [corretores, setCorretores] = useState<CorretorData[]>([]);
    const [corretor, setCorretor] = useState('');

    const [faturasFiltradas, setFaturasFiltradas] = useState<FaturaCompletasData[]>([]);

    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        loadCorretores();
    }, []);

    useEffect(() => {
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

    const loadCorretores = async () => {
        const response = await sendGet('/corretores/04390988077');
        if (response) {
            setCorretores(response);
        } else {
            setAlertMessage("Erro ao carregar os corretores!");
        }
    }

    const handleSearch = async () => {
        try {
            let faturas: FaturaData[] = await sendGet('/faturamento/04390988077');
            if (!faturas) {
                setAlertMessage('Erro ao carregar as faturas');
                return;
            }
            const faturasCompletas: FaturaCompletasData[] = await Promise.all(
                faturas.map(async (fatura: FaturaData) => {
                    const contratoFatura: ContratoData[] = await sendGet(`/contratos/04390988077/${fatura.id_contrato}`);
                    const clienteFatura = await sendGet(`/clientes/04390988077/${contratoFatura[0].id_cliente}`);
                    const comissaoCorretor = parseFloat(fatura.valor) * (parseFloat(contratoFatura[0].comissao) / 100)
                    return {
                        ...fatura,
                        id_corretor: contratoFatura[0].id_corretor,
                        nomeFantasia: clienteFatura[0].nomeFantasia,
                        comissao: contratoFatura[0].comissao,
                        comissaoCorretor: comissaoCorretor,
                    };
                })
            );
            const dataInicio = new Date(dataInicioSearch.split('/').reverse().join('-')).setHours(0, 0, 0, 0);
            const dataFim = new Date(dataFimSearch.split('/').reverse().join('-')).setHours(23, 59, 59, 999);
            const idCorretorSelecionado = await getIdFromData(corretor, 'nome', '/corretores/04390988077')

            const faturasFiltradas = faturasCompletas.filter((fatura: FaturaCompletasData) => {
                const dataPagamento = new Date(fatura.dataPagamento).getTime();
                return (
                    fatura.id_corretor === parseInt(idCorretorSelecionado) &&
                    dataPagamento >= dataInicio &&
                    dataPagamento <= dataFim
                );
            });
            console.log(faturasFiltradas)
            setFaturasFiltradas(faturasFiltradas);
        } catch (error) {
            console.log(error)
            setAlertMessage('Erro ao buscar faturas.');
        }
    };

    const handlePrint = async () => {
        let somaValor = 0;
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
            printWindow.document.write('<h1>Relatório de Faturas</h1>');
            printWindow.document.write(`<h2>Corretor: ${corretor}</h2>`);
            printWindow.document.write('<table>');
            printWindow.document.write('<tr><th>Nome Fantasia</th><th style="text-aling: center;">Vencimento</th><th style="text-aling: center;">Pagamento</th><th style="text-aling: right;">Valor</th><th>Comissão(%)</th><th style="text-aling: right;">Comissão(R$)</th></tr>');
            faturasFiltradas.forEach((fatura) => {
                printWindow.document.write(`
                    <tr>
                        <td>${fatura.nomeFantasia}</td>
                        <td style="text-aling: center;">${new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}</td >
                        <td style="text-aling: center;">${new Date(fatura.dataPagamento).toLocaleDateString('pt-BR')}</td>
                        <td style="text-aling: right;">${parseFloat(fatura.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style="text-aling: right;">${fatura.comissao}</td>
                        <td>${fatura.comissaoCorretor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
        `);
                somaValor += fatura.comissaoCorretor;
            });
            printWindow.document.write(`<tr><td><strong>Total</strong></td><td></td><td></td><td><td></td><td><strong>${somaValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td></tr> `);
            printWindow.document.write('</table>');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();    
        } else {
            setAlertMessage("Erro ao gerar o relatório de impressão!");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comissões</CardTitle>
                <CardDescription>Aqui você pode ver e as comissões para os corretores cadastrados.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-2 w-11/12 m-auto mb-2">
                    <div className='flex items-end gap-2'>
                        <div>
                            <Label>Data de Início</Label>
                            <Input className='w-auto' ref={dataInicioSearchRef} value={dataInicioSearch} onChange={(e: any) => setDataInicioSearch(e.target.value)} placeholder='Data de Início' />
                        </div>
                        <div>
                            <Label>Data Final   </Label>
                            <Input className='w-auto' ref={dataFimSearchRef} value={dataFimSearch} onChange={(e: any) => setDataFimSearch(e.target.value)} placeholder='Data Final' />
                        </div>
                        <div className='w-60'>
                            <Label>Corretor</Label>
                            <Select onValueChange={(value) => setCorretor(value)} value={corretor}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Corretor'></SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {corretores.map((corretor) => (
                                            <SelectItem key={corretor.id} value={corretor.nome}>{corretor.nome}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleSearch}>
                            <Search size={20} />
                        </Button>
                    </div>
                    <Button onClick={handlePrint}>Imprimir Relatório</Button>
                </div>
                <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[60vh] overflow-y-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead align="left">Nome Fantasia</TableHead>
                                <TableHead align="left">Data Vencimento</TableHead>
                                <TableHead align="left">Data Pagamento</TableHead>
                                <TableHead align="left">Valor</TableHead>
                                <TableHead align="left">Comissão(%)</TableHead>
                                <TableHead align="left">Comissão(R$)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {faturasFiltradas.map((fatura) => (
                                <TableRow key={fatura.id}>
                                    <TableCell>{fatura.nomeFantasia}</TableCell>
                                    <TableCell>{new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>{new Date(fatura.dataPagamento).toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell>{parseFloat(fatura.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{fatura.comissao}%</TableCell>
                                    <TableCell>{fatura.comissaoCorretor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage('')} />}
        </Card>
    )
}