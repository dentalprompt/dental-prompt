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
import { createPlanSchema, type CreatePlanFormValues } from "@/modules/plans/schemas/plan-schema";
import type { PlanListItem } from "@/modules/plans/types/plan";

type Props = {
  plan?: PlanListItem;
  trigger?: ReactNode;
};

export function PlanCreateDialog({ plan, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(plan);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      isDefault: plan?.isDefault ?? false,
      isInsurance: plan?.isInsurance ?? false
    }
  });

  useEffect(() => {
    reset({
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      isDefault: plan?.isDefault ?? false,
      isInsurance: plan?.isInsurance ?? false
    });
  }, [plan, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch(isEditing ? `/api/plans/${plan!.id}` : "/api/plans", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? `Nao foi possivel ${isEditing ? "atualizar" : "criar"} o plano.`);
      return;
    }

    if (!isEditing) {
      reset({
        name: "",
        description: "",
        isDefault: false,
        isInsurance: false
      });
    }

    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>{isEditing ? "Editar plano" : "Novo plano"}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar plano" : "Criar plano"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o cadastro-base do plano sem interromper seu fluxo."
              : "Base inicial para convenios, tabela de precos, custos e reutilizacao em pacientes, tratamentos e financeiro."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome do plano</Label>
            <Input id="name" placeholder="Ex.: Particular Premium" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea id="description" placeholder="Resumo rapido do plano" {...register("description")} />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("isDefault")} />
            Plano padrao da clinica
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" {...register("isInsurance")} />
            Convenio / seguro odontologico
          </label>
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Salvar plano"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PlanEditTrigger({ plan }: { plan: PlanListItem }) {
  return (
    <PlanCreateDialog
      plan={plan}
      trigger={
        <Button variant="outline" className="w-full">
          <PencilLine className="mr-2 size-4" />
          Editar cadastro
        </Button>
      }
    />
  );
}
