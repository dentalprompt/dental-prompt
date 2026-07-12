import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentCreateDialog } from "@/modules/agents/components/agent-create-dialog";
import { AgentList } from "@/modules/agents/components/agent-list";
import { AgentSearch } from "@/modules/agents/components/agent-search";
import { listAgents } from "@/modules/agents/services/agent-service";

export default async function AgentsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const agents = await listAgents(params?.q);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>IA centralizada no backend</Badge>
            <div className="space-y-2">
              <CardTitle>Agentes</CardTitle>
              <CardDescription>
                Gestao inicial de agentes IA por tenant, com modelo, temperatura, prompt base e numero WhatsApp preparados para futura Evolution API.
              </CardDescription>
            </div>
          </div>
          <AgentCreateDialog />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <AgentSearch />
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              {agents.length} agente{agents.length === 1 ? "" : "s"} encontrado{agents.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardContent>
      </Card>

      <AgentList agents={agents} />
    </div>
  );
}
