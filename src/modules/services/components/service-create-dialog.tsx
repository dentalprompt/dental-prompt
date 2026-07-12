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
import { Textarea } from "@/components/ui/textarea";
import { createServiceCardSchema, type CreateServiceCardFormValues } from "@/modules/services/schemas/service-schema";
import type { ServiceBoardView } from "@/modules/services/types/service";
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

export function ServiceCreateDialog({
  board,
  patients,
  professionals
}: {
  board: ServiceBoardView;
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
  } = useForm<CreateServiceCardFormValues>({
    resolver: zodResolver(createServiceCardSchema),
    defaultValues: {
      title: "",
      description: "",
      patientId: "",
      professionalId: "",
      priority: "NORMAL",
      dueDate: "",
      columnId: board.columns[0]?.id ?? ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/services/cards", {
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
      setServerError(payload.message ?? "Nao foi possivel criar o servico.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar servico</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo servico</DialogTitle>
          <DialogDescription>
            Cadastro inicial do fluxo operacional preparado para evoluir com Kanbans personalizaveis e historico.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente</Label>
            <select
              id="patientId"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("patientId")}
            >
              <option value="">Selecione</option>
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
              <option value="">Selecione</option>
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Tratamento / servico</Label>
            <Input id="title" placeholder="Ex.: Planejamento implantodontico" {...register("title")} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" placeholder="Detalhes operacionais do servico." {...register("description")} />
            {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="columnId">Kanban inicial</Label>
            <select
              id="columnId"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("columnId")}
            >
              {board.columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <select
              id="priority"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("priority")}
            >
              <option value="LOW">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dueDate">Data prevista</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar servico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
