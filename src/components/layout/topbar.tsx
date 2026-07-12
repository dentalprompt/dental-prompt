import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Pesquisar pacientes, mensagens, agenda..."
          className="h-12 rounded-full border-white/70 bg-white/78 pl-9 shadow-soft backdrop-blur"
        />
      </div>
      <button
        type="button"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/78 text-slate-700 shadow-soft backdrop-blur transition hover:bg-white"
        aria-label="Notificacoes"
      >
        <Bell className="size-4" />
      </button>
      <button
        type="button"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-white shadow-soft"
        aria-label="Conta"
      >
        DP
      </button>
    </div>
  );
}
