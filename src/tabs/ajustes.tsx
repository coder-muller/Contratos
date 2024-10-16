
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Corretores from "../tabs/corretores";
import FormaPagamento from "../tabs/formaPagamento";
import Programacao from "../tabs/programacao";



export default function Ajustes() {
    return (
        <div className="w-screen p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Ajustes</CardTitle>
                    <CardDescription>Aqui você pode realizar ajustes na aplicação.</CardDescription>
                </CardHeader>
                <CardContent className="w-full">
                    <div className="flex items-center justify-center">
                        <Tabs defaultValue="corretores" className="w-full">
                            <div className="flex items-center justify-center">
                                <TabsList>
                                    <TabsTrigger value="corretores">Corretores</TabsTrigger>
                                    <TabsTrigger value="programacao">Programação</TabsTrigger>
                                    <TabsTrigger value="formaPagameneto">Formas de Pagamento</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="corretores" className="w-full">
                                <Corretores />
                            </TabsContent>
                            <TabsContent value="programacao">
                                <Programacao />
                            </TabsContent>  
                            <TabsContent value="formaPagameneto">
                                <FormaPagamento />
                            </TabsContent>
                        </Tabs>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}