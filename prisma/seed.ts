import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "dental-prompt-demo" },
    update: {},
    create: {
      name: "Dental Prompt Demo",
      slug: "dental-prompt-demo",
      status: "ACTIVE",
      legalName: "Dental Prompt Clinica Demonstracao",
      settings: {
        create: {
          clinicName: "Dental Prompt Demo",
          legalName: "Dental Prompt Clinica Demonstracao",
          email: "contato@dentalprompt.com",
          phone: "(11) 4000-2026",
          whatsapp: "(11) 99999-2026"
        }
      }
    }
  });

  const role = await prisma.role.upsert({
    where: { code: "tenant_admin" },
    update: {},
    create: {
      code: "tenant_admin",
      name: "Administrador da Clinica",
      description: "Acesso completo ao tenant."
    }
  });

  const permissions = await Promise.all(
    [
      ["dashboard", "view"],
      ["patients", "view"],
      ["patients", "create"],
      ["patients", "update"],
      ["appointments", "view"],
      ["conversations", "view"],
      ["settings", "view"]
    ].map(([resource, action]) =>
      prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action }
      })
    )
  );

  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      })
    )
  );

  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dentalprompt.com" },
    update: {
      tenantId: tenant.id,
      passwordHash: adminPassword,
      status: "ACTIVE"
    },
    create: {
      tenantId: tenant.id,
      email: "admin@dentalprompt.com",
      name: "Administrador Dental Prompt",
      passwordHash: adminPassword,
      status: "ACTIVE"
    }
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: role.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: role.id
    }
  });

  const plan = await prisma.plan.upsert({
    where: {
      id: "plan_demo"
    },
    update: {},
    create: {
      id: "plan_demo",
      tenantId: tenant.id,
      name: "Particular Premium",
      isDefault: true
    }
  });

  await prisma.patient.upsert({
    where: { id: "patient_demo_1" },
    update: {},
    create: {
      id: "patient_demo_1",
      tenantId: tenant.id,
      createdById: admin.id,
      fullName: "Mariana Carvalho de Lima",
      chartNumber: "PC-00018",
      cpf: "092.114.330-19",
      email: "mariana.lima@email.com",
      mobilePhone: "(11) 99876-4231",
      whatsappPhone: "(11) 99876-4231",
      birthDate: new Date("1990-05-12"),
      status: "IN_TREATMENT",
      planId: plan.id,
      notes: "Paciente em acompanhamento de reabilitacao e ortodontia."
    }
  });

  await Promise.all(
    [
      {
        id: "patient_demo_2",
        fullName: "Carlos Eduardo Prado",
        chartNumber: "PC-00019",
        cpf: "419.558.210-67",
        email: "carlos.prado@email.com",
        mobilePhone: "(11) 99771-3320",
        whatsappPhone: "(11) 99771-3320",
        birthDate: new Date("1987-07-21"),
        status: "ACTIVE" as const,
        notes: "Paciente com manutencao ortodontica recorrente."
      },
      {
        id: "patient_demo_3",
        fullName: "Ana Beatriz Nunes",
        chartNumber: "PC-00020",
        cpf: "651.247.980-54",
        email: "ana.nunes@email.com",
        mobilePhone: "(11) 99620-8734",
        whatsappPhone: "(11) 99620-8734",
        birthDate: new Date("1995-07-09"),
        status: "IN_TREATMENT" as const,
        notes: "Paciente em planejamento de implantes e protese."
      },
      {
        id: "patient_demo_4",
        fullName: "Juliana Martins Rocha",
        chartNumber: "PC-00021",
        cpf: "184.906.320-03",
        email: "juliana.rocha@email.com",
        mobilePhone: "(11) 99541-8812",
        whatsappPhone: "(11) 99541-8812",
        birthDate: new Date("2001-11-18"),
        status: "LEAD" as const,
        notes: "Lead originado do Instagram aguardando fechamento do plano."
      },
      {
        id: "patient_demo_5",
        fullName: "Roberto Almeida Sousa",
        chartNumber: "PC-00022",
        cpf: "708.333.560-05",
        email: "roberto.sousa@email.com",
        mobilePhone: "(11) 99412-4510",
        whatsappPhone: "(11) 99412-4510",
        birthDate: new Date("1979-03-03"),
        status: "INACTIVE" as const,
        notes: "Paciente sem retorno recente e com debito em aberto."
      }
    ].map((patientData) =>
      prisma.patient.upsert({
        where: { id: patientData.id },
        update: {},
        create: {
          ...patientData,
          tenantId: tenant.id,
          createdById: admin.id,
          planId: plan.id
        }
      })
    )
  );

  const professionals = await Promise.all(
    [
      {
        id: "pro_demo_1",
        name: "Dra. Camila Borges",
        specialty: "Dentistica",
        roleLabel: "Dentista",
        email: "camila@dentalprompt.com",
        phone: "(11) 98888-1001"
      },
      {
        id: "pro_demo_2",
        name: "Dr. Thiago Salles",
        specialty: "Ortodontia",
        roleLabel: "Dentista",
        email: "thiago@dentalprompt.com",
        phone: "(11) 98888-1002"
      },
      {
        id: "pro_demo_3",
        name: "Dra. Renata Paiva",
        specialty: "Implantodontia",
        roleLabel: "Dentista",
        email: "renata@dentalprompt.com",
        phone: "(11) 98888-1003"
      }
    ].map((professional) =>
      prisma.professional.upsert({
        where: { id: professional.id },
        update: {
          ...professional,
          tenantId: tenant.id
        },
        create: {
          ...professional,
          tenantId: tenant.id
        }
      })
    )
  );

  const [patientOne, patientTwo, patientThree, patientFour, patientFive] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: "patient_demo_1" }
    }),
    prisma.patient.findUnique({
      where: { id: "patient_demo_2" }
    }),
    prisma.patient.findUnique({
      where: { id: "patient_demo_3" }
    }),
    prisma.patient.findUnique({
      where: { id: "patient_demo_4" }
    }),
    prisma.patient.findUnique({
      where: { id: "patient_demo_5" }
    })
  ]);

  const appointments = [
    patientOne && {
      id: "appointment_demo_1",
      patientId: patientOne.id,
      professionalId: professionals[0].id,
      title: "Avaliacao inicial",
      startsAt: new Date("2026-07-12T09:00:00.000Z"),
      endsAt: new Date("2026-07-12T09:40:00.000Z"),
      status: "CONFIRMED" as const,
      notes: "Paciente deseja revisar plano estetico."
    },
    patientTwo && {
      id: "appointment_demo_2",
      patientId: patientTwo.id,
      professionalId: professionals[1].id,
      title: "Manutencao ortodontica",
      startsAt: new Date("2026-07-12T10:20:00.000Z"),
      endsAt: new Date("2026-07-12T11:00:00.000Z"),
      status: "RETURN" as const,
      notes: "Revisao mensal do aparelho."
    },
    patientThree && {
      id: "appointment_demo_3",
      patientId: patientThree.id,
      professionalId: professionals[2].id,
      title: "Planejamento implantodontico",
      startsAt: new Date("2026-07-12T14:10:00.000Z"),
      endsAt: new Date("2026-07-12T15:00:00.000Z"),
      status: "SCHEDULED" as const,
      notes: "Validar exames e opcoes de protese."
    },
    patientOne && {
      id: "appointment_demo_4",
      patientId: patientOne.id,
      professionalId: professionals[0].id,
      title: "Retorno de clareamento",
      startsAt: new Date("2026-06-18T13:00:00.000Z"),
      endsAt: new Date("2026-06-18T13:30:00.000Z"),
      status: "COMPLETED" as const,
      notes: "Acompanhamento da sensibilidade."
    },
    patientThree && {
      id: "appointment_demo_5",
      patientId: patientThree.id,
      professionalId: professionals[2].id,
      title: "Consulta de implante",
      startsAt: new Date("2026-05-28T15:00:00.000Z"),
      endsAt: new Date("2026-05-28T16:00:00.000Z"),
      status: "COMPLETED" as const,
      notes: "Planejamento aprovado."
    },
    patientFive && {
      id: "appointment_demo_6",
      patientId: patientFive.id,
      professionalId: professionals[1].id,
      title: "Reativacao de tratamento",
      startsAt: new Date("2026-04-05T11:00:00.000Z"),
      endsAt: new Date("2026-04-05T11:30:00.000Z"),
      status: "NO_SHOW" as const,
      notes: "Paciente nao compareceu."
    }
  ].filter(isPresent);

  await Promise.all(
    appointments.map((appointment) =>
      prisma.appointment.upsert({
        where: { id: appointment.id },
        update: {},
        create: {
          id: appointment.id,
          tenantId: tenant.id,
          patientId: appointment.patientId,
          professionalId: appointment.professionalId,
          title: appointment.title,
          startsAt: appointment.startsAt,
          endsAt: appointment.endsAt,
          status: appointment.status,
          notes: appointment.notes
        }
      })
    )
  );

  await prisma.agent.upsert({
    where: { id: "agent_demo_1" },
    update: {},
    create: {
      id: "agent_demo_1",
      tenantId: tenant.id,
      name: "Recepcionista IA",
      description: "Atendimento inicial e confirmacao de agenda.",
      whatsappNumber: "5511999990001",
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      promptBase:
        "Voce e a recepcionista virtual da clinica. Responda de forma objetiva, cordial e segura.",
      initialMessage: "Ola! Como posso ajudar voce hoje?",
      status: "ACTIVE"
    }
  });

  await prisma.agent.upsert({
    where: { id: "agent_demo_2" },
    update: {},
    create: {
      id: "agent_demo_2",
      tenantId: tenant.id,
      name: "Financeiro IA",
      description: "Apoio em cobranca preventiva e lembretes de pagamento.",
      whatsappNumber: "5511999990002",
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      promptBase: "Voce auxilia o setor financeiro com cordialidade e foco em clareza.",
      initialMessage: "Oi! Posso ajudar com boletos, comprovantes e datas de pagamento.",
      status: "ACTIVE"
    }
  });

  const conversations = [
    patientOne && {
      id: "conversation_demo_1",
      patientId: patientOne.id,
      contactName: patientOne.fullName,
      contactPhone: "5511998764231",
      unreadCount: 3,
      isAiEnabled: true,
      lastMessageAt: new Date("2026-07-12T08:42:00.000Z")
    },
    patientTwo && {
      id: "conversation_demo_2",
      patientId: patientTwo.id,
      contactName: patientTwo.fullName,
      contactPhone: "5511997713320",
      unreadCount: 1,
      isAiEnabled: false,
      lastMessageAt: new Date("2026-07-11T16:10:00.000Z")
    },
    patientFour && {
      id: "conversation_demo_3",
      patientId: patientFour.id,
      contactName: patientFour.fullName,
      contactPhone: "5511995418812",
      unreadCount: 2,
      isAiEnabled: true,
      lastMessageAt: new Date("2026-07-10T14:35:00.000Z")
    }
  ].filter(isPresent);

  await Promise.all(
    conversations.map((conversation) =>
      prisma.conversation.upsert({
        where: { id: conversation.id },
        update: {},
        create: {
          id: conversation.id,
          tenantId: tenant.id,
          patientId: conversation.patientId,
          contactName: conversation.contactName,
          contactPhone: conversation.contactPhone,
          unreadCount: conversation.unreadCount,
          isAiEnabled: conversation.isAiEnabled,
          lastMessageAt: conversation.lastMessageAt
        }
      })
    )
  );

  await Promise.all(
    [
      {
        id: "message_demo_1",
        conversationId: "conversation_demo_1",
        direction: "INBOUND" as const,
        status: "READ" as const,
        content: "Bom dia, quero confirmar meu retorno de amanha.",
        sentAt: new Date("2026-07-12T08:40:00.000Z"),
        readAt: new Date("2026-07-12T08:41:00.000Z")
      },
      {
        id: "message_demo_2",
        conversationId: "conversation_demo_1",
        direction: "OUTBOUND" as const,
        status: "DELIVERED" as const,
        content: "Claro! Sua consulta esta marcada para as 9h.",
        sentAt: new Date("2026-07-12T08:42:00.000Z"),
        deliveredAt: new Date("2026-07-12T08:42:30.000Z")
      },
      {
        id: "message_demo_3",
        conversationId: "conversation_demo_2",
        direction: "INBOUND" as const,
        status: "READ" as const,
        content: "Pode me enviar o valor atualizado do meu plano?",
        sentAt: new Date("2026-07-11T16:10:00.000Z"),
        readAt: new Date("2026-07-11T16:11:00.000Z")
      },
      {
        id: "message_demo_4",
        conversationId: "conversation_demo_3",
        direction: "INBOUND" as const,
        status: "READ" as const,
        content: "Quero saber se ainda consigo desconto para fechar este mes.",
        sentAt: new Date("2026-07-10T14:35:00.000Z"),
        readAt: new Date("2026-07-10T14:36:00.000Z")
      }
    ].map((message) =>
      prisma.message.upsert({
        where: { id: message.id },
        update: {},
        create: message
      })
    )
  );

  await Promise.all(
    [
      patientOne && {
        id: "financial_demo_1",
        patientId: patientOne.id,
        professionalId: professionals[0].id,
        description: "Entrada clareamento supervisionado",
        type: "INCOME" as const,
        status: "PAID" as const,
        category: "Tratamento",
        paymentMethod: "Cartao",
        amount: 1800,
        dueDate: new Date("2026-07-10T10:00:00.000Z"),
        paidAt: new Date("2026-07-10T10:00:00.000Z")
      },
      patientOne && {
        id: "financial_demo_2",
        patientId: patientOne.id,
        professionalId: professionals[0].id,
        description: "Parcela 2 clareamento",
        type: "INCOME" as const,
        status: "PENDING" as const,
        category: "Mensalidade",
        paymentMethod: "PIX",
        amount: 1200,
        dueDate: new Date("2026-07-20T10:00:00.000Z")
      },
      patientTwo && {
        id: "financial_demo_3",
        patientId: patientTwo.id,
        professionalId: professionals[1].id,
        description: "Mensalidade ortodontia",
        type: "INCOME" as const,
        status: "PAID" as const,
        category: "Ortodontia",
        paymentMethod: "PIX",
        amount: 950,
        dueDate: new Date("2026-07-11T09:00:00.000Z"),
        paidAt: new Date("2026-07-12T12:30:00.000Z")
      },
      patientThree && {
        id: "financial_demo_4",
        patientId: patientThree.id,
        professionalId: professionals[2].id,
        description: "Sinal de implantodontia",
        type: "INCOME" as const,
        status: "PAID" as const,
        category: "Implantes",
        paymentMethod: "Transferencia",
        amount: 4200,
        dueDate: new Date("2026-07-05T15:00:00.000Z"),
        paidAt: new Date("2026-07-05T15:10:00.000Z")
      },
      patientFive && {
        id: "financial_demo_5",
        patientId: patientFive.id,
        description: "Parcela em atraso de reabilitacao",
        type: "INCOME" as const,
        status: "OVERDUE" as const,
        category: "Cobranca",
        paymentMethod: "Boleto",
        amount: 780,
        dueDate: new Date("2026-07-02T10:00:00.000Z")
      },
      {
        id: "financial_demo_6",
        description: "Compra de materiais clinicos",
        type: "EXPENSE" as const,
        status: "PAID" as const,
        category: "Insumos",
        paymentMethod: "Boleto",
        amount: 640,
        dueDate: new Date("2026-07-09T11:00:00.000Z"),
        paidAt: new Date("2026-07-09T11:00:00.000Z")
      },
      {
        id: "financial_demo_7",
        description: "Laboratorio protetico",
        type: "EXPENSE" as const,
        status: "PAID" as const,
        category: "Laboratorio",
        paymentMethod: "Transferencia",
        amount: 1180,
        dueDate: new Date("2026-07-08T16:00:00.000Z"),
        paidAt: new Date("2026-07-08T16:30:00.000Z")
      },
      patientThree && {
        id: "financial_demo_8",
        patientId: patientThree.id,
        professionalId: professionals[2].id,
        description: "Parcela futura de protese",
        type: "INCOME" as const,
        status: "SCHEDULED" as const,
        category: "Protetico",
        paymentMethod: "Cartao",
        amount: 2600,
        dueDate: new Date("2026-07-25T10:00:00.000Z")
      },
      patientTwo && {
        id: "financial_demo_9",
        patientId: patientTwo.id,
        professionalId: professionals[1].id,
        description: "Manutencao ortodontica junho",
        type: "INCOME" as const,
        status: "PAID" as const,
        category: "Ortodontia",
        paymentMethod: "PIX",
        amount: 920,
        dueDate: new Date("2026-06-18T09:00:00.000Z"),
        paidAt: new Date("2026-06-18T09:30:00.000Z")
      }
    ].filter(isPresent)
      .map((entry) =>
        prisma.financialEntry.upsert({
          where: { id: entry.id },
          update: {},
          create: {
            ...entry,
            tenantId: tenant.id
          }
        })
      )
  );

  const serviceBoard = await prisma.serviceBoard.upsert({
    where: { id: "service_board_demo_1" },
    update: {
      name: "Fluxo principal",
      description: "Kanban operacional da clinica."
    },
    create: {
      id: "service_board_demo_1",
      tenantId: tenant.id,
      name: "Fluxo principal",
      description: "Kanban operacional da clinica."
    }
  });

  const serviceColumns = await Promise.all(
    [
      { id: "service_column_demo_1", name: "Novo servico", color: "#0A3F9A", position: 1 },
      { id: "service_column_demo_2", name: "Em producao", color: "#22C7C7", position: 2 },
      { id: "service_column_demo_3", name: "Laboratorio", color: "#F59E0B", position: 3 },
      { id: "service_column_demo_4", name: "Concluido", color: "#16A34A", position: 4 }
    ].map((column) =>
      prisma.serviceColumn.upsert({
        where: { id: column.id },
        update: {
          boardId: serviceBoard.id,
          name: column.name,
          color: column.color,
          position: column.position
        },
        create: {
          id: column.id,
          boardId: serviceBoard.id,
          name: column.name,
          color: column.color,
          position: column.position
        }
      })
    )
  );

  await Promise.all(
    [
      patientOne && {
        id: "service_card_demo_1",
        columnId: serviceColumns[0].id,
        patientId: patientOne.id,
        professionalId: professionals[0].id,
        title: "Clareamento supervisionado",
        description: "Paciente aguardando inicio da sequencia clinica.",
        priority: "NORMAL" as const,
        dueDate: new Date("2026-07-15T10:00:00.000Z")
      },
      patientTwo && {
        id: "service_card_demo_2",
        columnId: serviceColumns[1].id,
        patientId: patientTwo.id,
        professionalId: professionals[1].id,
        title: "Manutencao ortodontica especial",
        description: "Separar material e validar agenda para atendimento estendido.",
        priority: "HIGH" as const,
        dueDate: new Date("2026-07-16T11:00:00.000Z")
      },
      patientThree && {
        id: "service_card_demo_3",
        columnId: serviceColumns[2].id,
        patientId: patientThree.id,
        professionalId: professionals[2].id,
        title: "Planejamento implantodontico",
        description: "Aguardando retorno do laboratorio com estrutura protetica.",
        priority: "URGENT" as const,
        dueDate: new Date("2026-07-18T09:00:00.000Z")
      }
    ]
      .filter(isPresent)
      .map((card) =>
        prisma.serviceCard.upsert({
          where: { id: card.id },
          update: {
            columnId: card.columnId,
            patientId: card.patientId,
            professionalId: card.professionalId,
            title: card.title,
            description: card.description,
            priority: card.priority,
            dueDate: card.dueDate
          },
          create: {
            id: card.id,
            tenantId: tenant.id,
            columnId: card.columnId,
            patientId: card.patientId,
            professionalId: card.professionalId,
            title: card.title,
            description: card.description,
            priority: card.priority,
            dueDate: card.dueDate
          }
        })
      )
  );

  console.log("Seed concluido com tenant, admin, pacientes, profissionais, conversas, agenda, financeiro e agentes demo.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
