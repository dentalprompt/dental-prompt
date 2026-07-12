import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanCreateDialog } from "@/modules/plans/components/plan-create-dialog";
import { PlanList } from "@/modules/plans/components/plan-list";
import { PlanSearch } from "@/modules/plans/components/plan-search";
import { listPlans } from "@/modules/plans/services/plan-service";

export default async function PlansPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const plans = await listPlans(params?.q);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>Base de reutilizacao</Badge>
            <div className="space-y-2">
              <CardTitle>Planos</CardTitle>
              <CardDescription>
                Tabela de procedimentos, precos, custos e regras que alimentam pacientes, orcamentos, tratamentos, financeiro e relatorios.
              </CardDescription>
            </div>
          </div>
          <PlanCreateDialog />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <PlanSearch />
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              {plans.length} plano{plans.length === 1 ? "" : "s"} encontrado{plans.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardContent>
      </Card>

      <PlanList plans={plans} />
    </div>
  );
}
