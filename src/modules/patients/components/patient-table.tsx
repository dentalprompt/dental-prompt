import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, PencilLine, UserRoundSearch } from "lucide-react";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PatientEditTrigger } from "@/modules/patients/components/patient-create-dialog";
import type { PatientListItem } from "@/modules/patients/types/patient";

const statusLabels: Record<PatientListItem["status"], { label: string; variant: "default" | "success" | "warning" | "info" }> = {
  ACTIVE: { label: "Ativo", variant: "success" },
  LEAD: { label: "Lead", variant: "info" },
  IN_TREATMENT: { label: "Em tratamento", variant: "default" },
  INACTIVE: { label: "Inativo", variant: "warning" },
  ARCHIVED: { label: "Arquivado", variant: "warning" }
};

function formatBirthDate(value: string | null) {
  if (!value) {
    return "Nao informado";
  }

  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

export function PatientTable({ patients }: { patients: PatientListItem[] }) {
  if (!patients.length) {
    return (
      <Card className="border-white/70 bg-white/92">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="rounded-full bg-accent p-4 text-primary">
            <UserRoundSearch className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Nenhum paciente encontrado</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ajuste a busca atual ou cadastre um novo paciente para iniciar a base da clinica.
            </p>
          </div>
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
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Prontuario</th>
                <th className="px-6 py-4">CPF</th>
                <th className="px-6 py-4">Celular</th>
                <th className="px-6 py-4">Nascimento</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {patients.map((patient) => (
                <tr key={patient.id} className="text-sm text-slate-700">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-950">{patient.fullName}</div>
                    <div className="text-xs text-slate-500">{patient.email ?? "Sem e-mail cadastrado"}</div>
                  </td>
                  <td className="px-6 py-4">{patient.chartNumber ?? "Nao informado"}</td>
                  <td className="px-6 py-4">{patient.cpf ?? "Nao informado"}</td>
                  <td className="px-6 py-4">{patient.mobilePhone ?? "Nao informado"}</td>
                  <td className="px-6 py-4">{formatBirthDate(patient.birthDate)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={statusLabels[patient.status].variant}>{statusLabels[patient.status].label}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-2 size-4" />
                        WhatsApp
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/pacientes/${patient.id}` as Route}>
                          <UserRoundSearch className="mr-2 size-4" />
                          Ficha
                        </Link>
                      </Button>
                      <PatientEditTrigger patient={patient} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:hidden">
        {patients.map((patient) => (
          <Card key={patient.id} className="border-white/70 bg-white/92">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{patient.fullName}</h3>
                  <p className="text-sm text-slate-500">{patient.email ?? "Sem e-mail cadastrado"}</p>
                </div>
                <Badge variant={statusLabels[patient.status].variant}>{statusLabels[patient.status].label}</Badge>
              </div>
              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p><span className="font-medium text-slate-950">Prontuario:</span> {patient.chartNumber ?? "Nao informado"}</p>
                <p><span className="font-medium text-slate-950">CPF:</span> {patient.cpf ?? "Nao informado"}</p>
                <p><span className="font-medium text-slate-950">Celular:</span> {patient.mobilePhone ?? "Nao informado"}</p>
                <p><span className="font-medium text-slate-950">Nascimento:</span> {formatBirthDate(patient.birthDate)}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" className="sm:flex-1">
                  <MessageCircle className="mr-2 size-4" />
                  WhatsApp
                </Button>
                <Button asChild variant="outline" className="sm:flex-1">
                  <Link href={`/dashboard/pacientes/${patient.id}` as Route}>
                    <UserRoundSearch className="mr-2 size-4" />
                    Ficha
                  </Link>
                </Button>
                <div className="sm:flex-1">
                  <PatientEditTrigger patient={patient} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
