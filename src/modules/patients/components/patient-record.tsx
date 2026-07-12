"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Filter, ImageIcon, MessageCircle, PencilLine, ShieldAlert, Stethoscope, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import type { PatientDetail } from "@/modules/patients/types/patient-detail";

function formatDateTime(value: string | null) {
  if (!value) return "Nao informado";
  return format(new Date(value), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR });
}

function formatDateOnly(value: string | null) {
  if (!value) return "Nao informado";
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

const budgetStatus: Record<string, string> = {
  DRAFT: "Em elaboracao",
  SENT: "Enviado",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  CANCELED: "Cancelado",
  FINISHED: "Finalizado"
};

const treatmentStatus: Record<string, string> = {
  PLANNED: "Planejado",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluido",
  CANCELED: "Cancelado",
  WAITING: "Aguardando"
};

const debtStatus: Record<string, { label: string; variant: "warning" | "success" | "default" }> = {
  PENDING: { label: "Pendente", variant: "default" },
  OVERDUE: { label: "Em atraso", variant: "warning" },
  PAID: { label: "Pago", variant: "success" }
};

const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

function normalizeToothLabel(value: string) {
  return value.trim().toUpperCase();
}

function matchesToothFilter(teeth: string[], selectedTooth: string) {
  if (selectedTooth === "all") {
    return true;
  }

  return teeth.some((tooth) => {
    const normalized = normalizeToothLabel(tooth);

    if (normalized === selectedTooth) {
      return true;
    }

    return normalized === "ARCADA COMPLETA" || normalized === "ARCO COMPLETO";
  });
}

function buildToothRegistry(patient: PatientDetail) {
  const treatmentTeeth = patient.treatments
    .map((treatment) => normalizeToothLabel(treatment.tooth))
    .filter((tooth) => /^\d{2}$/.test(tooth));

  const budgetTeeth = patient.budgets
    .flatMap((budget) => budget.teeth)
    .map((tooth) => normalizeToothLabel(tooth))
    .filter((tooth) => /^\d{2}$/.test(tooth));

  return new Set([...treatmentTeeth, ...budgetTeeth]);
}

function ToothButton({
  tooth,
  selected,
  active,
  onClick
}: {
  tooth: string;
  selected: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex h-10 items-center justify-center rounded-xl border text-sm font-semibold transition-all",
        selected
          ? "border-transparent bg-gradient-to-r from-primary to-secondary text-white shadow-soft"
          : active
            ? "border-cyan-200 bg-cyan-50/80 text-primary"
            : "border-white/60 bg-white/65 text-slate-500 hover:border-cyan-200 hover:text-primary"
      ].join(" ")}
    >
      {tooth}
    </button>
  );
}

