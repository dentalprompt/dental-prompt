import { NextResponse } from "next/server";

import { generateAiReplyForConversation, ingestInboundConversationMessage } from "@/modules/conversations/services/conversation-service";
import { prisma } from "@/lib/db/prisma";

function normalizePhone(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function extractText(payload: Record<string, unknown>) {
  const directText = typeof payload.text === "string" ? payload.text : null;
  const message = payload.message && typeof payload.message === "object" ? (payload.message as Record<string, unknown>) : null;
  const data = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : null;

  return (
    directText ||
    (typeof payload.body === "string" ? payload.body : null) ||
    (message && typeof message.conversation === "string" ? message.conversation : null) ||
    (data && typeof data.body === "string" ? data.body : null) ||
    (data && typeof data.text === "string" ? data.text : null) ||
    null
  );
}

function extractMediaUrl(payload: Record<string, unknown>) {
  const data = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : null;
  const message = payload.message && typeof payload.message === "object" ? (payload.message as Record<string, unknown>) : null;

  return (
    (typeof payload.mediaUrl === "string" ? payload.mediaUrl : null) ||
    (data && typeof data.mediaUrl === "string" ? data.mediaUrl : null) ||
    (message && typeof message.mediaUrl === "string" ? message.mediaUrl : null) ||
    null
  );
}

function extractRemoteJid(payload: Record<string, unknown>) {
  const key = payload.key && typeof payload.key === "object" ? (payload.key as Record<string, unknown>) : null;
  const data = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : null;

  return (
    (typeof payload.remoteJid === "string" ? payload.remoteJid : null) ||
    (key && typeof key.remoteJid === "string" ? key.remoteJid : null) ||
    (data && typeof data.remoteJid === "string" ? data.remoteJid : null) ||
    null
  );
}

function extractExternalId(payload: Record<string, unknown>) {
  const key = payload.key && typeof payload.key === "object" ? (payload.key as Record<string, unknown>) : null;

  return (
    (typeof payload.id === "string" ? payload.id : null) ||
    (typeof payload.messageId === "string" ? payload.messageId : null) ||
    (key && typeof key.id === "string" ? key.id : null) ||
    null
  );
}

function extractPushName(payload: Record<string, unknown>) {
  const data = payload.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : null;

  return (
    (typeof payload.pushName === "string" ? payload.pushName : null) ||
    (typeof payload.senderName === "string" ? payload.senderName : null) ||
    (data && typeof data.pushName === "string" ? data.pushName : null) ||
    null
  );
}

function extractTimestamp(payload: Record<string, unknown>) {
  const raw =
    (typeof payload.messageTimestamp === "number" ? payload.messageTimestamp : null) ||
    (typeof payload.timestamp === "number" ? payload.timestamp : null);

  if (!raw) {
    return null;
  }

  return new Date(raw > 9999999999 ? raw : raw * 1000);
}

function isIncomingPayload(payload: Record<string, unknown>) {
  const event = typeof payload.event === "string" ? payload.event.toLowerCase() : "";
  const fromMe =
    typeof payload.fromMe === "boolean"
      ? payload.fromMe
      : payload.key && typeof payload.key === "object" && "fromMe" in payload.key
        ? Boolean((payload.key as Record<string, unknown>).fromMe)
        : false;

  if (fromMe) {
    return false;
  }

  if (!event) {
    return true;
  }

  return event.includes("message") || event.includes("upsert");
}

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.EVOLUTION_WEBHOOK_SECRET;
    const receivedSecret =
      request.headers.get("x-webhook-secret") ||
      request.headers.get("x-evolution-secret") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (expectedSecret && receivedSecret !== expectedSecret) {
      return NextResponse.json({ message: "Webhook nao autorizado." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ received: true, mode: "mock" });
    }

    const payload = (await request.json()) as Record<string, unknown>;

    if (!isIncomingPayload(payload)) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const remoteJid = extractRemoteJid(payload);
    const contactPhone = normalizePhone(remoteJid || payload.number || payload.sender || payload.from);
    const content = extractText(payload);
    const mediaUrl = extractMediaUrl(payload);
    const externalId = extractExternalId(payload);
    const contactName = extractPushName(payload);
    const sentAt = extractTimestamp(payload);

    if (!contactPhone || (!content && !mediaUrl)) {
      return NextResponse.json({ received: true, ignored: true, reason: "payload-incompleto" });
    }

    const tenant = await prisma.tenant.findFirst({
      orderBy: {
        createdAt: "asc"
      },
      select: {
        id: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ received: true, ignored: true, reason: "tenant-ausente" });
    }

    const message = await ingestInboundConversationMessage({
      tenantId: tenant.id,
      externalId,
      contactName,
      contactPhone,
      content,
      mediaUrl,
      sentAt
    });

    if (!message) {
      return NextResponse.json({ received: true, ignored: true, reason: "mensagem-invalida" });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        tenantId: tenant.id,
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

    return NextResponse.json({
      received: true,
      data: {
        messageId: message.id,
        conversationId: conversation?.id ?? null
      }
    });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel processar o webhook." }, { status: 400 });
  }
}
