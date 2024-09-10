import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../components/ui/table";
import { useState, useEffect, useRef } from "react";
import { sendGet, sendDelete, sendPost, sendPut, converterParaNumero, floatParaInput } from "../functions";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Trash, Pencil } from 'lucide-react';
import IMask from 'imask';
import { Label } from "../components/ui/label";
import { CustomAlertDialog, CustomConfirmDialog } from "../components/alert";

export default function Programacao() {

    const horaInicioRef = useRef<HTMLInputElement>(null);
    const horaFimRef = useRef<HTMLInputElement>(null);
    const valorPatrocinioRef = useRef<HTMLInputElement>(null);

    const [programas, setProgramas] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPrograma, setSelectedPrograma] = useState<any>(null);

    const [programa, setPrograma] = useState<any>(null);
    const [apresentador, setApresentedor] = useState<string>('');
    const [dias, setDias] = useState<string>('');
    const [horaInicio, setHoraInicio] = useState<string>('');
    const [horaFim, setHoraFim] = useState<string>('');
    const [estilo, setEstilo] = useState<string>('');
    const [valorPatrocinio, setValorPatrocinio] = useState<string>('');

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [alertConfirmMessage, setAlertConfirmMessage] = useState<string | null>(null);


    useEffect(() => {
        loadProgramas();
    }, [])

    useEffect(() => {
        if (isDialogOpen) {
            const applyMasks = () => {
                if (horaInicioRef.current) {
                    IMask(horaInicioRef.current, {
                        mask: '00:00',
                    });
                }
                if (horaFimRef.current) {
                    IMask(horaFimRef.current, {
                        mask: '00:00',
                    });
                }
                if (valorPatrocinioRef.current) {
                    IMask(valorPatrocinioRef.current, {
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
            };
            const timer = setTimeout(applyMasks, 100);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const loadProgramas = async () => {
        const response = await sendGet('/programacao/04390988077');
        if (response) {

            const programasCompletos = await Promise.all(response.map(async (programa: any) => {
                const valorNumerico = parseFloat(programa.valorPatrocinio);
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
                return {
                    ...programa,
                    valorPatrocinio: valorFinal,
                };
            }));

            setProgramas(programasCompletos);
        } else {
            console.log(response)
            console.log('Erro ao buscar programas')
        }
    }

    const handleAdd = () => {
        setIsDialogOpen(true);
        resetForm();
        setSelectedPrograma(null);
    };

    const resetForm = () => {
        setPrograma('');
        setApresentedor('');
        setDias('');
        setHoraInicio('');
        setHoraFim('');
        setEstilo('');
        setValorPatrocinio('');
    };

    const handleDelete = async (id: string) => {
        const response = await sendDelete(`/programacao/${id}`, {
            usuario: "Guilherme"
        });
        if (response) {
            loadProgramas();
        } else {
            console.log('Erro ao excluir programa')
            console.log(response.data)
        }
    }

    const handleEdit = (programa: any) => {
        setSelectedPrograma(programa);
        setPrograma(programa.programa);
        setApresentedor(programa.apresentador);
        setDias(programa.diasApresentacao);
        setHoraFim(programa.horaFim);
        setHoraInicio(programa.horaInicio);
        setEstilo(programa.estilo);
        setValorPatrocinio(floatParaInput(programa.valorPatrocinio));
        setIsDialogOpen(true);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (programa) {
            const body = {
                chave: '04390988077',
                programa,
                apresentador,
                diasApresentacao: dias,
                horaInicio,
                horaFim,
                estilo,
                valorPatrocinio: converterParaNumero(valorPatrocinio)
            };
            try {
                if (selectedPrograma) {
                    await sendPut(`/programacao/${selectedPrograma.id}`, body);
                    setSelectedPrograma(null);
                } else {
                    await sendPost('/programacao', body);
                }
                loadProgramas();
                setIsDialogOpen(false);
                resetForm();
            } catch (error) {
                setAlertMessage("Erro ao processar a solicitação")
            }
        }else{
            setAlertMessage("O campo Programa é obrigatório");
            return;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
            <div className="flex items-center justify-end w-11/12">
                <Button onClick={handleAdd}>Novo Programa</Button>
            </div>
            <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[50vh] overflow-y-auto">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead align="left">Programa</TableHead>
                            <TableHead align="left">Dias</TableHead>
                            <TableHead align="left">Duração</TableHead>
                            <TableHead align="left">Apresentador</TableHead>
                            <TableHead align="left">Valor do Patrocínio</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programas.map((programa: any) => (
                            <TableRow key={programa.id}>
                                <TableCell align="left">{programa.programa}</TableCell>
                                <TableCell align="left">{programa.diasApresentacao}</TableCell>
                                <TableCell align="left">{programa.horaInicio} às {programa.horaFim}</TableCell>
                                <TableCell align="left">{programa.apresentador}</TableCell>
                                <TableCell align="left">{programa.valorPatrocinio}</TableCell>
                                <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => {
                                    setAlertConfirmMessage("Tem certeza que deseja excluir este programa?")
                                    setSelectedPrograma(programa);
                                    }} /></TableCell>
                                <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(programa)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Programa</DialogTitle>
                        </DialogHeader>
                        <form action="" className="flex flex-col">
                            <div>
                                <Label>Programa</Label>
                                <Input type="text" placeholder="Programa" value={programa} onChange={(e) => setPrograma(e.target.value)} />
                            </div>
                            <div>
                                <Label>Apresentador</Label>
                                <Input type="text" placeholder="Apresentador" value={apresentador} onChange={(e) => setApresentedor(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Hora Inicio</Label>
                                    <Input type="text" placeholder="Hora Inicio" ref={horaInicioRef} value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Hora Fim</Label>
                                    <Input type="text" placeholder="Hora Fim" ref={horaFimRef} value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Dias</Label>
                                <Input type="text" placeholder="Dias" value={dias} onChange={(e) => setDias(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Estilo</Label>
                                    <Input type="text" placeholder="Estilo" className="col-span-3" value={estilo} onChange={(e) => setEstilo(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Valor do Patrocínio</Label>
                                    <Input type="text" placeholder="Valor do Patrocínio" ref={valorPatrocinioRef} className="col-span-2" value={valorPatrocinio} onChange={(e) => setValorPatrocinio(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter className="mt-2">
                                <DialogClose asChild>
                                    <Button variant={"outline"}>Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleSubmit}>Salvar</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {alertMessage && <CustomAlertDialog message={alertMessage} onClose={() => setAlertMessage(null)} />}
                {alertConfirmMessage && <CustomConfirmDialog message={alertConfirmMessage} onConfirm={() => handleDelete(selectedPrograma.id)} onCancel={() => setAlertConfirmMessage(null)} />}
            </div>
        </div>
    )
}
