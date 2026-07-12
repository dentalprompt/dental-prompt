import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, ShieldCheck, Stethoscope, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlanEditTrigger } from "@/modules/plans/components/plan-create-dialog";
import type { PlanListItem } from "@/modules/plans/types/plan";

export function PlanList({ plans }: { plans: PlanListItem[] }) {
  if (!plans.length) {
    return (
      <Card className="border-white/70 bg-white/92">
        <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="rounded-full bg-accent p-4 text-primary">
            <Wallet className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Nenhum plano encontrado</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Crie o primeiro plano para alimentar pacientes, orcamentos, tratamentos e relatorios financeiros.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.id} className="border-white/70 bg-white/92">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-950">{plan.name}</h3>
                  {plan.isDefault ? <Badge variant="success">Plano padrao</Badge> : null}
                  {plan.isInsurance ? <Badge variant="info">Convenio</Badge> : null}
                </div>
                <p className="text-sm leading-6 text-slate-500">
                  {plan.description ?? "Sem descricao cadastrada para este plano."}
                </p>
              </div>
              <Badge variant={plan.isActive ? "success" : "warning"}>
                {plan.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Procedimentos</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{plan.proceduresCount}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Uso clinico</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <Stethoscope className="size-4 text-primary" />
                  Orcamentos e tratamentos
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Governanca</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <ShieldCheck className="size-4 text-primary" />
                  Historico pronto
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PlanEditTrigger plan={plan} />
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/planos/${plan.id}` as Route}>
                  Abrir configuracao completa
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
