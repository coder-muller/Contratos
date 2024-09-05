import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { ThemeProvider } from "./components/ui/theme-provider"

import Contratos from './tabs/contratos';
import Clientes from './tabs/clientes';
import Ajustes from "./tabs/ajustes";
import Faturas from "./tabs/faturas";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="w-screen h-screen p-6 flex justify-center">
        <Tabs defaultValue="clientes">
          <div className="flex items-center justify-center">
            <TabsList>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
              <TabsTrigger value="contratos">Contratos</TabsTrigger>
              <TabsTrigger value="faturas">Faturas</TabsTrigger>
              <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="clientes" className="w-screen px-10 py-3">
            <Clientes />
          </TabsContent>
          <TabsContent value="contratos" className="w-screen px-10 py-3">
            <Contratos />
          </TabsContent>
          <TabsContent value="faturas" className="w-screen px-10 py-3">
            <Faturas />
          </TabsContent>
          <TabsContent value="ajustes">
            <Ajustes />
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  )
}