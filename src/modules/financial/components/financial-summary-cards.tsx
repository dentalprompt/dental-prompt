import { ArrowDownCircle, ArrowUpCircle, Landmark } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FinancialSummary } from "@/modules/financial/types/financial";

export function FinancialSummaryCards({ summary }: { summary: FinancialSummary }) {
  const items = [
    {
      label: "Receitas",
      value: formatCurrency(summary.income),
      icon: ArrowUpCircle,
      color: "text-emerald-600"
    },
    {
      label: "Despesas",
      value: formatCurrency(summary.expense),
      icon: ArrowDownCircle,
      color: "text-rose-600"
    },
    {
      label: "Saldo",
      value: formatCurrency(summary.balance),
      icon: Landmark,
      color: "text-primary"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border-white/70 bg-white/92">
            <CardContent className="flex items-start justify-between p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="text-3xl font-bold tracking-tight text-slate-950">{item.value}</p>
              </div>
              <Icon className={`size-6 ${item.color}`} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
