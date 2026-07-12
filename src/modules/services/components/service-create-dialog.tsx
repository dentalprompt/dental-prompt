"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import type { ServiceBoardView, ServiceCardView } from "@/modules/services/types/service";
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

type Props = {
  board: ServiceBoardView;
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
  card?: ServiceCardView;
  initialColumnId?: string;
  trigger?: ReactNode;
};

export function ServiceCreateDialog({
  board,
  patients,
  professionals,
  card,
  initialColumnId,
  trigger
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(card);

  const currentColumnId = useMemo(
    () =>
      initialColumnId ??
      board.columns.find((column) => column.cards.some((item) => item.id === card?.id))?.id ??
      board.columns[0]?.id ??
      "",
    [board, card?.id, initialColumnId]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateServiceCardFormValues>({
    resolver: zodResolver(createServiceCardSchema),
    defaultValues: {
      title: card?.title ?? "",
      description: card?.description ?? "",
      patientId: card?.patientId ?? "",
      professionalId: card?.professionalId ?? "",
      priority: card?.priority ?? "NORMAL",
      dueDate: card?.dueDate ? card.dueDate.slice(0, 10) : "",
      columnId: currentColumnId
    }
  });

  useEffect(() => {
    reset({
      title: card?.title ?? "",
      description: card?.description ?? "",
      patientId: card?.patientId ?? "",
      professionalId: card?.professionalId ?? "",
      priority: card?.priority ?? "NORMAL",
      dueDate: card?.dueDate ? card.dueDate.slice(0, 10) : "",
      columnId: currentColumnId
    });
  }, [card, currentColumnId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch(isEditing ? `/api/services/cards/${card!.id}` : "/api/services/cards", {
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
      setServerError(payload.message ?? `Nao foi possivel ${isEditing ? "atualizar" : "criar"} o servico.`);
      return;
    }

    if (!isEditing) {
      reset({
        title: "",
        description: "",
        patientId: "",
        professionalId: "",
        priority: "NORMAL",
        dueDate: "",
        columnId: currentColumnId
      });
    }

    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Adicionar servico</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar servico" : "Novo servico"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize paciente, profissional, prioridade, etapa e prazo do cartao."
              : "Cadastro operacional do fluxo de servicos com manutencao pronta para o Kanban da clinica."}
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
            <Label htmlFor="columnId">Kanban</Label>
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
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Salvar servico"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ServiceEditTrigger({
  board,
  patients,
  professionals,
  card
}: {
  board: ServiceBoardView;
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
  card: ServiceCardView;
}) {
  return (
    <ServiceCreateDialog
      board={board}
      patients={patients}
      professionals={professionals}
      card={card}
      trigger={
        <Button variant="outline" size="sm">
          <PencilLine className="mr-2 size-4" />
          Editar
        </Button>
      }
    />
  );
}
