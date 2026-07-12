"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Bot, Coins, LayoutDashboard, MessageSquareText, ReceiptText, Settings, Stethoscope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { DentalPromptLogo } from "@/components/brand/dental-prompt-logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/conversas", label: "Conversas", icon: MessageSquareText },
  { href: "/dashboard/agenda", label: "Agenda", icon: Stethoscope },
  { href: "/dashboard/planos", label: "Planos", icon: ReceiptText },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: Coins },
  { href: "/dashboard/agentes", label: "Agentes", icon: Bot },
  { href: "/dashboard/configuracoes", label: "Configuracoes", icon: Settings }
] satisfies Array<{ href: Route; label: string; icon: LucideIcon }>;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full max-w-80 flex-col rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="border-b border-border/70 pb-4">
        <DentalPromptLogo className="items-start" />
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-accent hover:text-slate-950"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-sm font-semibold">Plataforma SaaS pronta para escalar</p>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Multi-tenant, auditoria, IA e camadas de providers preparadas para migracao futura.
        </p>
      </div>
    </aside>
  );
}
