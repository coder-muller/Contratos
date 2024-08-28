import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "../components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { convertIsoToDate, sendGet, sendDelete, sendPost, sendPut, parseDate } from "../functions";
import IMask from 'imask';

export default function Contratos() {

    const [clientes, setClientes] = useState<any[]>([]);
    const [contratos, setContratos] = useState<any[]>([]);
    const [representantes, setRepresentantes] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContrato, setSelectedContrato] = useState<any>(null);

    const [cliente, setCliente] = useState<any>(null);
    const [representante, setRepresentante] = useState<any>(null);
    const [descritivo, setDescritivo] = useState<string>('');
    const [valor, setValor] = useState<number>(0);
    const [dataContrato, setDataContrato] = useState<string>('');
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFinal, setDataFinal] = useState<string>('');
    const [observacao, setObservacao] = useState<string>('');

    const valorRef = useRef<HTMLInputElement>(null);
    const dataContratoRef = useRef<HTMLInputElement>(null);
    const dataInicioRef = useRef<HTMLInputElement>(null);
    const dataFinalRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        //loadContratos();
        loadClientes()
        loadRepresentantes();
    }, [])

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
                  },
                },
              });
            }
            if (dataContratoRef.current) {
              IMask(dataContratoRef.current, {
                mask: '00/00/0000',
              });
            }
            if (dataInicioRef.current) {
              IMask(dataInicioRef.current, {
                mask: '00/00/0000',
              });
            }
            if (dataFinalRef.current) {
              IMask(dataFinalRef.current, {
                mask: '00/00/0000',
              });
            }
          };
          const timer = setTimeout(applyMasks, 100);
          return () => clearTimeout(timer);
        }
      }, [isDialogOpen]);
      

    const loadClientes = async () => {
        const response = await sendGet('/clientes/04390988077');
        setClientes(response);
    }

    /*
    const loadContratos = async () => {
        const response = await sendGet('/contratos/04390988077');
        setContratos(response);
    } 
    */

    const loadRepresentantes = async () => {
        const response = await sendGet('/corretores/04390988077');
        setRepresentantes(response);
    }

    const handleDelete = async (id: string) => {
        const body = { usuario: 'Guilherme' };
        const response = await sendDelete(`/contratos/${id}`, body);
        if (response.status === 200) {
            //loadContratos();
        } else {
            alert("Erro ao deletar o contrato!");
            console.log(response);
        }
    }

    const handleAdd = () => {
        setSelectedContrato(null);
        resetForm();
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCliente(null);
        setRepresentante(null);
        setDescritivo('');
        setValor(0);
        setDataContrato('');
        setDataInicio('');
        setDataFinal('');
        setObservacao('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const body = {
            chave: '04390988077',
            id_cliente: cliente,
            is_representante: representante,
            descritivo,
            valor,
            data_contrato: dataContrato ? parseDate(dataContrato) : '',
            veic_inicio: dataInicio ? parseDate(dataInicio) : '',
            veic_termino: dataFinal ? parseDate(dataFinal) : '',
            observacao
        };
        try {
            if (selectedContrato) {
                await sendPut(`/contratos/${selectedContrato.id}`, body);
                setSelectedContrato(null);
            } else {
                await sendPost('/contratos', body);
            }
            //loadContratos();
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            alert('Erro ao processar a solicitação');
        }
    };

    const handleEdit = (contrato: any) => {
        setSelectedContrato(contrato);
        setCliente(contrato.cliente.id);
        setRepresentante(contrato.representante.id);
        setDescritivo(contrato.descritivo);
        setValor(contrato.valor);
        setDataContrato(contrato.dataContrato);
        setDataInicio(contrato.dataInicio);
        setDataFinal(contrato.dataFinal);
        setObservacao(contrato.observacao);
        setIsDialogOpen(true);
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
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder='Status'></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="ativo" >Ativo</SelectItem>
                                    <SelectItem value="inativo">Inativo</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Button className='my-3' onClick={handleAdd}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Adicionar Contrato
                        </Button>
                        <DialogContent>
                            <DialogHeader><span className="text-2xl font-bold">Adicionar contrato</span></DialogHeader>
                            <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Cliente'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {clientes.map((cliente) => (
                                                <SelectItem key={cliente.id} value={cliente.nomeFantasia} onClick={() => setCliente(cliente.id)}>{cliente.nomeFantasia}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Representante'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {representantes.map((representante) => (
                                                <SelectItem key={representante.id} value={representante.nome} onClick={() => setRepresentante(representante.id)}>{representante.nome}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Input placeholder='Descritivo' type='text' className='col-span-2' value={descritivo} onChange={(e: any) => setDescritivo(e.target.value)} />
                                <div className='grid grid-cols-6 gap-2'>
                                    <Input placeholder='Valor' type='text' className='col-span-3' value={valor} ref={valorRef} onChange={(e: any) => setValor(e.target.value)} />
                                    <Input placeholder='Data do Contrato' type='text' className='col-span-3' value={dataContrato} ref={dataContratoRef} onChange={(e: any) => setDataContrato(e.target.value)} />
                                </div>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Input placeholder='Início da Veiculação' type='text' value={dataInicio} ref={dataInicioRef} onChange={(e: any) => setDataInicio(e.target.value)} />
                                    <Input placeholder='Término da Veiculação' type='text' value={dataFinal} ref={dataFinalRef} onChange={(e: any) => setDataFinal(e.target.value)} />
                                </div>
                                <Input placeholder='Observação' type='text' value={observacao} onChange={(e: any) => setObservacao(e.target.value)} />
                            </form>
                            <DialogFooter className="mt-2">
                                <Button type="submit">Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
                <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[60vh] overflow-y-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead align="left">Empresa</TableHead>
                                <TableHead align="left">Contrato</TableHead>
                                <TableHead align="left">Data Inicio</TableHead>
                                <TableHead align="left">Data Final</TableHead>
                                <TableHead align="left">Cliente</TableHead>
                                <TableHead align="left">Valor</TableHead>
                                <TableHead align="left">Parcelas</TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contratos.map((contrato) => (
                                <TableRow key={contrato.id}>
                                    <TableCell>{contrato.empresa.nome}</TableCell>
                                    <TableCell>{contrato.contrato}</TableCell>
                                    <TableCell>{convertIsoToDate(contrato.dt_inicio)}</TableCell>
                                    <TableCell>{convertIsoToDate(contrato.dt_final)}</TableCell>
                                    <TableCell>{contrato.cliente.nome}</TableCell>
                                    <TableCell>{contrato.valor}</TableCell>
                                    <TableCell>{contrato.parcelas}</TableCell>
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