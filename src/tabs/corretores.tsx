import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../components/ui/table";
import { useState, useEffect, useRef } from "react";
import { sendGet, sendDelete, sendPost, sendPut, parseDate, convertIsoToDate, isValidDate } from "../functions";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Trash, Pencil } from 'lucide-react';
import IMask from 'imask';
import { Label } from "../components/ui/label";


export default function Corretores() {

    const dataAdmissaoRef = useRef<HTMLInputElement>(null);

    const [corretores, setCorretores] = useState<any[]>([]);
    const [selectedCorretor, setSelectedCorretor] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [endereco, setEndereco] = useState("");
    const [fone, setFone] = useState("");
    const [dataAdmissao, setDataAdmissao] = useState("");


    useEffect(() => {
        fetchCorretores()
    }, [])

    useEffect(() => {
        if (isDialogOpen) {
            const applyMasks = () => {

                if (dataAdmissaoRef.current) {
                    IMask(dataAdmissaoRef.current, {
                        mask: '00/00/0000',
                    });
                }
            };
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const resetForm = () => {
        setNome("");
        setEmail("");
        setEndereco("");
        setFone("");
        setDataAdmissao("");
    }

    const fetchCorretores = async () => {
        const response = await sendGet('/corretores/04390988077')
        if (response) {
            setCorretores(response)
        } else {
            console.log(response)
            console.log('Erro ao buscar corretores')
        }
    }

    const handleAdd = () => {
        setSelectedCorretor(null);
        resetForm();
        setIsDialogOpen(true);
    };

    const handleEdit = (cliente: any) => {
        setSelectedCorretor(cliente);
        setNome(cliente.nome);
        setEmail(cliente.email);
        setEndereco(cliente.endereco);
        setFone(cliente.fone);
        setDataAdmissao(convertIsoToDate(cliente.dataAdmissao));
        setIsDialogOpen(true);
    }

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este corretor?')) {
            const response = await sendDelete(`/corretores/${id}`, {
                usuario: "Guilherme"
            });
            if (response) {
                fetchCorretores();
            } else {
                console.log(response.data)
                console.log('Erro ao excluir corretor')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (nome) {
            if (dataAdmissao) {
                if (!isValidDate(dataAdmissao)) {
                    alert('A data de admissão não é valida');
                    return;
                }
            }
            const body = {
                chave: '04390988077',
                nome,
                email,
                endereco,
                fone,
                dataAdmissao: dataAdmissao ? parseDate(dataAdmissao) : '',
            };
            console.log(body);
            try {
                if (selectedCorretor) {
                    await sendPut(`/corretores/${selectedCorretor.id}`, body);
                    setSelectedCorretor(null);
                } else {
                    await sendPost('/corretores', body);
                }
                fetchCorretores();
                setIsDialogOpen(false);
                resetForm();
            } catch (error) {
                alert('Erro ao processar a solicitação');
            }
        } else {
            alert('O campo Nome é obrigatório');
        }
    }


    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
            <div className="flex items-center justify-end w-11/12">
                <Button onClick={handleAdd}>Novo Corretor</Button>
            </div>
            <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[50vh] overflow-y-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead align="left">Nome</TableHead>
                            <TableHead align="left">Email</TableHead>
                            <TableHead align="left">Fone</TableHead>
                            <TableHead align="left">Data de Admissão</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {corretores.map((corretor: any) => (
                            <TableRow key={corretor.id}>
                                <TableCell align="left">{corretor.nome}</TableCell>
                                <TableCell align="left">{corretor.email}</TableCell>
                                <TableCell align="left">{corretor.fone}</TableCell>
                                <TableCell align="left">{convertIsoToDate(corretor.dataAdmissao)}</TableCell>
                                <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => handleDelete(corretor.id)} /></TableCell>
                                <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(corretor)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Corretor</DialogTitle>
                        </DialogHeader>
                        <form action="" className="flex flex-col">
                            <div>
                                <Label>Nome</Label>
                                <Input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <Label>Endereço</Label>
                                <Input type="text" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Fone</Label>
                                    <Input type="text" placeholder="Fone" value={fone} onChange={(e) => setFone(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Data de Admissão</Label>
                                    <Input type="text" placeholder="Data de Admissão" ref={dataAdmissaoRef} value={dataAdmissao} onChange={(e) => setDataAdmissao(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                    <Button variant={"outline"}>Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleSubmit}>Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </div>

    )
}