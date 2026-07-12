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
import {
  createPatientSchema,
  type CreatePatientFormValues
} from "@/modules/patients/schemas/patient-schema";

export function PatientCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreatePatientFormValues>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: "",
      cpf: "",
      rg: "",
      email: "",
      mobilePhone: "",
      whatsappPhone: "",
      birthDate: "",
      chartNumber: "",
      notes: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? "Nao foi possivel criar o paciente.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Novo paciente</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar paciente</DialogTitle>
          <DialogDescription>
            Estrutura inicial do cadastro pronta para evoluir com plano, endereco, responsavel, etiquetas e historico.
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
              {isSubmitting ? "Salvando..." : "Salvar paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
