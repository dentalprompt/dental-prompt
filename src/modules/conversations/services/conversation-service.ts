import { prisma } from "@/lib/db/prisma";
import { mockConversationDetails, mockConversations } from "@/modules/conversations/data/mock-conversations";
import type {
  ConversationDetail,
  ConversationListItem,
  ConversationMessage,
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

  const conversations = await prisma.conversation.findMany({
    where: search
      ? {
          OR: [
            { contactName: { contains: search, mode: "insensitive" } },
            { contactPhone: { contains: search, mode: "insensitive" } }
          ]
        }
      : undefined,
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

  if (!conversation) {
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

  const message = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      direction: "OUTBOUND",
      status: "SENT",
      content: input.content,
      sentAt: new Date()
    }
  });

  await prisma.conversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: message.createdAt
    }
  });

  return {
    id: message.id,
    direction: message.direction,
    status: message.status,
    content: message.content,
    mediaUrl: message.mediaUrl,
    createdAt: message.createdAt.toISOString()
  };
}
