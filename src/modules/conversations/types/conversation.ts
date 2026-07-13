export type ConversationListItem = {
  id: string;
  contactName: string;
  contactPhone: string;
  unreadCount: number;
  isAiEnabled: boolean;
  patientId: string | null;
  patientName: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  labels: string[];
};

export type ConversationMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  content: string | null;
  mediaUrl: string | null;
  createdAt: string;
};

export type ConversationDetail = {
  id: string;
  contactName: string;
  contactPhone: string;
  unreadCount: number;
  isAiEnabled: boolean;
  patient: {
    id: string;
    name: string;
    chartNumber: string | null;
  } | null;
  labels: string[];
  notes: string[];
  messages: ConversationMessage[];
  sharedFiles: {
    id: string;
    name: string;
    type: string;
    createdAt: string;
  }[];
};

export type SendMessageInput = {
  conversationId: string;
  content: string;
  phoneOverride?: string;
};

export type ConversationUpsertInput = {
  contactName: string;
  contactPhone: string;
  patientId?: string;
  isAiEnabled?: boolean;
};
