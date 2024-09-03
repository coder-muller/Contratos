import { sendGet, sendPost, sendPut, sendDelete } from '../functions';
import { Trash, Pencil, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../components/ui/table';
import { useState, useEffect, useRef } from 'react';
import IMask from 'imask';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Clientes() {

    const [clientes, setClientes] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [razaoSocial, setRazaoSocial] = useState<string>('');
    const [nomeFantasia, setNomeFantasia] = useState<string>('');
    const [contato, setContato] = useState<string>('');
    const [inscMunicipal, setInscMunicipal] = useState<string>('');
    const [cpf, setCpf] = useState<string>('');
    const [cnpj, setCnpj] = useState<string>('');
    const [endereco, setEndereco] = useState<string>('');
    const [numero, setNumero] = useState<string>('');
    const [bairro, setBairro] = useState<string>('');
    const [cidade, setCidade] = useState<string>('');
    const [estado, setEstado] = useState<string>('');
    const [cep, setCep] = useState<string>('');
    const [atividade, setAtividade] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [fone, setFone] = useState<string>('');

    const cpfRef = useRef(null);
    const cnpjRef = useRef(null);
    const cepRef = useRef(null);

    const [inputFilter, setInputFilter] = useState<string>('');
    const [selectedCliente, setSelectedCliente] = useState<any>(null);

    useEffect(() => {
        fetchClientes();
    }, []);

    useEffect(() => {
        if (isDialogOpen) {
            const applyMasks = () => {
                if (cpfRef.current) {
                    IMask(cpfRef.current, {
                        mask: '000.000.000-00',
                    });
                }
                if (cnpjRef.current) {
                    IMask(cnpjRef.current, {
                        mask: '00.000.000/0000-00',
                    });
                }
                if (cepRef.current) {
                    IMask(cepRef.current, {
                        mask: '00000-000',
                    });
                }
            };
            const timer = setTimeout(applyMasks, 10);
            return () => clearTimeout(timer);
        }
    }, [isDialogOpen]);

    const fetchClientes = async () => {
        const data = await sendGet('/clientes/04390988077');
        if (data) {
            if (inputFilter && inputFilter.length > 0) {
                setClientes(data.filter((cliente: any) => cliente.nomeFantasia.toLowerCase().includes(inputFilter.toLowerCase())));
            } else {
                setClientes(data);
            }
        }
    };

    const handleAdd = () => {
        setSelectedCliente(null);
        resetForm();
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setRazaoSocial('');
        setNomeFantasia('');
        setContato('');
        setInscMunicipal('');
        setCpf('');
        setCnpj('');
        setEndereco('');
        setNumero('');
        setBairro('');
        setCidade('');
        setEstado('');
        setCep('');
        setAtividade('');
        setEmail('');
        setFone('');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza que deseja excluir o cliente?')) {
            try {
                await sendDelete(`/clientes/${id}`, { usuario: 'Guilherme' });
                fetchClientes();
            } catch (error) {
                alert('Erro ao excluir cliente');
            }
        };
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (razaoSocial || nomeFantasia) {
            const body = {
                chave: '04390988077',
                razaoSocial,
                nomeFantasia,
                contato,
                inscMunicipal,
                cpf,
                cnpj,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                cep,
                atividade,
                email,
                fone
            };
            try {
                if (selectedCliente) {
                    await sendPut(`/clientes/${selectedCliente.id}`, body);
                    setSelectedCliente(null);
                } else {
                    await sendPost('/clientes', body);
                }
                fetchClientes();
                setIsDialogOpen(false);
                resetForm();
            } catch (error) {
                alert('Erro ao processar a solicitação');
            }
        } else {
            alert('Os campos Razão Social e Nome Fantasia são obrigatórios');
        }
    }

    const handleEdit = (cliente: any) => {
        setSelectedCliente(cliente);
        setRazaoSocial(cliente.razaoSocial);
        setNomeFantasia(cliente.nomeFantasia);
        setContato(cliente.contato);
        setInscMunicipal(cliente.inscMunicipal);
        setCpf(cliente.cpf);
        setCnpj(cliente.cnpj);
        setEndereco(cliente.endereco);
        setNumero(cliente.numero);
        setBairro(cliente.bairro);
        setCidade(cliente.cidade);
        setEstado(cliente.estado);
        setCep(cliente.cep);
        setAtividade(cliente.atividade);
        setEmail(cliente.email);
        setFone(cliente.fone);
        setIsDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Aqui você pode ver e gerenciar todos os clientes cadastrados.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between w-11/12 m-auto">
                    <div className="flex items-center gap-2 relative">
                        <Input
                            placeholder="Buscar cliente"
                            className="w-full pl-10"
                            onChange={(e: any) => {
                                setInputFilter(e.target.value)
                                fetchClientes()
                            }}
                        />
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5"
                        />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Button className="my-3 " onClick={handleAdd}>Novo Cliente</Button>
                        <DialogContent>
                            <DialogHeader>Clientes</DialogHeader>
                            <form className="flex flex-col">
                                <div>
                                    <Label >Razão Social</Label>
                                    <Input placeholder="Razão Social" type="text" className='col-span-2' value={razaoSocial} onChange={(e: any) => setRazaoSocial(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Nome Fantasia</Label>
                                    <Input placeholder="Nome Fantasia" type="text" className='col-span-2' value={nomeFantasia} onChange={(e: any) => setNomeFantasia(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    <div className='col-span-3'>
                                        <Label>Contato</Label>
                                        <Input placeholder="Contato" type="text" className='col-span-3' value={contato} onChange={(e: any) => setContato(e.target.value)} />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label>Inscrição Municipal</Label>
                                        <Input placeholder="Inscrição Municipal" type="text" className='col-span-2' value={inscMunicipal} onChange={(e: any) => setInscMunicipal(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className='col-span-2'>
                                        <Label>CPF</Label>
                                        <Input placeholder="CPF" ref={cpfRef} type="text" className='col-span-2' value={cpf} onChange={(e: any) => setCpf(e.target.value)} />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label>CNPJ</Label>
                                        <Input placeholder="CNPJ" ref={cnpjRef} type="text" className='col-span-2' value={cnpj} onChange={(e: any) => setCnpj(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    <div className='col-span-4'>
                                        <Label>Endereço</Label>
                                        <Input placeholder="Endereço" type="text" className='col-span-4' value={endereco} onChange={(e: any) => setEndereco(e.target.value)} />
                                    </div>
                                    <div className='col-span-1'>
                                        <Label>Nº</Label>
                                        <Input placeholder="Nº" type="number" className='col-span-1' value={numero} onChange={(e: any) => setNumero(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className='col-span-2'>
                                        <Label>Bairro</Label>
                                        <Input placeholder="Bairro" type="text" className='col-span-2' value={bairro} onChange={(e: any) => setBairro(e.target.value)} />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label>Cidade</Label>
                                        <Input placeholder="Cidade" type="text" className='col-span-2' value={cidade} onChange={(e: any) => setCidade(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-10 gap-2">
                                    <div className='col-span-2'>
                                        <Label>Estado</Label>
                                        <Input placeholder="Estado" type="text" className='col-span-2 text-center' maxLength={2} value={estado} onChange={(e: any) => setEstado(e.target.value)} />
                                    </div>
                                    <div className='col-span-3'>
                                        <Label>CEP</Label>
                                        <Input placeholder="CEP" ref={cepRef} type="text" className='col-span-3' value={cep} onChange={(e: any) => setCep(e.target.value)} />
                                    </div>
                                    <div className='col-span-5'>
                                        <Label>Fone</Label>
                                        <Input placeholder="Fone" type="number" className='col-span-5' value={fone} onChange={(e: any) => setFone(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Atividade</Label>
                                    <Input placeholder="Atividade" type="text" className='col-span-2' value={atividade} onChange={(e: any) => setAtividade(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input placeholder="Email" type="email" className='col-span-6' value={email} onChange={(e: any) => setEmail(e.target.value)} />
                                </div>
                                <DialogFooter className="mt-2">
                                    <Button variant={"outline"}>Cancelar</Button>
                                    <Button onClick={handleSubmit}>Salvar</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[60vh] overflow-y-auto">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead align="left">Nome Fantasia</TableHead>
                                <TableHead align="left">Atividade</TableHead>
                                <TableHead align="left">CNPJ</TableHead>
                                <TableHead align="left">Email</TableHead>
                                <TableHead align="left">Telefone</TableHead>
                                <TableHead></TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clientes.map((cliente) => (
                                <TableRow key={cliente.id}>
                                    <TableCell>{cliente.nomeFantasia}</TableCell>
                                    <TableCell>{cliente.atividade}</TableCell>
                                    <TableCell>{cliente.cnpj}</TableCell>
                                    <TableCell>{cliente.email}</TableCell>
                                    <TableCell>{cliente.fone}</TableCell>
                                    <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => handleDelete(cliente.id)} /></TableCell>
                                    <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(cliente)} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}