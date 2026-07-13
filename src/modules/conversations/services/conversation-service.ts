import { getOpenAIClient, getOpenAIModel } from "@/lib/integrations/openai";
import { sendEvolutionTextMessage } from "@/lib/integrations/evolution";
import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { mockConversationDetails, mockConversations } from "@/modules/conversations/data/mock-conversations";
import type {
  ConversationDetail,
  ConversationListItem,
  ConversationMessage,
  ConversationUpsertInput,
  SendMessageInput
} from "@/modules/conversations/types/conversation";

function matchesSearch(conversation: ConversationListItem, search?: string) {
  if (!search) {
    return true;
  }

  const term = search.toLowerCase();
  return [
    conversation.contactName,
    conversation.contactPhone,
    conversation.lastMessagePreview,
    conversation.patientName,
    ...conversation.labels
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(term));
}

export async function listConversations(search?: string): Promise<ConversationListItem[]> {
  if (!process.env.DATABASE_URL) {
    return mockConversations
      .filter((conversation) => matchesSearch(conversation, search))
      .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return [];
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      tenantId,
      ...(search
        ? {
            OR: [
              { contactName: { contains: search, mode: "insensitive" } },
              { contactPhone: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: {
      patient: true,
      messages: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    orderBy: {
      lastMessageAt: "desc"
    }
  });

  return conversations.map((conversation) => ({
    id: conversation.id,
    contactName: conversation.contactName,
    contactPhone: conversation.contactPhone,
    unreadCount: conversation.unreadCount,
    isAiEnabled: conversation.isAiEnabled,
    patientId: conversation.patientId,
    patientName: conversation.patient?.fullName ?? null,
    lastMessagePreview: conversation.messages[0]?.content ?? null,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    labels: []
  }));
}

export async function getConversationDetail(id: string): Promise<ConversationDetail | null> {
  if (!process.env.DATABASE_URL) {
    return mockConversationDetails[id] ?? null;
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      patient: true,
      messages: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!conversation || conversation.tenantId !== tenantId) {
    return null;
  }

  return {
    id: conversation.id,
    contactName: conversation.contactName,
    contactPhone: conversation.contactPhone,
    unreadCount: conversation.unreadCount,
    isAiEnabled: conversation.isAiEnabled,
    patient: conversation.patient
      ? {
          id: conversation.patient.id,
          name: conversation.patient.fullName,
          chartNumber: conversation.patient.chartNumber
        }
      : null,
    labels: [],
    notes: [],
    messages: conversation.messages.map((message) => ({
      id: message.id,
      direction: message.direction,
      status: message.status,
      content: message.content,
      mediaUrl: message.mediaUrl,
      createdAt: message.createdAt.toISOString()
    })),
    sharedFiles: []
  };
}

export async function sendMessage(input: SendMessageInput): Promise<ConversationMessage | null> {
  if (!process.env.DATABASE_URL) {
    const detail = mockConversationDetails[input.conversationId];

    if (!detail) {
      return null;
    }

    return {
      id: `mock_msg_${Date.now()}`,
      direction: "OUTBOUND",
      status: "SENT",
      content: input.content,
      mediaUrl: null,
      createdAt: new Date().toISOString()
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: input.conversationId },
    select: {
      id: true,
      tenantId: true,
      contactPhone: true
    }
  });

  if (!conversation || conversation.tenantId !== tenantId) {
    return null;
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      status: "PENDING",
      content: input.content,
      sentAt: new Date()
    }
  });

  let nextStatus: "SENT" | "FAILED" = "SENT";

  try {
    const phone = scopedPhoneNumber(input.phoneOverride ?? conversation.contactPhone);

    if (phone) {
      await sendEvolutionTextMessage({
        number: phone,
        text: input.content
      });
    }
  } catch {
    nextStatus = "FAILED";
  }

  const updatedMessage = await prisma.message.update({
    where: { id: message.id },
    data: {
      status: nextStatus
    }
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: message.createdAt
    }
  });

  return {
    id: updatedMessage.id,
    direction: updatedMessage.direction,
    status: updatedMessage.status,
    content: updatedMessage.content,
    mediaUrl: updatedMessage.mediaUrl,
    createdAt: updatedMessage.createdAt.toISOString()
  };
}

