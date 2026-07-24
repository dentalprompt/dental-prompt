import { prisma } from "@/lib/db/prisma";
import { findTenantIdByZApiInstance, syncZApiInstanceFromWebhook } from "@/lib/integrations/zapi";
import { generateAiReplyForConversation, ingestInboundConversationMessage } from "@/modules/conversations/services/conversation-service";

type WebhookPayload = Record<string, unknown>;

function normalizePhone(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function extractText(payload: WebhookPayload) {
  const text = payload.text && typeof payload.text === "object" ? (payload.text as WebhookPayload) : null;

  return (
    (text && typeof text.message === "string" ? text.message : null) ||
    (typeof payload.text === "string" ? payload.text : null) ||
    (typeof payload.message === "string" ? payload.message : null) ||
    (typeof payload.body === "string" ? payload.body : null) ||
    null
  );
}

function extractMediaUrl(payload: WebhookPayload) {
  const image = payload.image && typeof payload.image === "object" ? (payload.image as WebhookPayload) : null;
  const video = payload.video && typeof payload.video === "object" ? (payload.video as WebhookPayload) : null;
  const document = payload.document && typeof payload.document === "object" ? (payload.document as WebhookPayload) : null;
  const audio = payload.audio && typeof payload.audio === "object" ? (payload.audio as WebhookPayload) : null;

  return (
    (image && typeof image.imageUrl === "string" ? image.imageUrl : null) ||
    (video && typeof video.videoUrl === "string" ? video.videoUrl : null) ||
    (document && typeof document.documentUrl === "string" ? document.documentUrl : null) ||
    (audio && typeof audio.audioUrl === "string" ? audio.audioUrl : null) ||
    null
  );
}

function extractExternalId(payload: WebhookPayload) {
  return (
    (typeof payload.messageId === "string" ? payload.messageId : null) ||
    (typeof payload.id === "string" ? payload.id : null) ||
    null
  );
}

function extractTimestamp(payload: WebhookPayload) {
  const raw =
    (typeof payload.momment === "number" ? payload.momment : null) ||
    (typeof payload.moment === "number" ? payload.moment : null) ||
    (typeof payload.timestamp === "number" ? payload.timestamp : null);

  if (!raw) {
    return null;
  }

  return new Date(raw > 9999999999 ? raw : raw * 1000);
}

function isIncomingPayload(payload: WebhookPayload) {
  const type = typeof payload.type === "string" ? payload.type : "";
  const fromMe = typeof payload.fromMe === "boolean" ? payload.fromMe : false;
  const isGroup = typeof payload.isGroup === "boolean" ? payload.isGroup : false;

  if (fromMe || isGroup) {
    return false;
  }

  if (type === "ConnectedCallback") {
    return false;
  }

  return true;
}

async function resolveTenantId(explicitTenantId: string | null, payload: WebhookPayload) {
  if (explicitTenantId) {
    return explicitTenantId;
  }

  const instanceId = typeof payload.instanceId === "string" ? payload.instanceId : null;

  if (!instanceId) {
    return null;
  }

  return findTenantIdByZApiInstance(instanceId);
}

export async function processZApiWebhook(payload: WebhookPayload, explicitTenantId?: string | null) {
  if (!process.env.DATABASE_URL) {
    return { received: true, mode: "mock" as const };
  }

  const tenantId = await resolveTenantId(explicitTenantId ?? null, payload);

  if (!tenantId) {
    return { received: true, ignored: true, reason: "tenant-ausente" as const };
  }

  await syncZApiInstanceFromWebhook(tenantId, payload);

  if (!isIncomingPayload(payload)) {
    return { received: true, ignored: true };
  }

  const contactPhone = normalizePhone(payload.phone);
  const content = extractText(payload);
  const mediaUrl = extractMediaUrl(payload);
  const externalId = extractExternalId(payload);
  const contactName = typeof payload.senderName === "string" ? payload.senderName : null;
  const sentAt = extractTimestamp(payload);

  if (!contactPhone || (!content && !mediaUrl)) {
    return { received: true, ignored: true, reason: "payload-incompleto" as const };
  }

  const message = await ingestInboundConversationMessage({
    tenantId,
    externalId,
    contactName,
    contactPhone,
    content,
    mediaUrl,
    sentAt
  });

  if (!message) {
    return { received: true, ignored: true, reason: "mensagem-invalida" as const };
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      tenantId,
      contactPhone
    },
    select: {
      id: true,
      isAiEnabled: true
    }
  });

  if (conversation?.isAiEnabled) {
    await generateAiReplyForConversation(conversation.id);
  }

  return {
    received: true,
    data: {
      messageId: message.id,
      conversationId: conversation?.id ?? null
    }
  };
}
