import type { ConversationDetail, ConversationListItem } from "@/modules/conversations/types/conversation";

export const mockConversations: ConversationListItem[] = [
  {
    id: "conv_1",
    contactName: "Mariana Carvalho",
    contactPhone: "5511998764231",
    unreadCount: 2,
    isAiEnabled: true,
    patientId: "pat_1",
    patientName: "Mariana Carvalho de Lima",
    lastMessagePreview: "Pode confirmar meu retorno de sexta?",
    lastMessageAt: "2026-07-12T13:45:00.000Z",
    labels: ["Retorno", "WhatsApp"]
  },
  {
    id: "conv_2",
    contactName: "Carlos Eduardo",
    contactPhone: "5521987655521",
    unreadCount: 0,
    isAiEnabled: false,
    patientId: "pat_2",
    patientName: "Carlos Eduardo Tavares",
    lastMessagePreview: "Recebi o orcamento, obrigado.",
    lastMessageAt: "2026-07-12T11:12:00.000Z",
    labels: ["Orcamento"]
  },
  {
    id: "conv_3",
    contactName: "Aline Moreira",
    contactPhone: "5531991231134",
    unreadCount: 4,
    isAiEnabled: true,
    patientId: "pat_3",
    patientName: "Aline Moreira Santos",
    lastMessagePreview: "Quais horarios tem para avaliacao?",
    lastMessageAt: "2026-07-12T15:02:00.000Z",
    labels: ["Lead", "Novo paciente"]
  }
];

export const mockConversationDetails: Record<string, ConversationDetail> = {
  conv_1: {
    id: "conv_1",
    contactName: "Mariana Carvalho",
    contactPhone: "5511998764231",
    unreadCount: 2,
    isAiEnabled: true,
    patient: {
      id: "pat_1",
      name: "Mariana Carvalho de Lima",
      chartNumber: "PC-00018"
    },
    labels: ["Retorno", "WhatsApp"],
    notes: ["Paciente em acompanhamento estetico.", "Prefere atendimentos no periodo da tarde."],
    messages: [
      {
        id: "msg_1",
        direction: "INBOUND",
        status: "READ",
        content: "Oi, tudo bem? Gostaria de confirmar meu retorno.",
        mediaUrl: null,
        createdAt: "2026-07-12T13:30:00.000Z"
      },
      {
        id: "msg_2",
        direction: "OUTBOUND",
        status: "READ",
        content: "Claro! Seu retorno esta previsto para sexta-feira as 10h30 com a Dra. Camila.",
        mediaUrl: null,
        createdAt: "2026-07-12T13:35:00.000Z"
      },
      {
        id: "msg_3",
        direction: "INBOUND",
        status: "READ",
        content: "Pode confirmar meu retorno de sexta?",
        mediaUrl: null,
        createdAt: "2026-07-12T13:45:00.000Z"
      }
    ],
    sharedFiles: [
      {
        id: "file_1",
        name: "Contrato de tratamento.pdf",
        type: "PDF",
        createdAt: "2026-07-01T14:00:00.000Z"
      }
    ]
  },
  conv_2: {
    id: "conv_2",
    contactName: "Carlos Eduardo",
    contactPhone: "5521987655521",
    unreadCount: 0,
    isAiEnabled: false,
    patient: {
      id: "pat_2",
      name: "Carlos Eduardo Tavares",
      chartNumber: "PC-00019"
    },
    labels: ["Orcamento"],
    notes: ["Paciente deseja parcelamento em 4x."],
    messages: [
      {
        id: "msg_4",
        direction: "OUTBOUND",
        status: "DELIVERED",
        content: "Ola, Carlos! Seu orcamento foi enviado por aqui para revisao.",
        mediaUrl: null,
        createdAt: "2026-07-12T10:55:00.000Z"
      },
      {
        id: "msg_5",
        direction: "INBOUND",
        status: "READ",
        content: "Recebi o orcamento, obrigado.",
        mediaUrl: null,
        createdAt: "2026-07-12T11:12:00.000Z"
      }
    ],
    sharedFiles: []
  },
  conv_3: {
    id: "conv_3",
    contactName: "Aline Moreira",
    contactPhone: "5531991231134",
    unreadCount: 4,
    isAiEnabled: true,
    patient: {
      id: "pat_3",
      name: "Aline Moreira Santos",
      chartNumber: "PC-00020"
    },
    labels: ["Lead", "Novo paciente"],
    notes: ["Lead vindo do Instagram."],
    messages: [
      {
        id: "msg_6",
        direction: "INBOUND",
        status: "READ",
        content: "Quais horarios tem para avaliacao?",
        mediaUrl: null,
        createdAt: "2026-07-12T15:02:00.000Z"
      }
    ],
    sharedFiles: []
  }
};
