import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, ShieldCheck, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanProcedureCreateDialog } from "@/modules/plans/components/plan-procedure-create-dialog";
import { PlanProcedureEditor } from "@/modules/plans/components/plan-procedure-editor";
import type { PlanDetail } from "@/modules/plans/types/plan";

export function PlanDetailView({ plan }: { plan: PlanDetail }) {
  const specialties = plan.procedures.reduce<Record<string, PlanDetail["procedures"]>>((accumulator, procedure) => {
    accumulator[procedure.specialty] ??= [];
    accumulator[procedure.specialty].push(procedure);
    return accumulator;
  }, {});

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link href="/dashboard/planos" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <ArrowLeft className="size-4" />
              Voltar para planos
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">{plan.name}</h1>
                {plan.isDefault ? <Badge variant="success">Plano padrao</Badge> : null}
                {plan.isInsurance ? <Badge variant="info">Convenio</Badge> : null}
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-500">
                {plan.description ?? "Sem descricao cadastrada para este plano."}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Procedimentos</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{plan.procedures.length}</p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Uso no sistema</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <WalletCards className="size-4 text-primary" />
                Financeiro e orcamentos
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Auditoria</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShieldCheck className="size-4 text-primary" />
                Alteracoes rastreaveis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Especialidades e procedimentos</CardTitle>
            <CardDescription>
              Estrutura pronta para pesquisa interna, reajuste em massa, importacao/exportacao e reutilizacao em toda a plataforma.
            </CardDescription>
          </div>
          <PlanProcedureCreateDialog planId={plan.id} />
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {Object.entries(specialties).map(([specialty, procedures]) => (
          <section key={specialty} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-accent p-3 text-primary">
                <FileSpreadsheet className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{specialty}</h2>
                <p className="text-sm text-slate-500">
                  {procedures.length} procedimento{procedures.length === 1 ? "" : "s"} nesta especialidade
                </p>
              </div>
            </div>
            <div className="grid gap-4">
              {procedures.map((procedure) => (
                <PlanProcedureEditor key={procedure.id} planId={plan.id} procedure={procedure} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
