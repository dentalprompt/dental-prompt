import { Bot, Cpu, MessageSquareText, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AgentListItem } from "@/modules/agents/types/agent";

const statusMap: Record<AgentListItem["status"], { label: string; variant: "success" | "warning" | "info" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  INACTIVE: { label: "Inativo", variant: "warning" },
  DRAFT: { label: "Rascunho", variant: "info" }
};

export function AgentList({ agents }: { agents: AgentListItem[] }) {
  if (!agents.length) {
    return (
      <Card className="border-white/70 bg-white/92">
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="rounded-full bg-accent p-4 text-primary">
            <Bot className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Nenhum agente encontrado</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Crie o primeiro agente para centralizar atendimento, fluxos e automacoes do tenant.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {agents.map((agent) => (
        <Card key={agent.id} className="border-white/70 bg-white/92">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-950">{agent.name}</h3>
                  <Badge variant={statusMap[agent.status].variant}>{statusMap[agent.status].label}</Badge>
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {agent.description ?? "Sem descricao cadastrada para este agente."}
                </p>
              </div>
              <span className="rounded-2xl bg-accent p-3 text-primary">
                <Bot className="size-5" />
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Modelo</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Cpu className="size-4 text-primary" />
                  {agent.model}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Numero</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Phone className="size-4 text-primary" />
                  {agent.whatsappNumber}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Temperatura</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <MessageSquareText className="size-4 text-primary" />
                  {agent.temperature.toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
