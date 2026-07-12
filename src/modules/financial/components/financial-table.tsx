"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FinancialEditTrigger } from "@/modules/financial/components/financial-create-dialog";
import type { FinancialEntryItem } from "@/modules/financial/types/financial";
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

const statusMap: Record<
  FinancialEntryItem["status"],
  { label: string; variant: "default" | "success" | "warning" | "info" }
> = {
  PENDING: { label: "Pendente", variant: "default" },
  PAID: { label: "Pago", variant: "success" },
  OVERDUE: { label: "Em atraso", variant: "warning" },
  CANCELED: { label: "Cancelado", variant: "warning" },
  SCHEDULED: { label: "Agendado", variant: "info" }
};

function formatDate(value: string | null) {
  if (!value) return "Nao informado";
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

export function FinancialTable({
  entries,
  patients,
  professionals
}: {
  entries: FinancialEntryItem[];
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
}) {
  const router = useRouter();
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

  const deleteEntry = async (id: string) => {
    setDeletingEntryId(id);

    const response = await fetch(`/api/financial/entries/${id}`, {
      method: "DELETE"
    });

    setDeletingEntryId(null);

    if (!response.ok) {
      return;
    }

    router.refresh();
  };

  if (!entries.length) {
    return (
      <Card className="border-white/70 bg-white/92">
        <CardContent className="flex min-h-56 items-center justify-center p-8 text-center text-sm text-slate-500">
          Nenhum lancamento encontrado para os filtros atuais.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hidden overflow-hidden border-white/70 bg-white/92 lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <th className="px-6 py-4">Descricao</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Forma</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {entries.map((entry) => (
                <tr key={entry.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-950">{entry.description}</div>
                    <div className="text-xs text-slate-500">{entry.type === "INCOME" ? "Receita" : "Despesa"}</div>
                  </td>
                  <td className="px-6 py-4">{entry.patientName ?? "Sem paciente"}</td>
                  <td className="px-6 py-4">{entry.professionalName ?? "Sem profissional"}</td>
                  <td className="px-6 py-4">{entry.category}</td>
                  <td className="px-6 py-4">{entry.paymentMethod}</td>
                  <td className="px-6 py-4 font-semibold text-slate-950">{formatCurrency(entry.amount)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusMap[entry.status].variant}>{statusMap[entry.status].label}</Badge>
                  </td>
                  <td className="px-6 py-4">{formatDate(entry.dueDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <FinancialEditTrigger entry={entry} patients={patients} professionals={professionals} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        disabled={deletingEntryId === entry.id}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {deletingEntryId === entry.id ? "Excluindo..." : "Excluir"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:hidden">
        {entries.map((entry) => (
          <Card key={entry.id} className="border-white/70 bg-white/92">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{entry.description}</h3>
                  <p className="text-sm text-slate-500">{entry.category} • {entry.paymentMethod}</p>
                </div>
                <Badge variant={statusMap[entry.status].variant}>{statusMap[entry.status].label}</Badge>
              </div>
              <div className="grid gap-2 text-sm text-slate-600">
                <p><span className="font-medium text-slate-950">Tipo:</span> {entry.type === "INCOME" ? "Receita" : "Despesa"}</p>
                <p><span className="font-medium text-slate-950">Paciente:</span> {entry.patientName ?? "Sem paciente"}</p>
                <p><span className="font-medium text-slate-950">Profissional:</span> {entry.professionalName ?? "Sem profissional"}</p>
                <p><span className="font-medium text-slate-950">Valor:</span> {formatCurrency(entry.amount)}</p>
                <p><span className="font-medium text-slate-950">Vencimento:</span> {formatDate(entry.dueDate)}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <FinancialEditTrigger entry={entry} patients={patients} professionals={professionals} />
                <Button
                  variant="outline"
                  onClick={() => deleteEntry(entry.id)}
                  disabled={deletingEntryId === entry.id}
                >
                  <Trash2 className="mr-2 size-4" />
                  {deletingEntryId === entry.id ? "Excluindo..." : "Excluir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
