"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, MessageSquareShare, Phone, PencilLine, ShieldCheck, Webhook } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { updateZApiSettingsSchema, type UpdateZApiSettingsFormValues } from "@/modules/settings/schemas/zapi-settings-schema";
import type { ZApiInstanceView } from "@/modules/settings/types/settings";

const initialZApiState: ZApiInstanceView = {
  tenantId: "",
  configured: false,
  apiBaseUrl: "",
  instanceId: "",
  whatsappNumber: "",
  status: "not_configured",
  connected: false,
  smartphoneConnected: false,
  connectedPhone: "",
  profileName: "",
  qrCodeBase64: "",
  qrCodeText: "",
  lastError: "",
  webhookUrl: "",
  updatedAt: null
};

function statusBadge(configured: boolean, connected: boolean) {
  if (connected) {
    return { label: "Ativo", variant: "success" as const };
  }

  if (configured) {
    return { label: "Configurado", variant: "warning" as const };
  }

  return { label: "Pendente", variant: "info" as const };
}

function maskToken(value: string) {
  if (!value) {
    return "Nao informado";
  }

  if (value.length <= 8) {
    return value;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function ZApiSettingsPanel() {
  const router = useRouter();
  const [zApi, setZApi] = useState<ZApiInstanceView>(initialZApiState);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UpdateZApiSettingsFormValues>({
    resolver: zodResolver(updateZApiSettingsSchema),
    defaultValues: {
      apiBaseUrl: "",
      instanceId: "",
      instanceToken: "",
      clientToken: "",
      whatsappNumber: ""
    }
  });

  const loadZApi = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/zapi", { cache: "no-store" });
      const payload = (await response.json()) as { data?: ZApiInstanceView; message?: string };

      if (!response.ok) {
        setServerError(payload.message ?? "Nao foi possivel carregar a configuracao da Z-API.");
        return;
      }

      const nextValue = payload.data ?? initialZApiState;
      setZApi(nextValue);
      reset({
        apiBaseUrl: nextValue.apiBaseUrl,
        instanceId: nextValue.instanceId,
        instanceToken: "",
        clientToken: "",
        whatsappNumber: nextValue.whatsappNumber
      });
      setServerError(null);
    } finally {
      setIsLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void loadZApi();
  }, [loadZApi]);

  const badge = statusBadge(zApi.configured, zApi.connected);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setFeedback(null);

    const response = await fetch("/api/settings/zapi", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { data?: ZApiInstanceView; message?: string };

    if (!response.ok) {
      setServerError(payload.message ?? "Nao foi possivel salvar as credenciais da Z-API.");
      return;
    }

    setZApi(payload.data ?? initialZApiState);
    setFeedback("Configuracao da Z-API salva com sucesso.");
    setOpen(false);
    router.refresh();
    await loadZApi();
  });

  async function handleAction(action: "sync-webhooks" | "refresh-status" | "disconnect") {
    setIsSyncing(true);
    setServerError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/settings/zapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      const payload = (await response.json()) as { data?: ZApiInstanceView; message?: string };

      if (!response.ok) {
        setServerError(payload.message ?? "Nao foi possivel executar a acao da Z-API.");
        return;
      }

      setZApi(payload.data ?? initialZApiState);
      setFeedback(
        action === "sync-webhooks"
          ? "Webhook sincronizado com sucesso."
          : action === "disconnect"
            ? "Instancia desconectada."
            : "Status atualizado com sucesso."
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/92">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-slate-950">Z-API da Clinica</h3>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Configure a instância oficial do WhatsApp da clínica e acompanhe o webhook do CRM nesta mesma área.
              </p>
            </div>
            <span className="rounded-2xl bg-accent p-3 text-primary">
              <MessageSquareShare className="size-5" />
            </span>
          </div>

          <div className="grid gap-3 xl:grid-cols-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">API</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Link2 className="size-4 text-primary" />
                {zApi.apiBaseUrl || "Nao informado"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Instancia</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShieldCheck className="size-4 text-primary" />
                {zApi.instanceId || "Nao informado"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Numero</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Phone className="size-4 text-primary" />
                {zApi.whatsappNumber || zApi.connectedPhone || "Nao informado"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Webhook</p>
              <p className="mt-2 flex items-center gap-2 break-all text-sm font-semibold text-slate-950">
                <Webhook className="size-4 shrink-0 text-primary" />
                {zApi.webhookUrl || "Nao informado"}
              </p>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resumo</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-semibold text-slate-950">{isLoading ? "Carregando..." : zApi.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Conexao do aparelho</p>
                <p className="font-semibold text-slate-950">{zApi.smartphoneConnected ? "Online" : "Desconectado"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Ultima atualizacao</p>
                <p className="font-semibold text-slate-950">{zApi.updatedAt ? new Date(zApi.updatedAt).toLocaleString("pt-BR") : "Nao disponivel"}</p>
              </div>
            </div>
          </div>

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}
          {zApi.lastError ? <p className="text-sm text-amber-600">{zApi.lastError}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PencilLine className="mr-2 size-4" />
                  Configurar Z-API
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Configurar Z-API</DialogTitle>
                  <DialogDescription>
                    Fluxo oficial validado na documentação da Z-API: `send-text`, `status` e atualização de webhook por instância.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="apiBaseUrl">API da instância</Label>
                    <Input id="apiBaseUrl" placeholder="https://api.z-api.io/instances/.../token/.../send-text" {...register("apiBaseUrl")} />
                    {errors.apiBaseUrl ? <p className="text-sm text-destructive">{errors.apiBaseUrl.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instanceId">ID da instância</Label>
                    <Input id="instanceId" placeholder="3F588942..." {...register("instanceId")} />
                    {errors.instanceId ? <p className="text-sm text-destructive">{errors.instanceId.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp</Label>
                    <Input id="whatsappNumber" placeholder="5511999999999" {...register("whatsappNumber")} />
                    {errors.whatsappNumber ? <p className="text-sm text-destructive">{errors.whatsappNumber.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instanceToken">Token da instância</Label>
                    <Input id="instanceToken" placeholder={maskToken(watch("instanceToken") || "")} {...register("instanceToken")} />
                    {errors.instanceToken ? <p className="text-sm text-destructive">{errors.instanceToken.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientToken">Client Token</Label>
                    <Input id="clientToken" placeholder={maskToken(watch("clientToken") || "")} {...register("clientToken")} />
                    {errors.clientToken ? <p className="text-sm text-destructive">{errors.clientToken.message}</p> : null}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="webhookPreview">Webhook do CRM</Label>
                    <Textarea id="webhookPreview" value={zApi.webhookUrl || "Nao disponivel"} readOnly />
                  </div>

                  {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}

                  <DialogFooter className="sm:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Salvando..." : "Salvar configuracao"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button type="button" variant="outline" onClick={() => void handleAction("sync-webhooks")} disabled={isSyncing || !zApi.configured}>
              Sincronizar webhook
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleAction("refresh-status")} disabled={isSyncing || !zApi.configured}>
              Atualizar status
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleAction("disconnect")} disabled={isSyncing || !zApi.configured}>
              Desconectar instancia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
