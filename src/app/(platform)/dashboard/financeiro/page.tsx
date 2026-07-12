import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialCreateDialog } from "@/modules/financial/components/financial-create-dialog";
import { FinancialFilters } from "@/modules/financial/components/financial-filters";
import { FinancialSummaryCards } from "@/modules/financial/components/financial-summary-cards";
import { FinancialTable } from "@/modules/financial/components/financial-table";
import { getFinancialSummary, listFinancialEntries } from "@/modules/financial/services/financial-service";
import { listPatients } from "@/modules/patients/services/patient-service";
import { listProfessionals } from "@/modules/team/services/professional-service";

export default async function FinancialPage({
  searchParams
}: {
  searchParams?: Promise<{
    type?: "INCOME" | "EXPENSE";
    status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "SCHEDULED";
    year?: string;
    month?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = {
    type: params?.type,
    status: params?.status,
    year: params?.year ? Number(params.year) : undefined,
    month: params?.month ? Number(params.month) : undefined
  };

  const [entries, summary, patients, professionals] = await Promise.all([
    listFinancialEntries(filters),
    getFinancialSummary(filters),
    listPatients(),
    listProfessionals()
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>Fluxo de caixa</Badge>
            <div className="space-y-2">
              <CardTitle>Financeiro</CardTitle>
              <CardDescription>
                Acompanhe receitas, despesas e saldo da clinica com filtros por tipo, status e competencia mensal.
              </CardDescription>
            </div>
          </div>
          <FinancialCreateDialog patients={patients} professionals={professionals} />
        </CardHeader>
        <CardContent className="space-y-4">
          <FinancialFilters />
        </CardContent>
      </Card>

      <FinancialSummaryCards summary={summary} />
      <FinancialTable entries={entries} patients={patients} professionals={professionals} />
    </div>
  );
}
