import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTitle } from "../components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Trash, Pencil, ScrollText } from "lucide-react";
import { convertIsoToDate, sendGet, sendDelete, sendPost, sendPut, parseDate, getDataFromId, floatParaInput, converterParaNumero, isValidDate, getIdFromData } from "../functions";
import IMask from 'imask';
import { Label } from "../components/ui/label";
import { CustomAlertDialog, CustomConfirmDialog } from "../components/alert";

export default function Contratos() {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContrato, setSelectedContrato] = useState<any>(null);
    const [isDialogConfigOpen, setIsDialogConfigOpen] = useState(false);

    const valorRef = useRef(null);
    const dataEmissaoRef = useRef(null);
    const dataVencimentoRef = useRef(null);
    const diaVencimentoRef = useRef(null);
    const comissaoRef = useRef(null);
    const anoRef = useRef(null);

    const [clientes, setClientes] = useState<any[]>([]);
    const [contratos, setContratos] = useState<any[]>([]);
    const [corretores, setCorretores] = useState<any[]>([]);
    const [programas, setProgramas] = useState<any[]>([]);
    const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
    const [statusSearch, setStatusSearch] = useState<any>('ativo');

    const [cliente, setCliente] = useState('');
    const [programa, setPrograma] = useState('');
    const [dataEmissao, setDataEmissao] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [numeroInsercoes, setNumeroInsercoes] = useState('');
    const [valor, setValor] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [comissao, setComissao] = useState('');
    const [status, setStatus] = useState('');
    const [corretor, setCorretor] = useState('');
    const [descritivo, setDescritivo] = useState('');
    const [diaVencimento, setDiaVencimento] = useState('');

    const [mes, setMes] = useState((Number(new Date().getMonth()) + 2).toString());
    const [ano, setAno] = useState(Number(new Date().getFullYear()));

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertConfirmMessage, setAlertConfirmMessage] = useState<string | null>(null);
    const [alertDeleteFaturasFuturas, setAlertDeleteFaturasFuturas] = useState<string | null>(null);
    const [faturasPendentes, setFaturasPendentes] = useState<any[]>([]);

    useEffect(() => {
        loadContratos();
        loadClientes();
        loadProgramas();
        loadCorretores();
        loadFormasPagamento();
        setStatus('todos');
    }, [])

    useEffect(() => {
        loadContratos();
    }, [statusSearch]);

    useEffect(() => {
        if (isDialogConfigOpen) {
            const applyMasks = () => {

            }
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }

    }, [isDialogConfigOpen]);


    useEffect(() => {
        if (isDialogOpen) {
            const applyMasks = () => {
                if (valorRef.current) {
                    IMask(valorRef.current, {
                        mask: 'R$ num',
                        blocks: {
                            num: {
                                mask: Number,
                                thousandsSeparator: '.',
                                radix: ',',
                                scale: 2,
                                signed: false,
                                normalizeZeros: true,
                            },
                        },
                    });
                }
                if (dataEmissaoRef.current) {
                    IMask(dataEmissaoRef.current, {
                        mask: '00/00/0000',
                    });
                }
                if (dataVencimentoRef.current) {
                    IMask(dataVencimentoRef.current, {
                        mask: '00/00/0000',
                    });
                }
                if (diaVencimentoRef.current) {
                    IMask(diaVencimentoRef.current, {
                        mask: '00',
                    });
                }
            }
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const loadContratos = async () => {
        try {
            const response = await sendGet('/contratos/04390988077');
            let filteredContratos: any[] = [];
            if (statusSearch !== 'todos') {
                filteredContratos = response.filter((contrato: any) => contrato.status == statusSearch);
            } else {
                filteredContratos = response;
            }
            console.log(filteredContratos);
            if (filteredContratos) {
                const contratosCompletos = await Promise.all(filteredContratos.map(async (contrato: any) => {
                    const valorNumerico = parseFloat(contrato.valor);
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
                    const comissaoString = (contrato.comissao).toString();
                    const comissaoFinal = (comissaoString).replace('.', ',');

                    const clienteNome = await getDataFromId(contrato.id_cliente, '/clientes/04390988077', 'nomeFantasia');
                    const programaNome = await getDataFromId(contrato.id_programa, '/programacao/04390988077', 'programa');
                    const corretorNome = await getDataFromId(contrato.id_corretor, '/corretores/04390988077', 'nome');
                    const formaPagamentoDescricao = await getDataFromId(contrato.id_formaPagamento, '/formaPagamento/04390988077', 'formaPagamento');

                    return {
                        ...contrato,
                        comissaoFinal,
                        valorFinal, // Usa o valor formatado aqui
                        clienteNome,
                        programaNome,
                        corretorNome,
                        formaPagamentoDescricao,
                    };
                }));
                setContratos(contratosCompletos);
            } else {
                setAlertMessage("Erro ao carregar os contratos!");
            }
        } catch (error) {
            console.error("Error loading contratos:", error);
            setAlertMessage("Ocorreu um erro ao carregar os contratos!");
        }
    };

    const loadClientes = async () => {
        const response = await sendGet('/clientes/04390988077');
        if (response) {
            setClientes(response);
        } else {
            setAlertMessage("Erro ao carregar os clientes!");
        }
    }

    const loadProgramas = async () => {
        const response = await sendGet('/programacao/04390988077');
        if (response) {
            setProgramas(response);
        } else {
            setAlertMessage("Erro ao carregar os programas!");
        }
    }

    const loadCorretores = async () => {
        const response = await sendGet('/corretores/04390988077');
        if (response) {
            setCorretores(response);
        } else {
            setAlertMessage("Erro ao carregar os corretores!");
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

    const handleDelete = async (id: string) => {
        const body = { usuario: 'Guilherme' };
        const response = await sendDelete(`/contratos/${id}`, body);
        if (response) {
            loadContratos();
        } else {
            setAlertMessage("Erro ao deletar o contrato!");
            console.log(response);
        }
        setAlertConfirmMessage(null);
    }

    const handleAdd = () => {
        setSelectedContrato(null);
        resetForm();
        setIsDialogOpen(true);
        setDataEmissao(convertIsoToDate((new Date()).toDateString()));
    }

    const resetForm = () => {
        setCliente('');
        setPrograma('');
        setDataEmissao('')
        setDataVencimento('')
        setNumeroInsercoes('')
        setValor('')
        setFormaPagamento('')
        setComissao('')
        setStatus('ativo')
        setCorretor('')
        setDescritivo('')
        setDiaVencimento('')
    }

    async function handleEdit(contrato: any) {
        setSelectedContrato(contrato);
        const [cliente, programa, formaPagamento, corretor] = await Promise.all([
            getDataFromId(contrato.id_cliente, '/clientes/04390988077', 'nomeFantasia'),
            getDataFromId(contrato.id_programa, '/programacao/04390988077', 'programa'),
            getDataFromId(contrato.id_formaPagamento, '/formaPagamento/04390988077', 'formaPagamento'),
            getDataFromId(contrato.id_corretor, '/corretores/04390988077', 'nome')
        ]);
        setCliente(cliente);
        setPrograma(programa);
        setFormaPagamento(formaPagamento);
        setCorretor(corretor);
        setDataEmissao(convertIsoToDate(contrato.dataEmissao));
        setDataVencimento(convertIsoToDate(contrato.dataVencimento));
        setNumeroInsercoes(contrato.numInsercoes);
        setValor(floatParaInput(contrato.valor));
        setComissao(contrato.comissao);
        setStatus(contrato.status);
        setDescritivo(contrato.descritivo);
        setDiaVencimento(contrato.diaVencimento);
        setIsDialogOpen(true);
    }

    const gerarFaturasEntreDatas = async (
        dataInicio: Date,
        dataFim: Date,
        diaVencimento: number,
        selectedContrato: any
    ) => {
        const dataAtual = new Date(dataInicio);
        const faturas = [];

        while (dataAtual <= dataFim) {
            const ano = dataAtual.getFullYear();
            const mes = dataAtual.getMonth();

            const dataVencimento = new Date(ano, mes, diaVencimento);

            if (dataVencimento >= dataInicio && dataVencimento <= dataFim) {
                const body = {
                    chave: '04390988077',
                    id_cliente: selectedContrato.id_cliente,
                    id_contrato: selectedContrato.id,
                    id_programa: selectedContrato.id_programa,
                    dataEmissao: new Date(),
                    dataVencimento: dataVencimento,
                    valor: selectedContrato.valor,
                    id_formaPagamento: selectedContrato.id_formaPagamento,
                };

                await sendPost('/faturamento', body);
                faturas.push(body);
            }
            dataAtual.setMonth(dataAtual.getMonth() + 1);
        }

        setAlertMessage(`${faturas.length} faturas geradas com sucesso!`);
        return faturas;
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cliente && programa) {

            if (dataEmissao) {
                if (!isValidDate(dataEmissao)) {
                    setAlertMessage("A data de emissão não é valida");
                    return;
                }
            }
            if (dataVencimento) {
                if (!isValidDate(dataVencimento)) {
                    setAlertMessage("A data de vencimento não é valida");
                    return;
                }
            }
            if (diaVencimento) {
                if (parseInt(diaVencimento) > 28) {
                    setAlertMessage("A data de vencimento deves ser menor que 28!");
                    return;
                }
            } else {
                setAlertMessage("Preencha o dia de vencimento!");
                return;
            }
            const body = {
                chave: '04390988077',
                id_cliente: await getIdFromData(cliente, 'nomeFantasia', '/clientes/04390988077'),
                id_programa: await getIdFromData(programa, 'programa', '/programacao/04390988077'),
                dataEmissao: dataEmissao ? parseDate(dataEmissao) : '',
                dataVencimento: dataVencimento ? parseDate(dataVencimento) : '',
                numInsercoes: numeroInsercoes,
                valor: converterParaNumero(valor),
                id_formaPagamento: await getIdFromData(formaPagamento, 'formaPagamento', '/formaPagamento/04390988077'),
                diaVencimento,
                comissao,
                status,
                id_corretor: await getIdFromData(corretor, 'nome', '/corretores/04390988077'),
                descritivo
            };
            console.log(body);
            try {
                let createdContrato;
                if (selectedContrato) {
                    await sendPut(`/contratos/${selectedContrato.id}`, body);
                    setSelectedContrato(null);
                } else {
                    createdContrato = await sendPost('/contratos', body);
                }

                if (createdContrato) {
                    const contrato = createdContrato;
                    await gerarFaturasEntreDatas(
                        new Date(contrato.dataEmissao),
                        new Date(contrato.dataVencimento),
                        parseInt(diaVencimento),
                        contrato
                    );
                }
                loadContratos();
                setIsDialogOpen(false);
                resetForm();
                setAlertMessage("Contrato e faturas gerados com sucesso!");
            }
            catch (error) {
                setAlertMessage("Erro ao processar a solicitação");
            }
        } else {
            setAlertMessage("Preencha os campos obrigatórios (Cliente e Programa)!")
        }
    }

    const gerarFaturaIndividual = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!ano || ano < new Date().getFullYear()) {
            setAlertMessage("Ano inválido!");
            return;
        }
        setIsDialogConfigOpen(false);
        const dataVencimentoContrato = new Date(ano, (Number(mes) - 1), Number(selectedContrato.diaVencimento));
        const body = {
            chave: '04390988077',
            id_cliente: selectedContrato.id_cliente,
            id_contrato: selectedContrato.id,
            id_programa: selectedContrato.id_programa,
            dataEmissao: new Date(),
            dataVencimento: dataVencimentoContrato,
            valor: selectedContrato.valor,
            id_formaPagamento: selectedContrato.id_formaPagamento,
        };
        await sendPost('/faturamento', body);
        setAlertMessage("Fatura gerada com sucesso!");
    }

    const cancelarContrato = async (contratoId: number) => {
        try {
            const faturas = await sendGet(`/faturamento/04390988077/${contratoId}`);
            const faturasPendentesFiltradas = faturas.filter((fatura: any) =>
                !fatura.dataPagamento && new Date(fatura.dataVencimento) > new Date()
            );
            if (faturasPendentesFiltradas.length > 0) {
                setFaturasPendentes(faturasPendentesFiltradas);
                setAlertDeleteFaturasFuturas(`Este contrato tem ${faturasPendentesFiltradas.length} fatura(s) pendente(s). Deseja apagá-las?`);
            } else {
                await sendPut(`/contratos/cancelar/${contratoId}`, {});
                setAlertMessage("Contrato cancelado com sucesso!");
                loadContratos();
            }
        } catch (error) {
            setAlertMessage("Erro ao cancelar o contrato");
            console.log(error);
        }
    };

    const handleDeleteFaturasFuturas = async () => {
        try {
            await Promise.all(faturasPendentes.map(async (fatura: any) => {
                await sendDelete(`/faturamento/${fatura.id}`, {});
            }));
            setAlertMessage("Faturas pendentes apagadas com sucesso!");
            setAlertDeleteFaturasFuturas(null);
            await sendPut(`/contratos/cancelar/${selectedContrato.id}`, {});
            setAlertMessage("Contrato cancelado com sucesso!");
            loadContratos();
            setIsDialogOpen(false)
        } catch (error) {
            setAlertMessage("Erro ao apagar faturas pendentes");
            console.log(error);
        }
    };
    const handleCancelDeleteFaturasFuturas = () => {
        setAlertDeleteFaturasFuturas(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Contratos</CardTitle>
                <CardDescription>Aqui você pode ver e gerenciar todos os contratos cadastrados.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex items-center justify-between w-11/12 m-auto'>
                    <div className='w-1/6'>
                        <Select onValueChange={(value) => setStatusSearch(value)} value={statusSearch}>
                            <SelectTrigger>
                                <SelectValue placeholder='Status'></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="todos" >Todos</SelectItem>
                                    <SelectItem value="ativo" >Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Button className='my-3' onClick={handleAdd}>Novo Contrato</Button>
                        <DialogContent>
                            <DialogHeader><span className="text-2xl font-bold">Contrato</span></DialogHeader>
                            <form className='flex flex-col'>
                                <div>
                                    <Label>Cliente</Label>
                                    <Select onValueChange={(value) => setCliente(value)} value={cliente}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Cliente'></SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {clientes.map((cliente) => (
                                                    <SelectItem key={cliente.id} value={cliente.nomeFantasia}>{cliente.nomeFantasia}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Programa</Label>
                                    <Select onValueChange={(value) => setPrograma(value)} value={programa}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Programa'></SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {programas.map((programa) => (
                                                    <SelectItem key={programa.id} value={programa.programa}>{programa.programa}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label>Data de Emissão</Label>
                                        <Input placeholder='Data de Emissão' type='text' value={dataEmissao} ref={dataEmissaoRef} onChange={(e: any) => setDataEmissao(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Data de Vencimento</Label>
                                        <Input placeholder='Data de Vencimento' type='text' value={dataVencimento} ref={dataVencimentoRef} onChange={(e: any) => setDataVencimento(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Número de Inserções</Label>
                                        <Input placeholder='Número de Inserções' type='number' value={numeroInsercoes} onChange={(e: any) => setNumeroInsercoes(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label>Valor</Label>
                                        <Input placeholder='Valor' type='text' value={valor} ref={valorRef} onChange={(e: any) => setValor(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Dia do Pagamento</Label>
                                        <Input placeholder='Pagamento' type='number' ref={diaVencimentoRef} value={diaVencimento} onChange={(e: any) => setDiaVencimento(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Forma de Pagamento</Label>
                                        <Select onValueChange={(value) => setFormaPagamento(value)} value={formaPagamento}>
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
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Comissão (%)</Label>
                                        <Input placeholder="Comissão" type="number" ref={comissaoRef} value={comissao} onChange={(e: any) => setComissao(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select onValueChange={(value) => setStatus(value)} value={status}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Status'></SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="ativo">Ativo</SelectItem>
                                                    <SelectItem value="inativo">Inativo</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
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
                                <div>
                                    <Label>Descritivo</Label>
                                    <Input placeholder='Descritivo' type='text' value={descritivo} onChange={(e: any) => setDescritivo(e.target.value)} />
                                </div>
                            </form>
                            <DialogFooter className="mt-2">
                                {selectedContrato && <Button variant={"outline"} onClick={() => cancelarContrato(selectedContrato.id)}>Cancelar Contrato</Button>}
                                <DialogClose asChild>
                                    <Button variant={"outline"}>Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleSubmit}>Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
                <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[60vh] overflow-y-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead align="left">Cliente</TableHead>
                                <TableHead align="left">Emissão</TableHead>
                                <TableHead align="left">Programa</TableHead>
                                <TableHead align="left">Dia Vencimento</TableHead>
                                <TableHead align="left">Valor</TableHead>
                                <TableHead align="left">Corretor</TableHead>
                                <TableHead align="left">Comissão</TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contratos.map((contrato) => (
                                <TableRow key={contrato.id}>
                                    <TableCell>{contrato.clienteNome}</TableCell>
                                    <TableCell>{convertIsoToDate(contrato.dataEmissao)}</TableCell>
                                    <TableCell>{contrato.programaNome}</TableCell>
                                    <TableCell>{contrato.diaVencimento}</TableCell>
                                    <TableCell>{contrato.valorFinal}</TableCell>
                                    <TableCell>{contrato.corretorNome}</TableCell>
                                    <TableCell>{(contrato.comissaoFinal)}%</TableCell>
                                    <TableCell><ScrollText className="w-4 h-4 cursor-pointer" onClick={() => {
                                        setSelectedContrato(contrato);
                                        setIsDialogConfigOpen(true)
                                    }} /></TableCell>
                                    <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => {
                                        setAlertConfirmMessage("Tem certeza que deseja excluir este contrato?")
                                        setSelectedContrato(contrato);
                                    }} /></TableCell>
                                    <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(contrato)} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Dialog open={isDialogConfigOpen} onOpenChange={setIsDialogConfigOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Informações para gerar fatura</DialogTitle>
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
                                        <Input placeholder="Ano" type="number" ref={anoRef} value={ano} onChange={(e: any) => setAno(e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                        <Button variant={"outline"}>Cancelar</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={gerarFaturaIndividual}>Gerar Fatura</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />}
                    {alertConfirmMessage && <CustomConfirmDialog message={alertConfirmMessage} onConfirm={() => handleDelete(selectedContrato.id)} onCancel={() => setAlertConfirmMessage(null)} />}
                    {alertDeleteFaturasFuturas && (
                        <CustomConfirmDialog
                            message={alertDeleteFaturasFuturas}
                            onConfirm={handleDeleteFaturasFuturas}
                            onCancel={handleCancelDeleteFaturasFuturas}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}