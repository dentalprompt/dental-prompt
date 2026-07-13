"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Download, FileText, Filter, ImageIcon, LoaderCircle, MessageCircle, PencilLine, Plus, ShieldAlert, Stethoscope, Upload, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import type { PatientDetail } from "@/modules/patients/types/patient-detail";

type DynamicTemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "checkbox" | "radio" | "select" | "multi_select";
  options: string[];
  required: boolean;
};

type TemplateOption = {
  id: string;
  name: string;
  description: string;
  specialty?: string;
  category?: string;
  content?: string;
  isActive: boolean;
};

type LocalFile = {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  url?: string | null;
};

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

function normalizeSummary(summary: string) {
  return summary
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] ?? "" : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

async function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] ?? "" : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Nao foi possivel converter o arquivo."));
    reader.readAsDataURL(blob);
  });
}

function renderFieldValue(value: string | string[] | boolean) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Nao";
  }

  return value;
}

function buildToothActionLabel(tooth: string) {
  const normalized = normalizeToothLabel(tooth);
  return /^\d{2}$/.test(normalized) ? `Dente ${normalized}` : normalized;
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
  const [selectedBudgetCardId, setSelectedBudgetCardId] = useState(patient.budgets[0]?.id ?? "");
  const [images, setImages] = useState<LocalFile[]>(patient.images);
  const [documents, setDocuments] = useState<LocalFile[]>(patient.documents);
  const [anamnesisSummary, setAnamnesisSummary] = useState(patient.anamnesisSummary);
  const [anamnesisTemplates, setAnamnesisTemplates] = useState<TemplateOption[]>([]);
  const [contractTemplates, setContractTemplates] = useState<TemplateOption[]>([]);
  const [anamnesisFields, setAnamnesisFields] = useState<DynamicTemplateField[]>([]);
  const [anamnesisAnswers, setAnamnesisAnswers] = useState<Record<string, string | string[] | boolean>>({});
  const [selectedAnamnesisTemplate, setSelectedAnamnesisTemplate] = useState("");
  const [selectedContractTemplate, setSelectedContractTemplate] = useState("");
  const [selectedBudgetId, setSelectedBudgetId] = useState(patient.budgets[0]?.id ?? "");
  const [contractPreview, setContractPreview] = useState("");
  const [uploadCategory, setUploadCategory] = useState<"IMAGE" | "DOCUMENT">("DOCUMENT");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [anamnesisDialogOpen, setAnamnesisDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [anamnesisLoading, setAnamnesisLoading] = useState(false);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [anamnesisSubmitting, setAnamnesisSubmitting] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractSaving, setContractSaving] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

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
  const selectedBudgetCard = patient.budgets.find((budget) => budget.id === selectedBudgetCardId) ?? filteredBudgets[0] ?? null;

  useEffect(() => {
    let active = true;

    async function loadTemplates() {
      setTemplatesLoading(true);

      try {
        const [anamnesisResponse, contractResponse] = await Promise.all([
          fetch("/api/settings/anamneses", { cache: "no-store" }),
          fetch("/api/settings/contracts", { cache: "no-store" })
        ]);

        const anamnesisPayload = (await anamnesisResponse.json()) as { data?: TemplateOption[] };
        const contractPayload = (await contractResponse.json()) as { data?: TemplateOption[] };

        if (!active) {
          return;
        }

        const activeAnamnesisTemplates = (anamnesisPayload.data ?? []).filter((item) => item.isActive);
        const activeContractTemplates = (contractPayload.data ?? []).filter((item) => item.isActive);

        setAnamnesisTemplates(activeAnamnesisTemplates);
        setContractTemplates(activeContractTemplates);
        setSelectedAnamnesisTemplate((current) => current || activeAnamnesisTemplates[0]?.id || "");
        setSelectedContractTemplate((current) => current || activeContractTemplates[0]?.id || "");
      } catch {
        if (active) {
          setInlineError("Nao foi possivel carregar modelos dinâmicos.");
        }
      } finally {
        if (active) {
          setTemplatesLoading(false);
        }
      }
    }

    void loadTemplates();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAnamnesisFields() {
      if (!selectedAnamnesisTemplate) {
        setAnamnesisFields([]);
        setAnamnesisAnswers({});
        return;
      }

      setAnamnesisLoading(true);

      try {
        const response = await fetch(`/api/settings/anamneses/${selectedAnamnesisTemplate}/fields`, {
          cache: "no-store"
        });

        const payload = (await response.json()) as { data?: DynamicTemplateField[]; message?: string };

        if (!response.ok) {
          throw new Error(payload.message || "Nao foi possivel carregar os campos.");
        }

        if (!active) {
          return;
        }

        const fields = payload.data ?? [];
        setAnamnesisFields(fields);
        setAnamnesisAnswers(
          Object.fromEntries(
            fields.map((field) => [
              field.key,
              field.type === "checkbox" ? false : field.type === "multi_select" ? [] : ""
            ])
          )
        );
      } catch (error) {
        if (active) {
          setInlineError(error instanceof Error ? error.message : "Falha ao carregar a anamnese.");
        }
      } finally {
        if (active) {
          setAnamnesisLoading(false);
        }
      }
    }

    void loadAnamnesisFields();

    return () => {
      active = false;
    };
  }, [selectedAnamnesisTemplate]);

  async function handleUploadSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!uploadFile) {
      setInlineError("Selecione um arquivo para continuar.");
      return;
    }

    setUploadSubmitting(true);
    setInlineError(null);
    setInlineMessage(null);

    try {
      const base64Content = await fileToBase64(uploadFile);
      const response = await fetch(`/api/patients/${patient.id}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: uploadFile.name,
          type: uploadFile.type || "application/octet-stream",
          category: uploadCategory,
          base64Content
        })
      });

      const payload = (await response.json()) as { data?: LocalFile; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Nao foi possivel enviar o arquivo.");
      }

      if (uploadCategory === "IMAGE") {
        setImages((current) => [payload.data!, ...current]);
      } else {
        setDocuments((current) => [payload.data!, ...current]);
      }

      setUploadFile(null);
      setUploadDialogOpen(false);
      setInlineMessage("Arquivo enviado com sucesso.");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Falha ao enviar o arquivo.");
    } finally {
      setUploadSubmitting(false);
    }
  }

  async function handleAnamnesisSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAnamnesisTemplate) {
      setInlineError("Selecione um modelo de anamnese.");
      return;
    }

    setAnamnesisSubmitting(true);
    setInlineError(null);
    setInlineMessage(null);

    try {
      const response = await fetch(`/api/patients/${patient.id}/anamneses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          templateId: selectedAnamnesisTemplate,
          answers: anamnesisAnswers
        })
      });

      const payload = (await response.json()) as { data?: { summary?: string }; message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Nao foi possivel salvar a anamnese.");
      }

      const summary = payload.data?.summary ? normalizeSummary(payload.data.summary) : [];
      if (summary.length) {
        setAnamnesisSummary(summary);
      }

      setAnamnesisDialogOpen(false);
      setInlineMessage("Anamnese registrada com sucesso.");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Falha ao salvar a anamnese.");
    } finally {
      setAnamnesisSubmitting(false);
    }
  }

  async function handleContractPreview(downloadPdf = false) {
    if (!selectedContractTemplate) {
      setInlineError("Selecione um modelo de contrato.");
      return;
    }

    setContractLoading(true);
    setInlineError(null);
    setInlineMessage(null);

    try {
      const query = new URLSearchParams({
        patientId: patient.id
      });

      if (selectedBudgetId) {
        query.set("budgetId", selectedBudgetId);
      }

      if (downloadPdf) {
        query.set("format", "pdf");
      }

      const response = await fetch(
        `/api/settings/contracts/${selectedContractTemplate}/render?${query.toString()}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Nao foi possivel gerar o contrato.");
      }

      if (downloadPdf) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        setInlineMessage("Contrato em PDF gerado com sucesso.");
        return;
      }

      const payload = (await response.json()) as { data?: { rendered?: string } };
      setContractPreview(payload.data?.rendered ?? "");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Falha ao gerar o contrato.");
    } finally {
      setContractLoading(false);
    }
  }

  async function handleSaveContractToRecord() {
    if (!selectedContractTemplate) {
      setInlineError("Selecione um modelo de contrato.");
      return;
    }

    setContractSaving(true);
    setInlineError(null);
    setInlineMessage(null);

    try {
      const query = new URLSearchParams({
        patientId: patient.id,
        format: "pdf"
      });

      if (selectedBudgetId) {
        query.set("budgetId", selectedBudgetId);
      }

      const response = await fetch(
        `/api/settings/contracts/${selectedContractTemplate}/render?${query.toString()}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message || "Nao foi possivel gerar o PDF do contrato.");
      }

      const blob = await response.blob();
      const base64Content = await blobToBase64(blob);
      const activeTemplate = contractTemplates.find((template) => template.id === selectedContractTemplate);
      const fileName = `${activeTemplate?.name ?? "contrato"}-${patient.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`;

      const uploadResponse = await fetch(`/api/patients/${patient.id}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: fileName,
          type: "application/pdf",
          category: "DOCUMENT",
          base64Content
        })
      });

      const uploadPayload = (await uploadResponse.json()) as { data?: LocalFile; message?: string };

      if (!uploadResponse.ok || !uploadPayload.data) {
        throw new Error(uploadPayload.message || "Nao foi possivel salvar o contrato no prontuario.");
      }

      setDocuments((current) => [uploadPayload.data!, ...current]);
      setInlineMessage("Contrato salvo no prontuario do paciente.");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Falha ao salvar o contrato.");
    } finally {
      setContractSaving(false);
    }
  }

  function updateFieldAnswer(field: DynamicTemplateField, rawValue: string | boolean) {
    setAnamnesisAnswers((current) => {
      if (field.type === "multi_select" && typeof rawValue === "string") {
        const currentValues = Array.isArray(current[field.key]) ? (current[field.key] as string[]) : [];

        return {
          ...current,
          [field.key]: currentValues.includes(rawValue)
            ? currentValues.filter((value) => value !== rawValue)
            : [...currentValues, rawValue]
        };
      }

      return {
        ...current,
        [field.key]: rawValue
      };
    });
  }

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
            <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 size-4" />
              Enviar arquivo
            </Button>
            <Button variant="outline" onClick={() => setAnamnesisDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              Nova anamnese
            </Button>
            <Button onClick={() => setContractDialogOpen(true)}>
              <FileText className="mr-2 size-4" />
              Gerar contrato
            </Button>
            <Button variant="outline">
              <PencilLine className="mr-2 size-4" />
              Editar cadastro
            </Button>
          </div>
        </CardContent>
      </Card>

      {inlineMessage ? (
        <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
          {inlineMessage}
        </div>
      ) : null}

      {inlineError ? (
        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
          {inlineError}
        </div>
      ) : null}

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

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-white/70 bg-white/92">
                <CardHeader>
                  <CardTitle>Orcamentos</CardTitle>
                  <CardDescription>Selecione um orcamento e use os botoes dos dentes para navegar no planejamento clinico.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {filteredBudgets.length ? (
                    filteredBudgets.map((budget) => {
                      const isSelectedBudget = budget.id === selectedBudgetCardId;

                      return (
                        <div
                          key={budget.id}
                          className={[
                            "rounded-[1.25rem] border bg-background p-5 transition-all",
                            isSelectedBudget ? "border-primary shadow-soft" : "border-border"
                          ].join(" ")}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-950">{budget.number}</p>
                                {isSelectedBudget ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-primary">
                                    <CheckCircle2 className="size-3.5" />
                                    Em foco
                                  </span>
                                ) : null}
                              </div>
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
                            <Button
                              type="button"
                              variant={isSelectedBudget ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSelectedBudgetCardId(budget.id);
                                setSelectedBudgetId(budget.id);
                              }}
                            >
                              Selecionar orcamento
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBudgetCardId(budget.id);
                                setSelectedBudgetId(budget.id);
                                setContractDialogOpen(true);
                              }}
                            >
                              Gerar contrato
                            </Button>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {budget.teeth.length ? (
                              budget.teeth.map((tooth) => (
                                <Button
                                  key={`${budget.id}-${tooth}`}
                                  type="button"
                                  variant={normalizeToothLabel(tooth) === selectedTooth ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBudgetCardId(budget.id);
                                    setSelectedBudgetId(budget.id);
                                    setSelectedTooth(normalizeToothLabel(tooth));
                                  }}
                                >
                                  {buildToothActionLabel(tooth)}
                                </Button>
                              ))
                            ) : (
                              <span className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-slate-500">
                                Sem dentes vinculados
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">
                      Nenhum orcamento encontrado para o filtro atual.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/92">
                <CardHeader>
                  <CardTitle>Orcamento em foco</CardTitle>
                  <CardDescription>Resumo rapido do orcamento selecionado para facilitar contrato, filtro clinico e acompanhamento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedBudgetCard ? (
                    <>
                      <div className="rounded-[1.25rem] border border-border bg-background p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-950">{selectedBudgetCard.number}</p>
                            <p className="text-sm text-slate-500">
                              {selectedBudgetCard.professional} • {selectedBudgetCard.plan}
                            </p>
                          </div>
                          <Badge>{budgetStatus[selectedBudgetCard.status]}</Badge>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-slate-600">
                          <p><span className="font-medium text-slate-950">Data:</span> {formatDateOnly(selectedBudgetCard.date)}</p>
                          <p><span className="font-medium text-slate-950">Valor final:</span> {formatCurrency(selectedBudgetCard.finalValue)}</p>
                          <p><span className="font-medium text-slate-950">Descricao:</span> {selectedBudgetCard.description}</p>
                        </div>
                      </div>

                      <div className="rounded-[1.25rem] border border-border bg-background p-5">
                        <p className="text-sm font-medium text-slate-950">Dentes vinculados</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedBudgetCard.teeth.length ? (
                            selectedBudgetCard.teeth.map((tooth) => (
                              <Button
                                key={`selected-${selectedBudgetCard.id}-${tooth}`}
                                type="button"
                                variant={normalizeToothLabel(tooth) === selectedTooth ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTooth(normalizeToothLabel(tooth))}
                              >
                                {buildToothActionLabel(tooth)}
                              </Button>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">Este orcamento ainda nao possui dentes relacionados.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedBudgetId(selectedBudgetCard.id);
                            setContractDialogOpen(true);
                          }}
                        >
                          <FileText className="mr-2 size-4" />
                          Usar no contrato
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setSelectedTooth("all")}>
                          <Filter className="mr-2 size-4" />
                          Limpar filtro de dente
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Selecione um orcamento para visualizar o resumo detalhado.</p>
                  )}
                </CardContent>
              </Card>
            </div>
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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <CardTitle>Anamnese</CardTitle>
                  <CardDescription>Preparada para modelos dinamicos por especialidade e versionamento completo.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setAnamnesisDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Registrar anamnese
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {anamnesisSummary.map((item) => (
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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <CardTitle>Imagens</CardTitle>
                  <CardDescription>Fotos e radiografias vinculadas ao paciente com preparo para storage provider.</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadCategory("IMAGE");
                    setUploadDialogOpen(true);
                  }}
                >
                  <Upload className="mr-2 size-4" />
                  Nova imagem
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {images.length ? (
                images.map((item) => (
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
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-medium text-primary"
                      >
                        Visualizar arquivo
                      </a>
                    ) : null}
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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <CardTitle>Documentos</CardTitle>
                  <CardDescription>Arquivos e contratos com arquitetura pronta para PDF, DOCX e exportacoes futuras.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadCategory("DOCUMENT");
                      setUploadDialogOpen(true);
                    }}
                  >
                    <Upload className="mr-2 size-4" />
                    Novo documento
                  </Button>
                  <Button onClick={() => setContractDialogOpen(true)}>
                    <FileText className="mr-2 size-4" />
                    Novo contrato
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {documents.length ? (
                documents.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-background p-5">
                    <span className="rounded-2xl bg-accent p-3 text-primary">
                      <FileText className="size-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.type} • {formatDateOnly(item.createdAt)}</p>
                    </div>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto inline-flex text-sm font-medium text-primary"
                      >
                        Abrir
                      </a>
                    ) : null}
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

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar arquivo do paciente</DialogTitle>
            <DialogDescription>
              Adicione imagens, exames, contratos ou documentos sem sair da ficha.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUploadSubmit}>
            <div className="space-y-2">
              <Label htmlFor="upload-category">Categoria</Label>
              <select
                id="upload-category"
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value as "IMAGE" | "DOCUMENT")}
                className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary"
              >
                <option value="DOCUMENT">Documento</option>
                <option value="IMAGE">Imagem</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-file">Arquivo</Label>
              <Input
                id="upload-file"
                type="file"
                accept={uploadCategory === "IMAGE" ? "image/*" : undefined}
                onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={uploadSubmitting}>
                {uploadSubmitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                Enviar arquivo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={anamnesisDialogOpen} onOpenChange={setAnamnesisDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova anamnese</DialogTitle>
            <DialogDescription>
              Preencha um modelo dinâmico e registre o resumo diretamente no prontuário.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleAnamnesisSubmit}>
            <div className="space-y-2">
              <Label htmlFor="anamnesis-template">Modelo</Label>
              <select
                id="anamnesis-template"
                value={selectedAnamnesisTemplate}
                onChange={(event) => setSelectedAnamnesisTemplate(event.target.value)}
                className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary"
              >
                <option value="">{templatesLoading ? "Carregando modelos..." : "Selecione um modelo"}</option>
                {anamnesisTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}{template.specialty ? ` • ${template.specialty}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {anamnesisLoading ? (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Carregando campos do modelo...
              </div>
            ) : anamnesisFields.length ? (
              <div className="space-y-4">
                {anamnesisFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </Label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        required={field.required}
                        value={String(anamnesisAnswers[field.key] ?? "")}
                        onChange={(event) => updateFieldAnswer(field, event.target.value)}
                      />
                    ) : field.type === "select" ? (
                      <select
                        id={field.key}
                        required={field.required}
                        value={String(anamnesisAnswers[field.key] ?? "")}
                        onChange={(event) => updateFieldAnswer(field, event.target.value)}
                        className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary"
                      >
                        <option value="">Selecione</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "radio" ? (
                      <div className="flex flex-wrap gap-2">
                        {field.options.map((option) => (
                          <label
                            key={option}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm"
                          >
                            <input
                              type="radio"
                              name={field.key}
                              value={option}
                              checked={anamnesisAnswers[field.key] === option}
                              onChange={(event) => updateFieldAnswer(field, event.target.value)}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <label className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(anamnesisAnswers[field.key])}
                          onChange={(event) => updateFieldAnswer(field, event.target.checked)}
                        />
                        Marcar como sim
                      </label>
                    ) : field.type === "multi_select" ? (
                      <div className="flex flex-wrap gap-2">
                        {field.options.map((option) => {
                          const selectedValues = Array.isArray(anamnesisAnswers[field.key])
                            ? (anamnesisAnswers[field.key] as string[])
                            : [];
                          const checked = selectedValues.includes(option);

                          return (
                            <label
                              key={option}
                              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => updateFieldAnswer(field, option)}
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        required={field.required}
                        value={String(anamnesisAnswers[field.key] ?? "")}
                        onChange={(event) => updateFieldAnswer(field, event.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Este modelo ainda nao possui campos estruturados.
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAnamnesisDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={anamnesisSubmitting || !anamnesisFields.length}>
                {anamnesisSubmitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                Salvar anamnese
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar contrato</DialogTitle>
            <DialogDescription>
              Monte o contrato com variáveis do paciente e do orçamento, depois visualize ou exporte em PDF.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract-template">Modelo de contrato</Label>
                <select
                  id="contract-template"
                  value={selectedContractTemplate}
                  onChange={(event) => setSelectedContractTemplate(event.target.value)}
                  className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary"
                >
                  <option value="">{templatesLoading ? "Carregando modelos..." : "Selecione um contrato"}</option>
                  {contractTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}{template.category ? ` • ${template.category}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contract-budget">Orcamento vinculado</Label>
                <select
                  id="contract-budget"
                  value={selectedBudgetId}
                  onChange={(event) => setSelectedBudgetId(event.target.value)}
                  className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary"
                >
                  <option value="">Sem orcamento especifico</option>
                  {patient.budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.number} • {formatCurrency(budget.finalValue)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void handleContractPreview(false)} disabled={contractLoading}>
                {contractLoading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <FileText className="mr-2 size-4" />}
                Visualizar contrato
              </Button>
              <Button type="button" variant="outline" onClick={() => void handleContractPreview(true)} disabled={contractLoading}>
                <Download className="mr-2 size-4" />
                Exportar PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSaveContractToRecord()}
                disabled={contractSaving || contractLoading}
              >
                {contractSaving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
                Salvar no prontuario
              </Button>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-background p-5">
              <p className="mb-3 text-sm font-medium text-slate-950">Previa do contrato</p>
              {contractPreview ? (
                <div className="space-y-3 text-sm leading-7 text-slate-600">
                  {contractPreview.split("\n").map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Gere a previa para visualizar o contrato preenchido com os dados do paciente.
                </p>
              )}
            </div>

            {anamnesisFields.length ? (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-white/70 p-4">
                <p className="text-sm font-medium text-slate-950">Resumo da ultima anamnese preparada</p>
                <p className="mt-2 text-sm text-slate-500">
                  {anamnesisFields.map((field) => `${field.label}: ${renderFieldValue(anamnesisAnswers[field.key] ?? "")}`).join(" • ")}
                </p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
