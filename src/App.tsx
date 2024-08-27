import { useEffect, useState } from 'react';
import { sendGet, sendPost, sendPut, sendDelete, convertIsoToDate } from './functions';
import { PlusCircle, Trash, Pencil, Search } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogClose } from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select';
import { DialogTrigger } from '@radix-ui/react-dialog';

function App() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [razaoSocial, setRazaoSocial] = useState<string>('');
  const [nomeFantasia, setNomeFantasia] = useState<string>('');
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
  const [inputFilter, setInputFilter] = useState<string>('');
  const [selectedCliente, setSelectedCliente] = useState<any>(null);

  useEffect(() => {
    fetchClientes();
    fetchContratos();
  }, []);

  const fetchClientes = async () => {
    const data = await sendGet('/clientes/04390988077');
    if (data) {
      if (inputFilter && inputFilter.length > 0) {
        setClientes(data.filter((cliente: any) => cliente.nome.toLowerCase().includes(inputFilter.toLowerCase())));
      } else {
        setClientes(data);
      }
    }
  };

  const fetchContratos = async () => {
    const data = await sendGet('/contratos/04390988077');
    if (data) {
      if (inputFilter && inputFilter.length > 0) {
        setContratos(data.filter((contrato: any) => contrato.empresa.nome.toLowerCase().includes(inputFilter.toLowerCase())));
      } else {
        setContratos(data);
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
    <div className="w-screen h-screen p-6 flex justify-center bg-zinc-100">
      <Tabs defaultValue="contratos">
        <div className="flex items-center justify-center">
          <TabsList className='bg-zinc-200'>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="clientes" className="w-screen px-10 py-3">
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
                    onChange={(e) => {
                      setInputFilter(e.target.value)
                      fetchClientes()
                    }}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <Button className="my-3 " onClick={handleAdd}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                  <DialogContent>
                    <DialogHeader><span className="text-2xl font-bold">Adicionar cliente</span></DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                      <Input placeholder="Razão Social" type="text" className='col-span-2' value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
                      <Input placeholder="Nome Fantasia" type="text" className='col-span-2' value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
                      <div className="grid grid-cols-4 gap-2">
                        <Input placeholder="CPF" type="text" className='col-span-2' value={cpf} onChange={(e) => setCpf(e.target.value)} />
                        <Input placeholder="CNPJ" type="text" className='col-span-2' value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <Input placeholder="Endereço" type="text" className='col-span-4' value={endereco} onChange={(e) => setEndereco(e.target.value)} />
                        <Input placeholder="Nº" type="number" className='col-span-1' value={numero} onChange={(e) => setNumero(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Input placeholder="Bairro" type="text" className='col-span-2' value={bairro} onChange={(e) => setBairro(e.target.value)} />
                        <Input placeholder="Cidade" type="text" className='col-span-2' value={cidade} onChange={(e) => setCidade(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-10 gap-2">
                        <Input placeholder="Estado" type="text" className='col-span-2 text-center' maxLength={2} value={estado} onChange={(e) => setEstado(e.target.value)} />
                        <Input placeholder="CEP" type="number" className='col-span-3' value={cep} onChange={(e) => setCep(e.target.value)} />
                        <Input placeholder="Fone" type="number" className='col-span-5' value={fone} onChange={(e) => setFone(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Atividade" type="text" className='col-span-2' value={atividade} onChange={(e) => setAtividade(e.target.value)} />

                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        <Input placeholder="Email" type="email" className='col-span-6' value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <DialogFooter className="mt-2">
                        <DialogClose>
                          <Button type="submit">Salvar</Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="border rounded-lg shadow-md w-11/12 m-auto max-h-[60vh] overflow-y-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead align="left">Nome</TableHead>
                      <TableHead align="left">CPF</TableHead>
                      <TableHead align="left">Email</TableHead>
                      <TableHead align="left">Telefone</TableHead>
                      <TableHead></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.razaoSocial}</TableCell>
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
        </TabsContent>
        <TabsContent value="contratos" className="w-screen px-10 py-3">
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
                    <Input placeholder='Término da Veiculação' type='text'/>
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
                        <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleEdit(contrato)} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resultados">
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>Aqui você pode analisar os resultados da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>

            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ajustes">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes</CardTitle>
              <CardDescription>Aqui você pode realizar ajustes a aplicação.</CardDescription>
            </CardHeader>
            <CardContent>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App;
