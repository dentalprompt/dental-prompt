import { Bell, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">Dental Prompt CRM</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Visao geral da clinica</h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Pesquisar pacientes, mensagens, agenda..." className="pl-9" />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="rounded-full px-3 py-2">
            <Bell className="mr-2 size-3.5" />
            12 notificacoes
          </Badge>
          <div className="rounded-full bg-gradient-to-br from-primary to-secondary px-3 py-2 text-sm font-semibold text-white">
            DP
          </div>
        </div>
      </div>
    </div>
  );
}
