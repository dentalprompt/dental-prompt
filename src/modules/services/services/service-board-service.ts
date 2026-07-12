import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import type { CreateServiceCardInput, ServiceBoardView, ServiceCardView } from "@/modules/services/types/service";

function formatDate(date: Date | null) {
  if (!date) {
    return null;
  }

  return date.toISOString();
}

function buildMockBoard(): ServiceBoardView {
  return {
    id: "mock-service-board",
    name: "Fluxo principal",
    description: "Kanban operacional da clinica.",
    columns: [
      {
        id: "mock-column-1",
        name: "Novo servico",
        color: "#0A3F9A",
        position: 1,
        cards: [
          {
            id: "mock-card-1",
            title: "Clareamento supervisionado",
            description: "Paciente aguardando inicio da sequencia clinica.",
            patientId: "patient_demo_1",
            patientName: "Mariana Carvalho de Lima",
            professionalId: "pro_demo_1",
            professionalName: "Dra. Camila Borges",
            priority: "NORMAL",
            dueDate: new Date().toISOString()
          }
        ]
      },
      {
        id: "mock-column-2",
        name: "Em producao",
        color: "#22C7C7",
        position: 2,
        cards: []
      },
      {
        id: "mock-column-3",
        name: "Concluido",
        color: "#16A34A",
        position: 3,
        cards: []
      }
    ]
  };
}

export async function getPrimaryServiceBoard(): Promise<ServiceBoardView> {
  if (!process.env.DATABASE_URL) {
    return buildMockBoard();
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return buildMockBoard();
  }

  const board = await prisma.serviceBoard.findFirst({
    where: {
      tenantId
    },
    include: {
      columns: {
        include: {
          cards: {
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        orderBy: {
          position: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!board) {
    return buildMockBoard();
  }

  const patientIds = board.columns.flatMap((column) => column.cards.map((card) => card.patientId).filter(Boolean)) as string[];
  const professionalIds = board.columns.flatMap((column) =>
    column.cards.map((card) => card.professionalId).filter(Boolean)
  ) as string[];

  const [patients, professionals] = await Promise.all([
    prisma.patient.findMany({
      where: {
        id: {
          in: [...new Set(patientIds)]
        }
      },
      select: {
        id: true,
        fullName: true
      }
    }),
    prisma.professional.findMany({
      where: {
        id: {
          in: [...new Set(professionalIds)]
        }
      },
      select: {
        id: true,
        name: true
      }
    })
  ]);

  const patientMap = new Map(patients.map((patient) => [patient.id, patient.fullName]));
  const professionalMap = new Map(professionals.map((professional) => [professional.id, professional.name]));

  return {
    id: board.id,
    name: board.name,
    description: board.description ?? "",
    columns: board.columns.map((column) => ({
      id: column.id,
      name: column.name,
      color: column.color ?? "#0A3F9A",
      position: column.position,
      cards: column.cards.map((card): ServiceCardView => ({
        id: card.id,
        title: card.title,
        description: card.description,
        patientId: card.patientId,
        patientName: card.patientId ? patientMap.get(card.patientId) ?? "Paciente nao encontrado" : "Sem paciente",
        professionalId: card.professionalId,
        professionalName: card.professionalId
          ? professionalMap.get(card.professionalId) ?? "Profissional nao encontrado"
          : "Sem profissional",
        priority: card.priority,
        dueDate: formatDate(card.dueDate)
      }))
    }))
  };
}

export async function createServiceCard(input: CreateServiceCardInput) {
  if (!process.env.DATABASE_URL) {
    return {
      id: `mock-card-${Date.now()}`
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado para criar servico.");
  }

  const board = await prisma.serviceBoard.findFirst({
    where: {
      tenantId
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!board) {
    throw new Error("Nenhum board de servicos encontrado.");
  }

  const card = await prisma.serviceCard.create({
    data: {
      tenantId,
      columnId: input.columnId,
      title: input.title,
      description: input.description,
      patientId: input.patientId || null,
      professionalId: input.professionalId || null,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    }
  });

  return card;
}

export async function moveServiceCard(cardId: string, columnId: string) {
  if (!process.env.DATABASE_URL) {
    return { id: cardId, columnId };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const scopedCard = await prisma.serviceCard.findUnique({
    where: {
      id: cardId
    },
    select: {
      tenantId: true
    }
  });

  if (!scopedCard || scopedCard.tenantId !== tenantId) {
    return null;
  }

  const card = await prisma.serviceCard.update({
    where: {
      id: cardId
    },
    data: {
      columnId
    }
  });

  return card;
}
