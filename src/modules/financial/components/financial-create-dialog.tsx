"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFinancialEntrySchema, type CreateFinancialEntryFormValues } from "@/modules/financial/schemas/financial-schema";
import type { FinancialEntryItem } from "@/modules/financial/types/financial";
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

type Props = {
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
  entry?: FinancialEntryItem;
  trigger?: ReactNode;
};

export function FinancialCreateDialog({ patients, professionals, entry, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(entry);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateFinancialEntryFormValues>({
    resolver: zodResolver(createFinancialEntrySchema),
    defaultValues: {
      description: entry?.description ?? "",
      patientId: "",
      professionalId: "",
      category: entry?.category ?? "",
      paymentMethod: entry?.paymentMethod ?? "",
      amount: entry?.amount ?? 0,
      dueDate: entry?.dueDate ? entry.dueDate.slice(0, 10) : "",
      type: entry?.type ?? "INCOME",
      status: entry?.status ?? "PENDING"
    }
  });

  useEffect(() => {
    reset({
      description: entry?.description ?? "",
      patientId: "",
      professionalId: "",
      category: entry?.category ?? "",
      paymentMethod: entry?.paymentMethod ?? "",
      amount: entry?.amount ?? 0,
      dueDate: entry?.dueDate ? entry.dueDate.slice(0, 10) : "",
      type: entry?.type ?? "INCOME",
      status: entry?.status ?? "PENDING"
    });
  }, [entry, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch(isEditing ? `/api/financial/entries/${entry!.id}` : "/api/financial/entries", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...values,
        patientId: values.patientId || undefined,
        professionalId: values.professionalId || undefined,
        dueDate: values.dueDate || undefined
      })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? `Nao foi possivel ${isEditing ? "atualizar" : "criar"} o lancamento.`);
      return;
    }

    if (!isEditing) {
      reset({
        description: "",
        patientId: "",
        professionalId: "",
        category: "",
        paymentMethod: "",
        amount: 0,
        dueDate: "",
        type: "INCOME",
        status: "PENDING"
      });
    }

    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>+ Adicionar</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar lancamento" : "Novo lancamento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize tipo, status, descricao, forma de pagamento, vencimento e valor do lancamento."
              : "Cadastro de receitas e despesas com fluxo pronto para manutencao operacional da clinica."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("type")}
            >
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("status")}
            >
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="OVERDUE">Em atraso</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descricao</Label>
            <Input id="description" placeholder="Ex.: Parcela ortodontia" {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente</Label>
            <select
              id="patientId"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("patientId")}
            >
              <option value="">Sem paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="professionalId">Profissional</Label>
            <select
              id="professionalId"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("professionalId")}
            >
              <option value="">Sem profissional</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" placeholder="Tratamento, manutencao..." {...register("category")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de pagamento</Label>
            <Input id="paymentMethod" placeholder="PIX, Cartao, Boleto..." {...register("paymentMethod")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
            {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>
          {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Salvar lancamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FinancialEditTrigger({ entry, patients, professionals }: Props & { entry: FinancialEntryItem }) {
  return (
    <FinancialCreateDialog
      entry={entry}
      patients={patients}
      professionals={professionals}
      trigger={
        <Button variant="outline" size="sm">
          <PencilLine className="mr-2 size-4" />
          Editar
        </Button>
      }
    />
  );
}
