import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Trash, Pencil } from "lucide-react";
import { convertIsoToDate, sendGet, sendDelete } from "../functions";

export default function Contratos() {

    const [clientes, setClientes] = useState<any[]>([]);
    const [contratos, setContratos] = useState<any[]>([]);
    /*
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedContrato, setSelectedContrato] = useState<any>(null);
    */

    useEffect(() => {
        loadContratos();
        loadClientes()
    })

    const loadClientes = async () => {
        const response = await sendGet('/clientes/04390988077');
        setClientes(response);
    }

    const loadContratos = async () => {
        const response = await sendGet('/contratos/04390988077');
        setContratos(response);
    }

    const handleDelete = async (id: string) => {
        const body = { usuario: 'Guilherme' };
        const response = await sendDelete(`/contratos/${id}`, body);
        if (response.status === 200) {
            loadContratos();
        } else {
            alert("Erro ao deletar o contrato!");
            console.log(response);
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
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder='Status'></SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativo" >Ativo</SelectItem>
                                <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='my-3'>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Adicionar Contrato
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader><span className="text-2xl font-bold">Adicionar contrato</span></DialogHeader>
                            <form className='flex flex-col gap-2'>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Cliente'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((cliente) => (
                                            <SelectItem key={cliente.id} value={cliente.id}>{cliente.nomeFantasia}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Representante'></SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((cliente) => (
                                            <SelectItem key={cliente.id} value={cliente.id}>{cliente.nomeFantasia}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input placeholder='Descritivo' type='text' className='col-span-2' />
                                <div className='grid grid-cols-6 gap-2'>
                                    <Input placeholder='Valor' type='number' className='col-span-3' />
                                    <Input placeholder='Data do Contrato' type='text' className='col-span-3' />
                                </div>
                                <div className='grid grid-cols-2 gap-2'>
                                    <Input placeholder='Início da Veiculação' type='text' />
                                    <Input placeholder='Término da Veiculação' type='text' />
                                </div>
                                <Input placeholder='Observação' type='text' />


                            </form>
                            <DialogFooter className="mt-2">
                                <DialogClose>
                                    <Button type="submit">Salvar</Button>
                                </DialogClose>
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
                                    <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => alert("Editar contrato!")} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}