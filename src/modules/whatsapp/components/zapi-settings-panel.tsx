"use client";

import { MessageSquareShare, QrCode } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ZApiInstanceView } from "@/modules/settings/types/settings";

const initialZApiState: ZApiInstanceView = {
  tenantId: "",
  configured: false,
  instanceId: "",
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

export function ZApiSettingsPanel() {
  const [zApi, setZApi] = useState<ZApiInstanceView>(initialZApiState);
  const [credentials, setCredentials] = useState({
    instanceId: "",
    instanceToken: "",
    clientToken: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadZApi = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings/zapi", { cache: "no-store" });
      const payload = (await response.json()) as { data?: ZApiInstanceView; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Nao foi possivel carregar a integracao WhatsApp.");
        return;
      }

      const nextValue = payload.data ?? initialZApiState;
      setZApi(nextValue);
      setCredentials((current) => ({
        instanceId: current.instanceId || nextValue.instanceId || "",
        instanceToken: current.instanceToken,
        clientToken: current.clientToken
      }));
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadZApi();
  }, [loadZApi]);

  async function handleSaveCredentials() {
    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/settings/zapi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      const payload = (await response.json()) as { data?: ZApiInstanceView; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Nao foi possivel salvar as credenciais da Z-API.");
        return;
      }

      setZApi(payload.data ?? initialZApiState);
      setFeedback("Credenciais salvas e webhook registrado na Z-API.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAction(action: "refresh-status" | "refresh-qrcode" | "sync-webhooks" | "disconnect") {
    setIsSubmitting(true);
    setFeedback(null);
    setError(null);

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
        setError(payload.message ?? "Nao foi possivel executar a acao na Z-API.");
        return;
      }

      if (payload.data) {
        setZApi((current) => ({
          ...current,
          ...payload.data
        }));
      }

      if (action === "refresh-qrcode") {
        setFeedback("QR Code atualizado na Z-API.");
      } else if (action === "sync-webhooks") {
        setFeedback("Webhook registrado com sucesso na Z-API.");
      } else if (action === "disconnect") {
        setFeedback("Instancia desconectada da Z-API.");
      } else {
        setFeedback("Status atualizado com sucesso.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="space-y-2">
          <Badge variant="success">WhatsApp</Badge>
          <CardTitle>Z-API por clinica</CardTitle>
          <CardDescription>
            Configure aqui as credenciais da Z-API do tenant para enviar e receber mensagens pelo CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Status da integraçao</p>
              <p className="mt-2 font-medium text-slate-950">
                {zApi.configured ? "Credenciais salvas" : "Pendente de configuracao"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Estado da conexao</p>
              <p className="mt-2 font-medium capitalize text-slate-950">
                {isLoading ? "Carregando..." : zApi.status || "Nao iniciado"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Instance ID</p>
              <p className="mt-2 break-all font-medium text-slate-950">
                {zApi.instanceId || "Informe o ID da instância da sua conta Z-API"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Webhook do tenant</p>
              <p className="mt-2 break-all text-sm text-slate-700">
                {zApi.webhookUrl || "Defina NEXT_PUBLIC_APP_URL ou Z_API_WEBHOOK_BASE_URL"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-border bg-background p-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="zapi-instance-id">Instance ID</Label>
              <Input
                id="zapi-instance-id"
                placeholder="ID da instância"
                value={credentials.instanceId}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    instanceId: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zapi-instance-token">Token da instância</Label>
              <Input
                id="zapi-instance-token"
                placeholder="Token da instância"
                value={credentials.instanceToken}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    instanceToken: event.target.value
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zapi-client-token">Client Token</Label>
              <Input
                id="zapi-client-token"
                placeholder="Client Token"
                value={credentials.clientToken}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    clientToken: event.target.value
                  }))
                }
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-background p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-accent p-3 text-primary">
                <MessageSquareShare className="size-5" />
              </span>
              <div className="space-y-2">
                <p className="font-semibold text-slate-950">Fluxo rapido</p>
                <p className="text-sm leading-6 text-slate-600">
                  Cole as credenciais da Z-API, salve, registre o webhook e gere o QR Code. A partir disso, o CRM já consegue testar envio e retorno de mensagens.
                </p>
              </div>
            </div>
          </div>

          {zApi.connected ? (
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-semibold text-emerald-900">Numero conectado</p>
              <p className="mt-2 text-sm text-emerald-800">
                {zApi.profileName || "WhatsApp conectado"} {zApi.connectedPhone ? `• ${zApi.connectedPhone}` : ""}
              </p>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}
          {zApi.lastError ? <p className="text-sm text-amber-600">{zApi.lastError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSaveCredentials} disabled={isSubmitting}>
              {isSubmitting ? "Processando..." : "Salvar credenciais"}
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleAction("sync-webhooks")} disabled={isSubmitting || !zApi.configured}>
              Registrar webhook
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleAction("refresh-status")} disabled={isSubmitting || !zApi.configured}>
              Atualizar status
            </Button>
            <Button type="button" variant="outline" onClick={() => void handleAction("refresh-qrcode")} disabled={isSubmitting || !zApi.configured}>
              <QrCode className="size-4" />
              Gerar QR
            </Button>
            {zApi.configured ? (
              <Button type="button" variant="outline" onClick={() => void handleAction("disconnect")} disabled={isSubmitting}>
                Desconectar
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/92">
        <CardHeader className="space-y-2">
          <Badge variant="info">Pareamento</Badge>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>
            Gere o QR Code por aqui e escaneie com o WhatsApp Business da clínica.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {zApi.qrCodeBase64 ? (
            <div className="rounded-[1.5rem] border border-border bg-background p-4">
              <Image
                src={zApi.qrCodeBase64}
                alt="QR Code do WhatsApp"
                width={320}
                height={320}
                className="mx-auto w-full max-w-xs rounded-2xl"
                unoptimized
              />
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border bg-background p-6 text-sm leading-6 text-slate-500">
              Depois de salvar as credenciais, clique em gerar QR. Se a instância já estiver conectada, basta atualizar o status.
            </div>
          )}

          {zApi.qrCodeText ? (
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Leitura auxiliar</p>
              <p className="mt-2 break-all font-semibold text-slate-950">{zApi.qrCodeText}</p>
            </div>
          ) : null}

          <div className="rounded-[1.25rem] border border-border bg-background p-4 text-sm text-slate-600">
            O QR Code pode expirar rápido. Se isso acontecer, clique em `Gerar QR` novamente.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
