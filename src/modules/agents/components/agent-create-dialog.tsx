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
import { createAgentSchema, type CreateAgentFormValues } from "@/modules/agents/schemas/agent-schema";
import type { AgentListItem } from "@/modules/agents/types/agent";

type Props = {
  agent?: AgentListItem;
  trigger?: ReactNode;
};

export function AgentCreateDialog({ agent, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = Boolean(agent);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateAgentFormValues>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: agent?.name ?? "",
      description: agent?.description ?? "",
      whatsappNumber: agent?.whatsappNumber ?? "",
      model: agent?.model ?? process.env.NEXT_PUBLIC_DEFAULT_OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: agent?.temperature ?? 0.3,
      promptBase: "",
      initialMessage: "",
      status: agent?.status ?? "DRAFT"
    }
  });

  useEffect(() => {
    reset({
      name: agent?.name ?? "",
      description: agent?.description ?? "",
      whatsappNumber: agent?.whatsappNumber ?? "",
      model: agent?.model ?? process.env.NEXT_PUBLIC_DEFAULT_OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: agent?.temperature ?? 0.3,
      promptBase: "",
      initialMessage: "",
      status: agent?.status ?? "DRAFT"
    });
  }, [agent, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch(isEditing ? `/api/agents/${agent!.id}` : "/api/agents", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? `Nao foi possivel ${isEditing ? "atualizar" : "criar"} o agente.`);
      return;
    }

    if (!isEditing) {
      reset({
        name: "",
        description: "",
        whatsappNumber: "",
        model: process.env.NEXT_PUBLIC_DEFAULT_OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        promptBase: "",
        initialMessage: "",
        status: "DRAFT"
      });
    }

    setOpen(false);
    router.refresh();
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>{isEditing ? "Editar agente" : "Novo agente"}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar agente IA" : "Criar agente IA"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize nome, numero, modelo, temperatura e comportamento do agente."
              : "Base inicial para agentes de recepcao, comercial, financeiro, cobranca e suporte, todos centralizados no backend."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex.: Recepcionista IA" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Descricao</Label>
            <Input id="description" placeholder="Resumo do objetivo deste agente" {...register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Numero WhatsApp</Label>
            <Input id="whatsappNumber" placeholder="5511999990001" {...register("whatsappNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" placeholder="gpt-4o-mini" {...register("model")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperatura</Label>
            <Input id="temperature" type="number" step="0.1" min="0" max="1.5" {...register("temperature")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              {...register("status")}
            >
              <option value="DRAFT">Rascunho</option>
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="initialMessage">Mensagem inicial</Label>
            <Input id="initialMessage" placeholder="Mensagem de abertura do agente" {...register("initialMessage")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="promptBase">Prompt base</Label>
            <Textarea id="promptBase" placeholder="Instrucao central do comportamento do agente" {...register("promptBase")} />
            {errors.promptBase ? <p className="text-sm text-destructive">{errors.promptBase.message}</p> : null}
          </div>
          {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alteracoes" : "Salvar agente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AgentEditTrigger({ agent }: { agent: AgentListItem }) {
  return (
    <AgentCreateDialog
      agent={agent}
      trigger={
        <Button variant="outline" className="w-full">
          <PencilLine className="mr-2 size-4" />
          Editar agente
        </Button>
      }
    />
  );
}
