import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { convertIsoToDate, sendGet, sendDelete, sendPost, sendPut, parseDate, getDataFromId, floatParaInput, converterParaNumero, isValidDate, getIdFromData } from "../functions";
import IMask from 'imask';
import { Label } from "../components/ui/label";

export default function Contratos() {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContrato, setSelectedContrato] = useState<any>(null);

    const valorRef = useRef(null);
    const dataEmissaoRef = useRef(null);

    const [clientes, setClientes] = useState<any[]>([]);
    const [contratos, setContratos] = useState<any[]>([]);
    const [corretores, setCorretores] = useState<any[]>([]);
    const [programas, setProgramas] = useState<any[]>([]);
    const [formasPagamento, setFormasPagamento] = useState<any[]>([]);
    const [statusSearch, setStatusSearch] = useState<any>('todos');

    const [cliente, setCliente] = useState('');
    const [programa, setPrograma] = useState('');
    const [dataEmissao, setDataEmissao] = useState('');
    const [numeroInsercoes, setNumeroInsercoes] = useState('');
    const [valor, setValor] = useState('');
    const [formaPagamento, setFormaPagamento] = useState('');
    const [comissao, setComissao] = useState('');
    const [status, setStatus] = useState('');
    const [corretor, setCorretor] = useState('');
    const [descritivo, setDescritivo] = useState('');
    const [diaVencimento, setDiaVencimento] = useState('');

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
            }
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const loadContratos = async () => {
        try {
            const response = await sendGet('/contratos/04390988077');
            console.log(response);
            console.log(statusSearch);
            let filteredContratos: any[] = [];
            if ( statusSearch !== 'todos') {
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
                alert("Erro ao carregar os contratos!");
            }
        } catch (error) {
            console.error("Error loading contratos:", error);
            alert("Ocorreu um erro ao carregar os contratos!");
        }
    };

    const loadClientes = async () => {
        const response = await sendGet('/clientes/04390988077');
        if (response) {
            setClientes(response);
        } else {
            alert("Erro ao carregar os clientes!");
        }
    }

    const loadProgramas = async () => {
        const response = await sendGet('/programacao/04390988077');
        if (response) {
            setProgramas(response);
        } else {
            alert("Erro ao carregar os programas!");
        }
    }

    const loadCorretores = async () => {
        const response = await sendGet('/corretores/04390988077');
        if (response) {
            setCorretores(response);
        } else {
            alert("Erro ao carregar os corretores!");
        }
    }

    const loadFormasPagamento = async () => {
        const response = await sendGet('/formaPagamento/04390988077');
        if (response) {
            setFormasPagamento(response);
        } else {
            alert("Erro ao carregar os formas de pagamento!");
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este contrato?')) {
            const body = { usuario: 'Guilherme' };
            const response = await sendDelete(`/contratos/${id}`, body);
            if (response) {
                loadContratos();
            } else {
                alert("Erro ao deletar o contrato!");
                console.log(response);
            }
        }
    }

    const handleAdd = () => {
        setSelectedContrato(null);
        resetForm();
        setIsDialogOpen(true);
    }

    const resetForm = () => {
        setCliente('');
        setPrograma('');
        setDataEmissao('')
        setNumeroInsercoes('')
        setValor('')
        setFormaPagamento('')
        setComissao('')
        setStatus('')
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
        setNumeroInsercoes(contrato.numInsercoes);
        setValor(floatParaInput(contrato.valor));
        setComissao(contrato.comissao);
        setStatus(contrato.status);
        setDescritivo(contrato.descritivo);
        setDiaVencimento(contrato.diaVencimento);
        setIsDialogOpen(true);
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cliente && programa) {
            if (dataEmissao) {
                if (isValidDate(dataEmissao)) {
                    const body = {
                        chave: '04390988077',
                        id_cliente: await getIdFromData(cliente, 'nomeFantasia', '/clientes/04390988077'),
                        id_programa: await getIdFromData(programa, 'programa', '/programacao/04390988077'),
                        dataEmissao: dataEmissao ? parseDate(dataEmissao) : '',
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
                        if (selectedContrato) {
                            await sendPut(`/contratos/${selectedContrato.id}`, body);
                            setSelectedContrato(null);
                        } else {
                            await sendPost('/contratos', body);
                        }
                        loadContratos();
                        setIsDialogOpen(false);
                        resetForm();
                    }
                    catch (error) {
                        alert('Erro ao processar a solicitação');
                    }
                } else {
                    alert('A data de emissão não é valida');
                }
            } else {
                const body = {
                    chave: '04390988077',
                    id_cliente: await getIdFromData(cliente, 'nomeFantasia', '/clientes/04390988077'),
                    id_programa: await getIdFromData(programa, 'programa', '/programacao/04390988077'),
                    dataEmissao: dataEmissao ? parseDate(dataEmissao) : '',
                    numInsercoes: numeroInsercoes,
                    diaVencimento,
                    valor: converterParaNumero(valor),
                    id_formaPagamento: await getIdFromData(formaPagamento, 'formaPagamento', '/formaPagamento/04390988077'),
                    comissao,
                    status,
                    id_corretor: await getIdFromData(corretor, 'nome', '/corretores/04390988077'),
                    descritivo
                };
                try {
                    if (selectedContrato) {
                        await sendPut(`/contratos/${selectedContrato.id}`, body);
                        setSelectedContrato(null);
                    } else {
                        await sendPost('/contratos', body);
                    }
                    loadContratos();
                    setIsDialogOpen(false);
                    resetForm();
                }
                catch (error) {
                    alert('Erro ao processar a solicitação');
                }
            }
        } else {
            alert("Preencha os campos obrigatórios (Cliente e Programa)!")
        }
    }

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
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Button className='my-3' onClick={handleAdd}>Novo Contrato</Button>
                        <DialogContent>
                            <DialogHeader><span className="text-2xl font-bold">Adicionar contrato</span></DialogHeader>
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
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Data de Emissão</Label>
                                        <Input placeholder='Data de Emissão' type='text' value={dataEmissao} ref={dataEmissaoRef} onChange={(e: any) => setDataEmissao(e.target.value)} />
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
                                        <Label>Dia do Vencimento</Label>
                                        <Input placeholder='Vencimento' type='number' value={diaVencimento} onChange={(e: any) => setDiaVencimento(e.target.value)} />
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
                                        <Label>Comissão</Label>
                                        <Input placeholder="Comissão" type="number" value={comissao} onChange={(e: any) => setComissao(e.target.value)} />
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
                                <TableHead align="left">Valor</TableHead>
                                <TableHead align="left">Corretor</TableHead>
                                <TableHead align="left">Comissão</TableHead>
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
                                    <TableCell>{contrato.valorFinal}</TableCell>
                                    <TableCell>{contrato.corretorNome}</TableCell>
                                    <TableCell>{(contrato.comissaoFinal)}%</TableCell>
                                    <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => handleDelete(contrato.id)} /></TableCell>
                                    <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(contrato)} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}