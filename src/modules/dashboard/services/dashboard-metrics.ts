import { AppointmentStatus, FinancialEntryStatus, FinancialEntryType, PatientStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

type TrendPoint = {
  label: string;
  value: number;
};

type DashboardAppointmentItem = {
  id: string;
  time: string;
  patientName: string;
  professionalName: string;
  title: string;
  status: AppointmentStatus;
};

type DashboardConversationItem = {
  id: string;
  contactName: string;
  channelLabel: string;
  lastMessagePreview: string;
  unreadCount: number;
  aiEnabled: boolean;
  lastInteractionLabel: string;
};

type DashboardAttentionItem = {
  id: string;
  title: string;
  description: string;
  tone: "warning" | "info";
  actionLabel: string;
};

type DashboardProfessionalPerformanceItem = {
  id: string;
  professionalName: string;
  specialty: string;
  revenue: number;
  appointments: number;
};

export type DashboardMetrics = {
  patients: number;
  birthdaysThisMonth: number;
  appointmentsToday: number;
  activeAgents: number;
  plans: number;
  conversations: number;
  unreadConversations: number;
  confirmedToday: number;
  returnsToday: number;
  walkInToday: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  balance: number;
  pendingRevenue: number;
  overdueAmount: number;
  newPatientsThisMonth: number;
  patientsSeenLastSixMonths: number;
  inTreatmentPatients: number;
  inactivePatients: number;
  monthlyGoal: number;
  monthlyGoalProgress: number;
  monthlyRemainingGoal: number;
  daysRemainingInMonth: number;
  dailyGoalRequired: number;
  salesToday: number;
  dailyGoalProgress: number;
  revenueTrend: TrendPoint[];
  appointments: DashboardAppointmentItem[];
  conversationsQueue: DashboardConversationItem[];
  attentionItems: DashboardAttentionItem[];
  professionalPerformance: DashboardProfessionalPerformanceItem[];
};

const DEFAULT_MONTHLY_GOAL = 50000;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatRelativeDay(date: Date, now: Date) {
  const diff = startOfDay(date).getTime() - startOfDay(now).getTime();
  const days = Math.round(diff / 86_400_000);

  if (days === 0) {
    return "Hoje";
  }

  if (days === -1) {
    return "Ontem";
  }

  if (days === 1) {
    return "Amanha";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

function buildMockMetrics(): DashboardMetrics {
  return {
    patients: 2847,
    birthdaysThisMonth: 26,
    appointmentsToday: 18,
    activeAgents: 8,
    plans: 14,
    conversations: 1284,
    unreadConversations: 19,
    confirmedToday: 12,
    returnsToday: 3,
    walkInToday: 1,
    monthlyRevenue: 32400,
    monthlyExpenses: 8640,
    balance: 23760,
    pendingRevenue: 17600,
    overdueAmount: 4920,
    newPatientsThisMonth: 37,
    patientsSeenLastSixMonths: 420,
    inTreatmentPatients: 168,
    inactivePatients: 12,
    monthlyGoal: DEFAULT_MONTHLY_GOAL,
    monthlyGoalProgress: 64.8,
    monthlyRemainingGoal: 17600,
    daysRemainingInMonth: 12,
    dailyGoalRequired: 1466.66,
    salesToday: 2300,
    dailyGoalProgress: 156.82,
    revenueTrend: [
      { label: "Fev", value: 19400 },
      { label: "Mar", value: 22100 },
      { label: "Abr", value: 24900 },
      { label: "Mai", value: 28300 },
      { label: "Jun", value: 30120 },
      { label: "Jul", value: 32400 }
    ],
    appointments: [
      {
        id: "mock-appointment-1",
        time: "09:00",
        patientName: "Mariana Carvalho de Lima",
        professionalName: "Dra. Camila Borges",
        title: "Avaliacao inicial",
        status: AppointmentStatus.CONFIRMED
      },
      {
        id: "mock-appointment-2",
        time: "10:20",
        patientName: "Carlos Eduardo Prado",
        professionalName: "Dr. Thiago Salles",
        title: "Manutencao ortodontica",
        status: AppointmentStatus.RETURN
      },
      {
        id: "mock-appointment-3",
        time: "14:10",
        patientName: "Ana Beatriz Nunes",
        professionalName: "Dra. Renata Paiva",
        title: "Planejamento implantodontico",
        status: AppointmentStatus.SCHEDULED
      }
    ],
    conversationsQueue: [
      {
        id: "mock-conversation-1",
        contactName: "Mariana Carvalho de Lima",
        channelLabel: "WhatsApp",
        lastMessagePreview: "Quero confirmar meu retorno de amanha.",
        unreadCount: 3,
        aiEnabled: true,
        lastInteractionLabel: "Hoje"
      },
      {
        id: "mock-conversation-2",
        contactName: "Carlos Eduardo Prado",
        channelLabel: "WhatsApp",
        lastMessagePreview: "Pode me enviar o valor atualizado do plano?",
        unreadCount: 1,
        aiEnabled: false,
        lastInteractionLabel: "Ontem"
      }
    ],
    attentionItems: [
      {
        id: "mock-attention-1",
        title: "2 recebimentos em atraso",
        description: "Existem parcelas vencidas que precisam de contato da recepcao.",
        tone: "warning",
        actionLabel: "Abrir financeiro"
      },
      {
        id: "mock-attention-2",
        title: "19 mensagens aguardando resposta",
        description: "A fila de conversas possui contatos sem retorno recente.",
        tone: "info",
        actionLabel: "Abrir conversas"
      }
    ],
    professionalPerformance: [
      {
        id: "mock-professional-1",
        professionalName: "Dra. Camila Borges",
        specialty: "Dentistica",
        revenue: 13200,
        appointments: 18
      },
      {
        id: "mock-professional-2",
        professionalName: "Dr. Thiago Salles",
        specialty: "Ortodontia",
        revenue: 9600,
        appointments: 12
      },
      {
        id: "mock-professional-3",
        professionalName: "Dra. Renata Paiva",
        specialty: "Implantodontia",
        revenue: 8600,
        appointments: 9
      }
    ]
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!process.env.DATABASE_URL) {
    return buildMockMetrics();
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lastSixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    patients,
    patientBirthdays,
    newPatientsThisMonth,
    inTreatmentPatients,
    inactivePatients,
    plans,
    activeAgents,
    conversations,
    unreadConversationsAggregate,
    recentConversations,
    appointmentsTodayList,
    recentAppointmentsSixMonths,
    monthlyFinancialEntries,
    allFinancialEntries,
    activeProfessionals,
    recentMessages
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.patient.findMany({
      select: {
        id: true,
        birthDate: true
      }
    }),
    prisma.patient.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    }),
    prisma.patient.count({
      where: {
        status: PatientStatus.IN_TREATMENT
      }
    }),
    prisma.patient.count({
      where: {
        status: PatientStatus.INACTIVE
      }
    }),
    prisma.plan.count({
      where: {
        isActive: true
      }
    }),
    prisma.agent.count({
      where: {
        status: "ACTIVE"
      }
    }),
    prisma.conversation.count(),
    prisma.conversation.aggregate({
      _sum: {
        unreadCount: true
      }
    }),
    prisma.conversation.findMany({
      orderBy: [
        {
          unreadCount: "desc"
        },
        {
          lastMessageAt: "desc"
        }
      ],
      take: 4,
      select: {
        id: true,
        contactName: true,
        unreadCount: true,
        isAiEnabled: true,
        lastMessageAt: true
      }
    }),
    prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      orderBy: {
        startsAt: "asc"
      },
      take: 6,
      select: {
        id: true,
        title: true,
        startsAt: true,
        status: true,
        patient: {
          select: {
            fullName: true
          }
        },
        professional: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: lastSixMonthsStart
        },
        status: {
          notIn: [AppointmentStatus.CANCELED, AppointmentStatus.NO_SHOW]
        }
      },
      select: {
        id: true,
        patientId: true,
        professionalId: true,
        status: true
      }
    }),
    prisma.financialEntry.findMany({
      where: {
        OR: [
          {
            dueDate: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          {
            paidAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        ]
      },
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        dueDate: true,
        paidAt: true,
        patient: {
          select: {
            fullName: true
          }
        }
      }
    }),
    prisma.financialEntry.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        amount: true,
        dueDate: true,
        paidAt: true,
        description: true,
        patient: {
          select: {
            fullName: true
          }
        },
        professional: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    }),
    prisma.professional.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        specialty: true
      }
    }),
    prisma.message.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 20,
      select: {
        conversationId: true,
        content: true,
        createdAt: true
      }
    })
  ]);

  const birthdaysThisMonth = patientBirthdays.filter((patient) => {
    if (!patient.birthDate) {
      return false;
    }

    return patient.birthDate.getMonth() === now.getMonth();
  }).length;

  const appointmentsToday = appointmentsTodayList.length;
  const confirmedToday = appointmentsTodayList.filter((item) => item.status === AppointmentStatus.CONFIRMED).length;
  const returnsToday = appointmentsTodayList.filter((item) => item.status === AppointmentStatus.RETURN).length;
  const walkInToday = appointmentsTodayList.filter((item) => item.status === AppointmentStatus.WALK_IN).length;

  const monthlyRevenue = monthlyFinancialEntries
    .filter((entry) => entry.type === FinancialEntryType.INCOME && entry.status !== FinancialEntryStatus.CANCELED)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const monthlyExpenses = monthlyFinancialEntries
    .filter((entry) => entry.type === FinancialEntryType.EXPENSE && entry.status !== FinancialEntryStatus.CANCELED)
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const pendingRevenue = allFinancialEntries
    .filter(
      (entry) =>
        entry.type === FinancialEntryType.INCOME &&
        (entry.status === FinancialEntryStatus.PENDING || entry.status === FinancialEntryStatus.SCHEDULED)
    )
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const overdueEntries = allFinancialEntries.filter(
    (entry) => entry.type === FinancialEntryType.INCOME && entry.status === FinancialEntryStatus.OVERDUE
  );
  const overdueAmount = overdueEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const balance = monthlyRevenue - monthlyExpenses;

  const monthlyGoal = DEFAULT_MONTHLY_GOAL;
  const monthlyGoalProgress = monthlyGoal > 0 ? (monthlyRevenue / monthlyGoal) * 100 : 0;
  const monthlyRemainingGoal = Math.max(monthlyGoal - monthlyRevenue, 0);
  const daysRemainingInMonth = Math.max(
    Math.ceil((endOfMonth(now).getTime() - endOfDay(now).getTime()) / 86_400_000),
    0
  );
  const dailyGoalRequired = daysRemainingInMonth > 0 ? monthlyRemainingGoal / daysRemainingInMonth : 0;

  const salesToday = allFinancialEntries
    .filter(
      (entry) =>
        entry.type === FinancialEntryType.INCOME &&
        !!entry.paidAt &&
        entry.paidAt >= todayStart &&
        entry.paidAt <= todayEnd &&
        entry.status === FinancialEntryStatus.PAID
    )
    .reduce((sum, entry) => sum + Number(entry.amount), 0);

  const totalDaysInMonth = endOfMonth(now).getDate();
  const averageDailyGoal = monthlyGoal / totalDaysInMonth;
  const dailyGoalProgress = averageDailyGoal > 0 ? (salesToday / averageDailyGoal) * 100 : 0;

  const revenueTrend = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(date)
      .replace(".", "");

    const value = allFinancialEntries
      .filter((entry) => entry.type === FinancialEntryType.INCOME && entry.status !== FinancialEntryStatus.CANCELED)
      .filter((entry) => {
        const referenceDate = entry.paidAt ?? entry.dueDate;

        if (!referenceDate) {
          return false;
        }

        return referenceDate.getMonth() === monthIndex && referenceDate.getFullYear() === year;
      })
      .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return {
      label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      value
    };
  });

  const latestMessageByConversation = new Map<string, { content: string | null; createdAt: Date }>();

  for (const message of recentMessages) {
    if (!latestMessageByConversation.has(message.conversationId)) {
      latestMessageByConversation.set(message.conversationId, {
        content: message.content,
        createdAt: message.createdAt
      });
    }
  }

  const conversationsQueue = recentConversations.map((conversation) => {
    const lastMessage = latestMessageByConversation.get(conversation.id);

    return {
      id: conversation.id,
      contactName: conversation.contactName,
      channelLabel: "WhatsApp",
      lastMessagePreview: lastMessage?.content ?? "Sem mensagens registradas ainda.",
      unreadCount: conversation.unreadCount,
      aiEnabled: conversation.isAiEnabled,
      lastInteractionLabel: formatRelativeDay(conversation.lastMessageAt ?? lastMessage?.createdAt ?? now, now)
    };
  });

  const appointments = appointmentsTodayList.map((appointment) => ({
    id: appointment.id,
    time: formatTime(appointment.startsAt),
    patientName: appointment.patient.fullName,
    professionalName: appointment.professional.name,
    title: appointment.title,
    status: appointment.status
  }));

  const patientsSeenLastSixMonths = new Set(recentAppointmentsSixMonths.map((item) => item.patientId)).size;

  const performanceMap = new Map<
    string,
    {
      id: string;
      professionalName: string;
      specialty: string;
      revenue: number;
      appointments: number;
    }
  >();

  for (const professional of activeProfessionals) {
    performanceMap.set(professional.id, {
      id: professional.id,
      professionalName: professional.name,
      specialty: professional.specialty ?? "Especialidade nao informada",
      revenue: 0,
      appointments: 0
    });
  }

  for (const entry of allFinancialEntries) {
    if (
      entry.professional?.id &&
      entry.type === FinancialEntryType.INCOME &&
      entry.status !== FinancialEntryStatus.CANCELED &&
      performanceMap.has(entry.professional.id)
    ) {
      const performance = performanceMap.get(entry.professional.id);

      if (performance) {
        performance.revenue += Number(entry.amount);
      }
    }
  }

  for (const appointment of recentAppointmentsSixMonths) {
    const performance = performanceMap.get(appointment.professionalId);

    if (performance) {
      performance.appointments += 1;
    }
  }

  const professionalPerformance = [...performanceMap.values()]
    .sort((left, right) => right.revenue - left.revenue)
    .slice(0, 4);

  const attentionItems: DashboardAttentionItem[] = [];

  if (overdueEntries.length > 0) {
    attentionItems.push({
      id: "attention-overdue",
      title: `${overdueEntries.length} recebimento(s) em atraso`,
      description: "A equipe financeira precisa revisar cobrancas vencidas e retomar o contato com os pacientes.",
      tone: "warning",
      actionLabel: "Ir para financeiro"
    });
  }

  const unreadConversations = Number(unreadConversationsAggregate._sum.unreadCount ?? 0);

  if (unreadConversations > 0) {
    attentionItems.push({
      id: "attention-conversations",
      title: `${unreadConversations} mensagem(ns) aguardando resposta`,
      description: "A fila de WhatsApp possui contatos recentes sem resposta finalizada.",
      tone: "info",
      actionLabel: "Abrir conversas"
    });
  }

  const scheduledNoFinancial = appointmentsTodayList.filter(
    (appointment) => appointment.status === AppointmentStatus.SCHEDULED
  ).length;

  if (scheduledNoFinancial > 0) {
    attentionItems.push({
      id: "attention-scheduled",
      title: `${scheduledNoFinancial} consulta(s) pendente(s) de confirmacao`,
      description: "Existem horarios de hoje ainda sem confirmacao definitiva do paciente.",
      tone: "info",
      actionLabel: "Abrir agenda"
    });
  }

  return {
    patients,
    birthdaysThisMonth,
    appointmentsToday,
    activeAgents,
    plans,
    conversations,
    unreadConversations,
    confirmedToday,
    returnsToday,
    walkInToday,
    monthlyRevenue,
    monthlyExpenses,
    balance,
    pendingRevenue,
    overdueAmount,
    newPatientsThisMonth,
    patientsSeenLastSixMonths,
    inTreatmentPatients,
    inactivePatients,
    monthlyGoal,
    monthlyGoalProgress,
    monthlyRemainingGoal,
    daysRemainingInMonth,
    dailyGoalRequired,
    salesToday,
    dailyGoalProgress,
    revenueTrend,
    appointments,
    conversationsQueue,
    attentionItems,
    professionalPerformance
  };
}
