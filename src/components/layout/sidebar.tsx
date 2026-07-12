"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  Bot,
  ChevronsLeft,
  ChevronsRight,
  Coins,
  KanbanSquare,
  LayoutDashboard,
  MessageSquareText,
  ReceiptText,
  Settings,
  Stethoscope,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/pacientes", label: "Pacientes", icon: Users },
  { href: "/dashboard/conversas", label: "Conversas", icon: MessageSquareText },
  { href: "/dashboard/agenda", label: "Agenda", icon: Stethoscope },
  { href: "/dashboard/planos", label: "Planos", icon: ReceiptText },
  { href: "/dashboard/servicos", label: "Servicos", icon: KanbanSquare },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: Coins },
  { href: "/dashboard/agentes", label: "Agentes", icon: Bot },
  { href: "/dashboard/configuracoes", label: "Configuracoes", icon: Settings }
] satisfies Array<{ href: Route; label: string; icon: LucideIcon }>;

export function Sidebar({
  collapsed,
  onToggle
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex h-full w-full flex-col border-r border-white/60 bg-white/38 p-4 shadow-soft backdrop-blur-xl transition-all duration-300",
        collapsed ? "max-w-24" : "max-w-[300px]"
      )}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onToggle}
        className="absolute -right-5 top-6 z-10 hidden rounded-full border border-white/70 bg-white/90 text-slate-700 shadow-soft backdrop-blur hover:bg-white lg:inline-flex"
        aria-label={collapsed ? "Abrir menu lateral" : "Fechar menu lateral"}
      >
        {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
      </Button>

      <div className="flex justify-center border-b border-white/60 pb-4">
        <Image
          src="/brand/dental-prompt-sidebar-logo.png"
          alt="Dental Prompt"
          width={collapsed ? 56 : 210}
          height={collapsed ? 56 : 70}
          priority
          className={cn(
            "h-auto object-contain transition-all duration-300",
            collapsed ? "w-14" : "w-[210px]"
          )}
        />
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
                "flex items-center px-4 py-3 text-sm font-medium transition-all",
                collapsed ? "justify-center" : "gap-3",
                isActive
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-cyan-500/20"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-4" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border border-white/60 bg-white/40 p-4 backdrop-blur-md">
        {collapsed ? (
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-primary">DP</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900">Gestao inteligente para sorrisos saudaveis.</p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Organize atendimentos, pacientes e resultados da sua clinica em um so lugar.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
