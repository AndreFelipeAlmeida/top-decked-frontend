import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LojasPendentesTab } from './LojasPendentesTab';
import { EntidadesTab } from './EntidadesTab';

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2 text-foreground font-bold">Painel do Administrador</h1>
        <p className="text-muted-foreground">Governança da plataforma: moderação de lojas e gestão de dados.</p>
      </div>

      <Tabs defaultValue="moderacao">
        <TabsList>
          <TabsTrigger value="moderacao">Moderação de Lojas</TabsTrigger>
          <TabsTrigger value="entidades">Entidades</TabsTrigger>
        </TabsList>

        <TabsContent value="moderacao" className="pt-4">
          <LojasPendentesTab />
        </TabsContent>

        <TabsContent value="entidades" className="pt-4">
          <EntidadesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
