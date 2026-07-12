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
import { Textarea } from "@/components/ui/textarea";
import {
  createPatientSchema,
  type CreatePatientFormValues
} from "@/modules/patients/schemas/patient-schema";
import type { PatientListItem } from "@/modules/patients/types/patient";

type Props = {
  patient?: PatientListItem;
  trigger?: ReactNode;
};

export function PatientCreateDialog({ patient, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(patient);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: patient?.fullName ?? "",
      cpf: patient?.cpf ?? "",
      rg: "",
      email: patient?.email ?? "",
      mobilePhone: patient?.mobilePhone ?? "",
      whatsappPhone: patient?.whatsappPhone ?? "",
      birthDate: patient?.birthDate ? patient.birthDate.slice(0, 10) : "",
      chartNumber: patient?.chartNumber ?? "",
      notes: ""
    }
  });

  useEffect(() => {
    reset({
      fullName: patient?.fullName ?? "",
      cpf: patient?.cpf ?? "",
      rg: "",
      email: patient?.email ?? "",
      mobilePhone: patient?.mobilePhone ?? "",
      whatsappPhone: patient?.whatsappPhone ?? "",
      birthDate: patient?.birthDate ? patient.birthDate.slice(0, 10) : "",
      chartNumber: patient?.chartNumber ?? "",
      notes: ""
    });
  }, [patient, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch(isEditing ? `/api/patients/${patient!.id}` : "/api/patients", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? `Nao foi possivel ${isEditing ? "atualizar" : "criar"} o paciente.`);
      return;
    }

    if (!isEditing) {
      reset({
        fullName: "",
        cpf: "",
        rg: "",
        email: "",
        mobilePhone: "",
        whatsappPhone: "",
        birthDate: "",
        chartNumber: "",
        notes: ""
      });
    }

    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>{isEditing ? "Editar paciente" : "Novo paciente"}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar paciente" : "Cadastrar paciente"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os principais dados do paciente sem sair da listagem."
              : "Estrutura inicial do cadastro pronta para evoluir com plano, endereco, responsavel, etiquetas e historico."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" placeholder="Ex.: Mariana Carvalho de Lima" {...register("fullName")} />
            {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <Input id="rg" placeholder="00.000.000-0" {...register("rg")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Celular</Label>
            <Input id="mobilePhone" placeholder="(11) 99999-9999" {...register("mobilePhone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappPhone">WhatsApp</Label>
            <Input id="whatsappPhone" placeholder="(11) 99999-9999" {...register("whatsappPhone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="paciente@email.com" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate">Nascimento</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chartNumber">Prontuario</Label>
            <Input id="chartNumber" placeholder="PC-00022" {...register("chartNumber")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea id="notes" placeholder="Informacoes iniciais sobre o paciente" {...register("notes")} />
          </div>
          {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Fechar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Salvar paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PatientEditTrigger({ patient }: { patient: PatientListItem }) {
  return (
    <PatientCreateDialog
      patient={patient}
      trigger={
        <Button variant="outline" size="sm">
          <PencilLine className="mr-2 size-4" />
          Editar
        </Button>
      }
    />
  );
}