function scopedPhoneNumber(phone?: string | null) {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

export async function generateAiReplyForConversation(conversationId: string): Promise<ConversationMessage | null> {
  if (!process.env.DATABASE_URL) {
    return {
      id: `mock_ai_${Date.now()}`,
      direction: "OUTBOUND",
      status: "SENT",
      content: "Oi! Posso te ajudar com seu agendamento, valores ou retorno de tratamento.",
      mediaUrl: null,
      createdAt: new Date().toISOString()
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const [conversation, activeAgent] = await Promise.all([
    prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc"
          },
          take: 20
        },
        patient: true
      }
    }),
    prisma.agent.findFirst({
      where: {
        tenantId,
        status: "ACTIVE"
      },
      orderBy: {
        updatedAt: "desc"
      }
    })
  ]);

  if (!conversation || conversation.tenantId !== tenantId) {
    return null;
  }

  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  const systemPrompt = activeAgent?.promptBase?.trim()
    ? activeAgent.promptBase
    : "Voce e um assistente cordial de uma clinica odontologica. Responda em portugues do Brasil, com objetividade, tom humano e foco em atendimento.";

  const patientContext = conversation.patient
    ? `Paciente vinculado: ${conversation.patient.fullName}. Prontuario: ${conversation.patient.chartNumber ?? "nao informado"}.`
    : "Nao existe paciente vinculado a esta conversa.";

  const response = await client.responses.create({
    model: activeAgent?.model || getOpenAIModel(),
    temperature: activeAgent?.temperature ?? 0.2,
    input: [
      {
        role: "system",
        content: `${systemPrompt}\n${patientContext}`
      },
      ...conversation.messages.map((message) => ({
        role: message.direction === "INBOUND" ? ("user" as const) : ("assistant" as const),
        content: message.content || ""
      }))
    ]
  });

  const aiText =
    response.output_text?.trim() ||
    activeAgent?.initialMessage?.trim() ||
    "Oi! Estou aqui para te ajudar com seu atendimento.";

  return sendMessage({
    conversationId,
    content: aiText,
    phoneOverride: conversation.contactPhone
  });
}

export async function createConversation(input: ConversationUpsertInput) {
  if (!process.env.DATABASE_URL) {
    return {
      id: `mock_conv_${Date.now()}`,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      unreadCount: 0,
      isAiEnabled: input.isAiEnabled ?? false,
      patientId: input.patientId ?? null,
      patientName: null,
      lastMessagePreview: null,
      lastMessageAt: null,
      labels: []
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const conversation = await prisma.conversation.create({
    data: {
      tenantId,
      patientId: input.patientId || null,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      isAiEnabled: input.isAiEnabled ?? false
    },
    include: {
      patient: true
    }
  });

  return {
    id: conversation.id,
    contactName: conversation.contactName,
    contactPhone: conversation.contactPhone,
    unreadCount: conversation.unreadCount,
    isAiEnabled: conversation.isAiEnabled,
    patientId: conversation.patientId,
    patientName: conversation.patient?.fullName ?? null,
    lastMessagePreview: null,
    lastMessageAt: null,
    labels: []
  };
}

export async function updateConversation(id: string, input: ConversationUpsertInput) {
  if (!process.env.DATABASE_URL) {
    return { id };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const scoped = await prisma.conversation.findUnique({
    where: { id },
    select: { tenantId: true }
  });

  if (!scoped || scoped.tenantId !== tenantId) {
    return null;
  }

  const conversation = await prisma.conversation.update({
    where: { id },
    data: {
      patientId: input.patientId || null,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      isAiEnabled: input.isAiEnabled ?? false
    },
    include: {
      patient: true
    }
  });

  return {
    id: conversation.id,
    contactName: conversation.contactName,
    contactPhone: conversation.contactPhone,
    unreadCount: conversation.unreadCount,
    isAiEnabled: conversation.isAiEnabled,
    patientId: conversation.patientId,
    patientName: conversation.patient?.fullName ?? null,
    lastMessagePreview: null,
    lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
    labels: []
  };
}

export async function toggleConversationAi(id: string) {
  if (!process.env.DATABASE_URL) {
    return { id };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const scoped = await prisma.conversation.findUnique({
    where: { id },
    select: { tenantId: true, isAiEnabled: true }
  });

  if (!scoped || scoped.tenantId !== tenantId) {
    return null;
  }

  return prisma.conversation.update({
    where: { id },
    data: {
      isAiEnabled: !scoped.isAiEnabled
    }
  });
}