function OdontogramCard({
  selectedTooth,
  onSelectTooth,
  activeTeeth
}: {
  selectedTooth: string;
  onSelectTooth: (tooth: string) => void;
  activeTeeth: Set<string>;
}) {
  return (
    <Card className="border-white/70 bg-white/92">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle>Odontograma interativo</CardTitle>
            <CardDescription>Selecione um dente para filtrar orcamentos e tratamentos vinculados.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => onSelectTooth("all")}>
            <Filter className="size-4" />
            Todos os dentes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Arcada superior</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-8 xl:grid-cols-16">
            {upperTeeth.map((tooth) => (
              <ToothButton
                key={tooth}
                tooth={tooth}
                selected={selectedTooth === tooth}
                active={activeTeeth.has(tooth)}
                onClick={() => onSelectTooth(tooth)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Arcada inferior</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-8 xl:grid-cols-16">
            {lowerTeeth.map((tooth) => (
              <ToothButton
                key={tooth}
                tooth={tooth}
                selected={selectedTooth === tooth}
                active={activeTeeth.has(tooth)}
                onClick={() => onSelectTooth(tooth)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-white/60 bg-white/70 p-4 text-sm text-slate-600">
          {selectedTooth === "all"
            ? "Mostrando todos os dentes e registros clinicos do paciente."
            : `Filtro ativo no dente ${selectedTooth}.`}
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientRecord({ patient }: { patient: PatientDetail }) {
  const [selectedTooth, setSelectedTooth] = useState("all");

  const activeTeeth = useMemo(() => buildToothRegistry(patient), [patient]);
  const filteredBudgets = useMemo(
    () => patient.budgets.filter((budget) => matchesToothFilter(budget.teeth, selectedTooth)),
    [patient.budgets, selectedTooth]
  );
  const filteredTreatments = useMemo(
    () =>
      patient.treatments.filter((treatment) =>
        matchesToothFilter([treatment.tooth], selectedTooth)
      ),
    [patient.treatments, selectedTooth]
  );
  const overdueDebts = patient.debts.filter((debt) => debt.status === "OVERDUE").length;
  const totalBudgeted = patient.budgets.reduce((sum, budget) => sum + budget.finalValue, 0);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link href="/dashboard/pacientes" className="text-sm font-medium text-primary">
              Voltar para pacientes
            </Link>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">{patient.fullName}</h1>
                <Badge variant="success">{patient.status}</Badge>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Prontuario {patient.chartNumber ?? "nao informado"} • Plano {patient.plan ?? "nao informado"} • Ultima consulta {formatDateTime(patient.lastAppointment)}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline">
              <MessageCircle className="mr-2 size-4" />
              WhatsApp
            </Button>
            <Button variant="outline">
              <PencilLine className="mr-2 size-4" />
              Editar cadastro
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["CPF", patient.cpf ?? "Nao informado"],
          ["Celular", patient.mobilePhone ?? "Nao informado"],
          ["Proxima consulta", formatDateTime(patient.nextAppointment)],
          ["Profissional", patient.responsibleProfessional ?? "Nao definido"]
        ].map(([label, value]) => (
          <Card key={label} className="border-white/70 bg-white/92">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-base font-semibold text-slate-950">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Orcamentos ativos",
            value: String(patient.budgets.length),
            helper: `${formatCurrency(totalBudgeted)} em negociacao/execucao`,
            icon: Wallet
          },
          {
            label: "Tratamentos",
            value: String(patient.treatments.length),
            helper: `${filteredTreatments.length} visiveis no filtro atual`,
            icon: Stethoscope
          },
          {
            label: "Alertas financeiros",
            value: String(overdueDebts),
            helper: overdueDebts ? "Existem debitos exigindo acompanhamento" : "Nenhum debito em atraso",
            icon: ShieldAlert
          },
          {
            label: "Documentos e imagens",
            value: String(patient.documents.length + patient.images.length),
            helper: "Prontuario digital consolidado",
            icon: FileText
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="border-white/70 bg-white/92">
              <CardContent className="flex items-start justify-between p-5">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-950">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.helper}</p>
                </div>
                <span className="rounded-2xl bg-cyan-100/80 p-3 text-primary">
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="sobre">
        <TabsList>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
          <TabsTrigger value="orcamentos">Orcamentos</TabsTrigger>
          <TabsTrigger value="tratamentos">Tratamentos</TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="debitos">Debitos</TabsTrigger>
        </TabsList>

        <TabsContent value="sobre">
          <Card className="border-white/70 bg-white/92">
            <CardHeader>
              <CardTitle>Resumo cadastral</CardTitle>
              <CardDescription>
                Area preparada para consolidar dados pessoais, responsavel, plano, endereco e historico resumido.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 text-sm text-slate-600">
                <p><span className="font-medium text-slate-950">Nome:</span> {patient.fullName}</p>
                <p><span className="font-medium text-slate-950">CPF:</span> {patient.cpf ?? "Nao informado"}</p>
                <p><span className="font-medium text-slate-950">Nascimento:</span> {formatDateOnly(patient.birthDate)}</p>
                <p><span className="font-medium text-slate-950">E-mail:</span> {patient.email ?? "Nao informado"}</p>
                <p><span className="font-medium text-slate-950">WhatsApp:</span> {patient.whatsappPhone ?? "Nao informado"}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-5">
                <p className="text-sm font-medium text-slate-950">Observacoes</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {patient.notes ?? "Nenhuma observacao registrada ate o momento."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos">
          <div className="space-y-4">
            <OdontogramCard selectedTooth={selectedTooth} onSelectTooth={setSelectedTooth} activeTeeth={activeTeeth} />

            <Card className="border-white/70 bg-white/92">
              <CardHeader>
                <CardTitle>Orcamentos</CardTitle>
                <CardDescription>Estrutura pronta para criar, editar, duplicar e converter em tratamento.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {filteredBudgets.length ? (
                  filteredBudgets.map((budget) => (
                    <div key={budget.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-950">{budget.number}</p>
                          <p className="text-sm text-slate-500">
                            {budget.professional} • {budget.plan} • {formatDateOnly(budget.date)}
                          </p>
                          <p className="text-sm leading-6 text-slate-600">{budget.description}</p>
                        </div>
                        <Badge>{budgetStatus[budget.status]}</Badge>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                        <p><span className="font-medium text-slate-950">Valor total:</span> {formatCurrency(budget.value)}</p>
                        <p><span className="font-medium text-slate-950">Valor final:</span> {formatCurrency(budget.finalValue)}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {budget.teeth.length ? (
                          budget.teeth.map((tooth) => (
                            <button
                              key={`${budget.id}-${tooth}`}
                              type="button"
                              onClick={() => setSelectedTooth(normalizeToothLabel(tooth))}
                              className={[
                                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                                normalizeToothLabel(tooth) === selectedTooth
                                  ? "border-transparent bg-primary text-white"
                                  : "border-cyan-100 bg-cyan-50/80 text-primary"
                              ].join(" ")}
                            >
                              {tooth}
                            </button>
                          ))
                        ) : (
                          <span className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-slate-500">
                            Sem dentes vinculados
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhum orcamento encontrado para o filtro atual.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tratamentos">
          <div className="grid gap-4">
            <OdontogramCard selectedTooth={selectedTooth} onSelectTooth={setSelectedTooth} activeTeeth={activeTeeth} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-white/70 bg-white/92">
              <CardHeader>
                <CardTitle>Odontograma e procedimentos</CardTitle>
                <CardDescription>
                  Base inicial para procedimentos por dente/face, historico clinico e evolucao de status.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {filteredTreatments.length ? (
                  filteredTreatments.map((treatment) => (
                    <div key={treatment.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">{treatment.procedure}</p>
                          <p className="text-sm text-slate-500">
                            Dente {treatment.tooth} • Face {treatment.face} • {treatment.professional}
                          </p>
                        </div>
                        <Badge>{treatmentStatus[treatment.status]}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Nenhum tratamento encontrado para o dente selecionado.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-white/70 bg-white/92">
              <CardHeader>
                <CardTitle>Evolucao clinica</CardTitle>
                <CardDescription>Historico de observacoes e anexos clinicos por atendimento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.evolutions.length ? (
                  patient.evolutions.map((evolution) => (
                    <div key={evolution.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                      <p className="font-semibold text-slate-950">{evolution.professional}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {formatDateTime(evolution.createdAt)}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{evolution.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Nenhuma evolucao cadastrada.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anamnese">
          <Card className="border-white/70 bg-white/92">
            <CardHeader>
              <CardTitle>Anamnese</CardTitle>
              <CardDescription>Preparada para modelos dinamicos por especialidade e versionamento completo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.anamnesisSummary.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-border bg-background p-4 text-sm text-slate-600">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imagens">
          <Card className="border-white/70 bg-white/92">
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
              <CardDescription>Fotos e radiografias vinculadas ao paciente com preparo para storage provider.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {patient.images.length ? (
                patient.images.map((item) => (
                  <div key={item.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl bg-accent p-3 text-primary">
                        <ImageIcon className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.type} • {formatDateOnly(item.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Nenhuma imagem vinculada ao paciente.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card className="border-white/70 bg-white/92">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Arquivos e contratos com arquitetura pronta para PDF, DOCX e exportacoes futuras.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {patient.documents.length ? (
                patient.documents.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background p-5">
                    <span className="rounded-2xl bg-accent p-3 text-primary">
                      <FileText className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.type} • {formatDateOnly(item.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Nenhum documento anexado.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debitos">
          <Card className="border-white/70 bg-white/92">
            <CardHeader>
              <CardTitle>Debitos</CardTitle>
              <CardDescription>Visao financeira do paciente com base pronta para integracao direta com o modulo financeiro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.debts.length ? (
                patient.debts.map((debt) => (
                  <div key={debt.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="rounded-2xl bg-accent p-3 text-primary">
                          <Wallet className="size-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-950">{debt.description}</p>
                          <p className="text-sm text-slate-500">Vencimento em {formatDateOnly(debt.dueDate)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-950">{formatCurrency(debt.amount)}</p>
                        <Badge variant={debtStatus[debt.status].variant}>{debtStatus[debt.status].label}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Nenhum debito encontrado para este paciente.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
