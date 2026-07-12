"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

export function FinancialCreateDialog({
  patients,
  professionals
}: {
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateFinancialEntryFormValues>({
    resolver: zodResolver(createFinancialEntrySchema),
    defaultValues: {
      description: "",
      patientId: "",
      professionalId: "",
      category: "",
      paymentMethod: "",
      amount: 0,
      dueDate: "",
      type: "INCOME",
      status: "PENDING"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/financial/entries", {
      method: "POST",
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
      setServerError(payload.message ?? "Nao foi possivel criar o lancamento.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Adicionar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lancamento</DialogTitle>
          <DialogDescription>
            Cadastro inicial de receitas e despesas preparado para fluxo de caixa, transacoes e futura nota fiscal.
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
              {isSubmitting ? "Salvando..." : "Salvar lancamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
