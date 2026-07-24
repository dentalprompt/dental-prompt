import { prisma } from "@/lib/db/prisma";
import type { ZApiInstanceView } from "@/modules/settings/types/settings";
import type { UpdateZApiSettingsFormValues } from "@/modules/settings/schemas/zapi-settings-schema";

type SendZApiMessageInput = {
  tenantId: string;
  number: string;
  text: string;
};

type ZApiStoredInstance = {
  tenantId: string;
  apiBaseUrl: string | null;
  instanceId: string;
  instanceToken: string;
  clientToken: string;
  whatsappNumber: string | null;
  status: string;
  connected: boolean;
  smartphoneConnected: boolean;
  connectedPhone: string | null;
  profileName: string | null;
  qrCodeBase64: string | null;
  qrCodeText: string | null;
  lastError: string | null;
  lastConnectedAt: Date | null;
  updatedAt: Date;
};

function getZApiBaseUrl(apiBaseUrl?: string | null) {
  const raw = (apiBaseUrl ?? process.env.Z_API_BASE_URL ?? "https://api.z-api.io").trim();
  const withoutTrailingSlash = raw.replace(/\/$/, "");
  const instanceMarker = withoutTrailingSlash.indexOf("/instances/");

  if (instanceMarker >= 0) {
    return withoutTrailingSlash.slice(0, instanceMarker);
  }

  return withoutTrailingSlash;
}

