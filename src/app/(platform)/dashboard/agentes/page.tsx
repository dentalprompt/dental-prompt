import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ZApiSettingsPanel } from "@/modules/whatsapp/components/zapi-settings-panel";

export default async function AgentsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  await searchParams;

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4">
          <div className="space-y-3">
            <Badge>Canal oficial da clinica</Badge>
            <div className="space-y-2">
              <CardTitle>Agentes</CardTitle>
              <CardDescription>
                Esta area agora centraliza a configuraçao do WhatsApp da clinica via Z-API para testes no CRM.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
            Cole as credenciais da Z-API abaixo e faça o pareamento do WhatsApp por aqui.
          </div>
        </CardContent>
      </Card>

      <ZApiSettingsPanel />
    </div>
  );
}
