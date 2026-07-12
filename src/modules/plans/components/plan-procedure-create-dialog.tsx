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
import { createProcedureSchema, type CreateProcedureFormValues } from "@/modules/plans/schemas/plan-schema";

export function PlanProcedureCreateDialog({ planId }: { planId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateProcedureFormValues>({
    resolver: zodResolver(createProcedureSchema),
    defaultValues: {
      specialty: "",
      name: "",
      price: 0,
      cost: 0,
      isActive: true,
      usesToothFaces: false,
      notes: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch(`/api/plans/${planId}/procedures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? "Nao foi possivel criar o procedimento.");
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar procedimento</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo procedimento</DialogTitle>
          <DialogDescription>Cadastre um novo procedimento diretamente nesta tabela de plano.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Input id="specialty" placeholder="Ex.: Dentistica" {...register("specialty")} />
            {errors.specialty ? <p className="text-sm text-destructive">{errors.specialty.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Procedimento</Label>
            <Input id="name" placeholder="Ex.: Restauracao em resina" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Preco</Label>
            <Input id="price" type="number" step="0.01" min="0" {...register("price")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Custo</Label>
            <Input id="cost" type="number" step="0.01" min="0" {...register("cost")} />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("isActive")} />
            Procedimento ativo
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("usesToothFaces")} />
            Usa faces dentarias
          </label>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea id="notes" placeholder="Observacoes internas do procedimento" {...register("notes")} />
          </div>
          {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar procedimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
