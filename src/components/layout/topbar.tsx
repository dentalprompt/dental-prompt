"use client";

import { Bell, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}` as Route);
    }, 250);

    return () => clearTimeout(timeout);
  }, [pathname, router, searchParams, value]);

  const placeholder = useMemo(() => {
    if (pathname.includes("/conversas")) {
      return "Pesquisar por nome, telefone, etiqueta ou ultima mensagem";
    }

    if (pathname.includes("/pacientes")) {
      return "Pesquisar por nome, prontuario, CPF, celular ou e-mail";
    }

    if (pathname.includes("/planos")) {
      return "Pesquisar por nome do plano ou descricao";
    }

    if (pathname.includes("/agentes")) {
      return "Pesquisar por nome, numero, status ou modelo";
    }

    return "Pesquisar pacientes, mensagens, agenda...";
  }, [pathname]);

  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <div className="relative w-full max-w-2xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
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
