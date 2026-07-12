"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

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
import type { ConversationDetail, ConversationListItem } from "@/modules/conversations/types/conversation";
import type { PatientListItem } from "@/modules/patients/types/patient";

type Props = {
  patients: PatientListItem[];
  conversation?: ConversationDetail | ConversationListItem | null;
  trigger?: ReactNode;
};

export function ConversationCreateDialog({ patients, conversation, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [form, setForm] = useState({
    contactName: "",
    contactPhone: "",
    patientId: "",
    isAiEnabled: false
  });
  const isEditing = Boolean(conversation);

  useEffect(() => {
    const linkedPatientId =
      conversation && "patient" in conversation
        ? conversation.patient?.id ?? ""
        : conversation?.patientId ?? "";

    setForm({
      contactName: conversation?.contactName ?? "",
      contactPhone: conversation?.contactPhone ?? "",
      patientId: linkedPatientId,
      isAiEnabled: conversation?.isAiEnabled ?? false
    });
  }, [conversation]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    const response = await fetch(isEditing ? `/api/conversations/${conversation!.id}` : "/api/conversations", {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        patientId: form.patientId || undefined
      })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? `Nao foi possivel ${isEditing ? "atualizar" : "criar"} a conversa.`);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button>Nova conversa</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar conversa" : "Nova conversa"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize contato, paciente vinculado e status da IA." : "Crie uma nova conversa manual para acompanhamento."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="contactName">Nome do contato</Label>
            <Input
              id="contactName"
              value={form.contactName}
              onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefone</Label>
            <Input
              id="contactPhone"
              value={form.contactPhone}
              onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente vinculado</Label>
            <select
              id="patientId"
              value={form.patientId}
              onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sem paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isAiEnabled}
              onChange={(event) => setForm((current) => ({ ...current, isAiEnabled: event.target.checked }))}
            />
            IA habilitada nesta conversa
          </label>
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEditing ? "Salvar alteracoes" : "Salvar conversa"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
