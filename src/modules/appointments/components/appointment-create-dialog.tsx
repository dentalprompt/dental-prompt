"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import {
  createAppointmentSchema,
  type CreateAppointmentFormValues
} from "@/modules/appointments/schemas/appointment-schema";
import type { ProfessionalListItem } from "@/modules/team/types/professional";
import type { PatientListItem } from "@/modules/patients/types/patient";

type AppointmentCreateDialogProps = {
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
};

export function AppointmentCreateDialog({
  patients,
  professionals
}: AppointmentCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: patients[0]?.id ?? "",
      professionalId: professionals[0]?.id ?? "",
      title: "",
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      notes: "",
      status: "SCHEDULED"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? "Nao foi possivel criar o agendamento.");
      return;
    }

    reset({
      patientId: patients[0]?.id ?? "",
      professionalId: professionals[0]?.id ?? "",
      title: "",
      date: today,
      startTime: "09:00",
      endTime: "09:30",
      notes: "",
      status: "SCHEDULED"
    });
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo agendamento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar agendamento</DialogTitle>
          <DialogDescription>
            Base inicial do fluxo de agenda, preparada para conflito de horario, encaixe, retorno e integracao futura com financeiro.
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
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
            {errors.patientId ? <p className="text-sm text-destructive">{errors.patientId.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="professionalId">Profissional</Label>
            <select
              id="professionalId"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("professionalId")}
            >
              {professionals.map((professional) => (
                <option key={professional.id} value={professional.id}>
                  {professional.name}
                </option>
              ))}
            </select>
            {errors.professionalId ? <p className="text-sm text-destructive">{errors.professionalId.message}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Procedimento / titulo</Label>
            <Input id="title" placeholder="Ex.: Avaliacao inicial" {...register("title")} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("status")}
            >
              <option value="SCHEDULED">Agendado</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="RETURN">Retorno</option>
              <option value="WALK_IN">Encaixe</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora inicial</Label>
            <Input id="startTime" type="time" {...register("startTime")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">Hora final</Label>
            <Input id="endTime" type="time" {...register("endTime")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea id="notes" placeholder="Observacoes internas do agendamento" {...register("notes")} />
          </div>
          {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar agendamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
