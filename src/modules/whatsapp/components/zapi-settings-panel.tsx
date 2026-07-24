"use client";

import { CheckCircle2, MessageSquareShare } from "lucide-react";
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

export function ZApiSettingsPanel() {
  const [zApi, setZApi] = useState<ZApiInstanceView>(initialZApiState);
  const [credentials, setCredentials] = useState({
    apiBaseUrl: "",
    instanceId: "",
    instanceToken: "",
    clientToken: "",
    whatsappNumber: ""
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
        apiBaseUrl: current.apiBaseUrl || nextValue.apiBaseUrl || "",
        instanceId: current.instanceId || nextValue.instanceId || "",
        instanceToken: current.instanceToken,
        clientToken: current.clientToken,
        whatsappNumber: current.whatsappNumber || nextValue.whatsappNumber || ""
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

  async function handleAction(action: "refresh-status" | "sync-webhooks" | "disconnect") {
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

      if (action === "sync-webhooks") {
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
            Configure aqui as credenciais da Z-API do tenant. O pareamento do WhatsApp continua sendo feito no painel da própria Z-API.
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
              <p className="text-sm text-slate-500">API da instância</p>
              <p className="mt-2 break-all font-medium text-slate-950">
                {zApi.apiBaseUrl || "https://api.z-api.io"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Instance ID</p>
              <p className="mt-2 break-all font-medium text-slate-950">
                {zApi.instanceId || "Informe o ID da instância da sua conta Z-API"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Numero do WhatsApp</p>
              <p className="mt-2 break-all font-medium text-slate-950">
                {zApi.whatsappNumber || "Informe o numero da clinica"}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Webhook do tenant</p>
              <p className="mt-2 break-all text-sm text-slate-700">
                {zApi.webhookUrl || "Defina NEXT_PUBLIC_APP_URL ou Z_API_WEBHOOK_BASE_URL"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-border bg-background p-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="zapi-api-base-url">API da instância</Label>
              <Input
                id="zapi-api-base-url"
                placeholder="https://api.z-api.io"
                value={credentials.apiBaseUrl}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    apiBaseUrl: event.target.value
                  }))
                }
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="zapi-whatsapp-number">Numero do WhatsApp</Label>
              <Input
                id="zapi-whatsapp-number"
                placeholder="5511999999999"
                value={credentials.whatsappNumber}
                onChange={(event) =>
                  setCredentials((current) => ({
                    ...current,
                    whatsappNumber: event.target.value
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
                  Cole as credenciais da Z-API, salve e registre o webhook. Depois conecte o número no painel da Z-API e volte aqui só para atualizar o status.
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
          <CardTitle>Como conectar</CardTitle>
          <CardDescription>
            O QR Code fica no painel da Z-API. Use esta área como checklist da integração no CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-slate-950">1. Salve as credenciais no CRM</p>
                  <p className="mt-1 text-sm text-slate-600">Preencha `API da instância`, `Instance ID`, `Token da instância`, `Client Token` e `Número do WhatsApp` nesta tela.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-slate-950">2. Registre o webhook</p>
                  <p className="mt-1 text-sm text-slate-600">Clique em `Registrar webhook` para a Z-API enviar eventos de conexão e mensagens para o Dental Prompt.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-slate-950">3. Conecte no painel da Z-API</p>
                  <p className="mt-1 text-sm text-slate-600">Abra a instância no painel da Z-API e escaneie o QR Code por lá com o WhatsApp Business da clínica.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium text-slate-950">4. Volte e atualize o status</p>
                  <p className="mt-1 text-sm text-slate-600">Depois do pareamento, clique em `Atualizar status` para confirmar a conexão dentro do CRM.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