function getWebhookBaseUrl() {
  return (process.env.Z_API_WEBHOOK_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

function getTenantWebhookUrl(tenantId: string) {
  const baseUrl = getWebhookBaseUrl();
  return baseUrl ? `${baseUrl}/api/integrations/zapi/webhook/${tenantId}` : "";
}

function normalizePhone(value?: string | null) {
  return value ? value.replace(/\D/g, "") : "";
}

function buildZApiHeaders(instance: { clientToken: string }) {
  return {
    "Content-Type": "application/json",
    "Client-Token": instance.clientToken
  };
}

async function requestZApi(
  instance: Pick<ZApiStoredInstance, "apiBaseUrl" | "instanceId" | "instanceToken" | "clientToken">,
  path: string,
  init?: RequestInit
) {
  const response = await fetch(`${getZApiBaseUrl(instance.apiBaseUrl)}/instances/${instance.instanceId}/token/${instance.instanceToken}${path}`, {
    ...init,
    headers: {
      ...buildZApiHeaders(instance),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || "Falha ao comunicar com a Z-API.");
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as Record<string, unknown>;
  }

  return { raw: await response.text() };
}

async function getStoredInstance(tenantId: string) {
  return prisma.zApiInstance.findUnique({
    where: { tenantId }
  });
}

function toZApiView(tenantId: string, record: ZApiStoredInstance | null): ZApiInstanceView {
  return {
    tenantId,
    configured: Boolean(record),
    apiBaseUrl: record?.apiBaseUrl ?? "",
    instanceId: record?.instanceId ?? "",
    whatsappNumber: record?.whatsappNumber ?? "",
    status: record?.status ?? "not_configured",
    connected: record?.connected ?? false,
    smartphoneConnected: record?.smartphoneConnected ?? false,
    connectedPhone: record?.connectedPhone ?? "",
    profileName: record?.profileName ?? "",
    qrCodeBase64: record?.qrCodeBase64 ?? "",
    qrCodeText: record?.qrCodeText ?? "",
    lastError: record?.lastError ?? "",
    webhookUrl: getTenantWebhookUrl(tenantId),
    updatedAt: record?.updatedAt?.toISOString() ?? null
  };
}

async function updateStoredInstance(tenantId: string, data: Record<string, unknown>) {
  return prisma.zApiInstance.update({
    where: { tenantId },
    data
  });
}

export async function saveZApiCredentials(tenantId: string, values: UpdateZApiSettingsFormValues) {
  const instance = await prisma.zApiInstance.upsert({
    where: { tenantId },
    update: {
      apiBaseUrl: values.apiBaseUrl.trim() || null,
      instanceId: values.instanceId.trim(),
      instanceToken: values.instanceToken.trim(),
      clientToken: values.clientToken.trim(),
      whatsappNumber: normalizePhone(values.whatsappNumber) || null,
      lastError: null
    },
    create: {
      tenantId,
      apiBaseUrl: values.apiBaseUrl.trim() || null,
      instanceId: values.instanceId.trim(),
      instanceToken: values.instanceToken.trim(),
      clientToken: values.clientToken.trim(),
      whatsappNumber: normalizePhone(values.whatsappNumber) || null
    }
  });

  return toZApiView(tenantId, instance);
}

export async function getZApiInstanceStatus(tenantId: string) {
  const instance = await getStoredInstance(tenantId);

  if (!instance) {
    return toZApiView(tenantId, null);
  }

  try {
    const response = await requestZApi(instance, "/status", { method: "GET" });
    const connected = Boolean(response.connected);
    const smartphoneConnected = Boolean(response.smartphoneConnected);
    const error = typeof response.error === "string" ? response.error : "";

    const updated = await updateStoredInstance(tenantId, {
      connected,
      smartphoneConnected,
      status: connected ? "connected" : "disconnected",
      lastError: error || null,
      lastConnectedAt: connected ? new Date() : instance.lastConnectedAt
    });

    return toZApiView(tenantId, updated);
  } catch (error) {
    const updated = await updateStoredInstance(tenantId, {
      status: "error",
      lastError: error instanceof Error ? error.message : "Falha ao consultar a Z-API."
    });

    return toZApiView(tenantId, updated);
  }
}

export async function refreshZApiQrCode(tenantId: string) {
  const instance = await getStoredInstance(tenantId);

  if (!instance) {
    throw new Error("Credenciais da Z-API ainda nao foram configuradas.");
  }

  const response = await requestZApi(instance, "/qr-code/image", { method: "GET" });
  const qrCodeBase64 =
    (typeof response.value === "string" ? response.value : null) ||
    (typeof response.base64 === "string" ? response.base64 : null) ||
    (typeof response.qrCode === "string" ? response.qrCode : null) ||
    "";
  const qrCodeText =
    (typeof response.code === "string" ? response.code : null) ||
    (typeof response.message === "string" ? response.message : null) ||
    "";

  const updated = await updateStoredInstance(tenantId, {
    qrCodeBase64: qrCodeBase64 || null,
    qrCodeText: qrCodeText || null,
    status: qrCodeBase64 ? "awaiting_scan" : instance.status,
    lastError:
      !qrCodeBase64 && "challenge" in response
        ? "Este dispositivo exige validacao adicional por Passkey na Z-API."
        : null
  });

  return toZApiView(tenantId, updated);
}

export async function syncZApiWebhooks(tenantId: string) {
  const instance = await getStoredInstance(tenantId);

  if (!instance) {
    throw new Error("Credenciais da Z-API ainda nao foram configuradas.");
  }

  const webhookUrl = getTenantWebhookUrl(tenantId);

  if (!webhookUrl) {
    throw new Error("Configure NEXT_PUBLIC_APP_URL ou Z_API_WEBHOOK_BASE_URL para registrar o webhook.");
  }

  await requestZApi(instance, "/update-every-webhooks", {
    method: "PUT",
    body: JSON.stringify({
      value: webhookUrl,
      notifySentByMe: true
    })
  });

  const updated = await updateStoredInstance(tenantId, {
    lastError: null
  });

  return toZApiView(tenantId, updated);
}

export async function disconnectZApiInstance(tenantId: string) {
  const instance = await getStoredInstance(tenantId);

  if (!instance) {
    return toZApiView(tenantId, null);
  }

  await requestZApi(instance, "/disconnect", { method: "GET" });

  const updated = await updateStoredInstance(tenantId, {
    connected: false,
    smartphoneConnected: false,
    status: "disconnected",
    connectedPhone: null,
    profileName: null,
    qrCodeBase64: null,
    qrCodeText: null,
    lastError: null
  });

  return toZApiView(tenantId, updated);
}

export async function sendZApiTextMessage({ tenantId, number, text }: SendZApiMessageInput) {
  const instance = await getStoredInstance(tenantId);

  if (!instance) {
    return { delivered: false, mode: "disabled" as const };
  }

  const response = await requestZApi(instance, "/send-text", {
    method: "POST",
    body: JSON.stringify({
      phone: normalizePhone(number),
      message: text
    })
  });

  return {
    delivered: true,
    mode: "z-api" as const,
    data: response
  };
}

export async function syncZApiInstanceFromWebhook(tenantId: string, payload: Record<string, unknown>) {
  const instance = await getStoredInstance(tenantId);

  if (!instance) {
    return null;
  }

  const type = typeof payload.type === "string" ? payload.type : "";

  if (type === "ConnectedCallback") {
    return updateStoredInstance(tenantId, {
      connected: Boolean(payload.connected),
      smartphoneConnected: true,
      status: Boolean(payload.connected) ? "connected" : "disconnected",
      connectedPhone: normalizePhone(typeof payload.phone === "string" ? payload.phone : null),
      qrCodeBase64: null,
      qrCodeText: null,
      lastConnectedAt: payload.connected ? new Date() : instance.lastConnectedAt,
      lastError: null
    });
  }

  return instance;
}

export async function findTenantIdByZApiInstance(instanceId: string) {
  const instance = await prisma.zApiInstance.findFirst({
    where: { instanceId },
    select: { tenantId: true }
  });

  return instance?.tenantId ?? null;
}
