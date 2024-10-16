import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../components/ui/table";
import { useState, useEffect } from "react";
import { sendGet, sendDelete, sendPost, sendPut } from "../functions";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Trash, Pencil } from 'lucide-react';
import { Label } from "../components/ui/label";
import { CustomAlertDialog, CustomConfirmDialog } from "../components/alert";

export default function FormaPagamento() {

    const [metodos, setMetodos] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertConfirmMessage, setAlertConfirmMessage] = useState<string | null>(null);

    const [formaPagamento, setFormaPagamento] = useState<string>('');
    const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<any>(null);

    useEffect(() => {
        fetchMetodos()
    }, [])

    useEffect(() => {
        if (isDialogOpen) {
            const applyMasks = () => {

            };
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const fetchMetodos = async () => {
        const response = await sendGet('/formaPagamento/04390988077')
        if (response) {
            setMetodos(response)
        } else {
            console.log(response)
            console.log('Erro ao buscar formas de pagamento')
        }
    }

    const handleAdd = () => {
        setIsDialogOpen(true);
        resetForm();
        setSelectedFormaPagamento(null);
    };

    const resetForm = () => {
        setFormaPagamento('');
    };

    const handleDelete = async (id: string) => {
        const response = await sendDelete(`/formaPagamento/${id}`, {
            usuario: "Guilherme"
        });
        if (response) {
            fetchMetodos();
        } else {
            console.log(response.data)
            console.log('Erro ao excluir metodo de pagamento')
        }
        setAlertConfirmMessage(null);
    }

    const handleEdit = (metodo: any) => {
        setSelectedFormaPagamento(metodo);
        setFormaPagamento(metodo.formaPagamento);
        setIsDialogOpen(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formaPagamento) {
            const body = {
                chave: '04390988077',
                metodo: formaPagamento,
            };
            try {
                if (selectedFormaPagamento) {
                    await sendPut(`/formaPagamento/${selectedFormaPagamento.id}`, body);
                    setSelectedFormaPagamento(null);
                } else {
                    await sendPost('/formaPagamento', body);
                }
                fetchMetodos();
                setIsDialogOpen(false);
                resetForm();
            } catch (error) {
                setAlertMessage("Erro ao processar a solicitação")
            }
        } else {
            setAlertMessage("O campo Forma de Pagamento é obrigatório");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
            <div className="flex items-center justify-end w-11/12">
                <Button onClick={handleAdd}>Nova Forma de Pagamento</Button>
            </div>
            <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[50vh] overflow-y-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead align="left">ID</TableHead>
                            <TableHead align="left">Forma de Pagamento</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {metodos.map((metodo: any) => (
                            <TableRow key={metodo.id}>
                                <TableCell align="left">{metodo.id}</TableCell>
                                <TableCell align="left">{metodo.formaPagamento}</TableCell>
                                <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => {
                                    setAlertConfirmMessage("Tem certeza que deseja excluir este método de pagamento?")
                                    setSelectedFormaPagamento(metodo);
                                }} /></TableCell>
                                <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(metodo)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Forma de Pagamento</DialogTitle>
                        </DialogHeader>
                        <form action="" className="flex flex-col gap-3">
                            <div>
                                <Label>Forma de Pagamento</Label>
                                <Input type="text" placeholder="Forma de Pagamento" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant={"outline"}>Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleSubmit}>Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />}
                {alertConfirmMessage && <CustomConfirmDialog message={alertConfirmMessage} onConfirm={() => handleDelete(selectedFormaPagamento.id)} onCancel={() => setAlertConfirmMessage(null)} />}
            </div>
        </div>
    )
}