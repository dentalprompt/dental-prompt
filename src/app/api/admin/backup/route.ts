import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { prisma } from "@/lib/db/prisma";

function parseDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

type BackupPayload = {
  tenants?: Array<Record<string, any>>;
};

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "Backup requer banco configurado." }, { status: 400 });
  }

  const where = session.isSuperAdmin ? {} : { id: session.tenantId };

  const tenants = await prisma.tenant.findMany({
    where,
    include: {
      settings: true,
      users: {
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      },
      patients: {
        include: {
          appointments: true,
          conversations: {
            include: {
              messages: true
            }
          },
          financialItems: true,
          budgets: true,
          treatments: {
            include: {
              evolutions: true
            }
          },
          anamneses: true,
          files: true
        }
      },
      professionals: true,
      plans: {
        include: {
          procedures: true
        }
      },
      financialItems: true,
      serviceBoards: {
        include: {
          columns: {
            include: {
              cards: true
            }
          }
        }
      },
      agents: true,
      contracts: true,
      anamneses: true,
      accounts: true,
      chairs: true
    }
  });

  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), tenants }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="backup-${session.isSuperAdmin ? "global" : session.tenantId}.json"`
    }
  });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: "Restauracao requer banco configurado." }, { status: 400 });
    }

    const body = (await request.json()) as BackupPayload;
    const incomingTenants = Array.isArray(body.tenants) ? body.tenants : [];

    if (!incomingTenants.length) {
      return NextResponse.json({ message: "Nenhum tenant encontrado no arquivo de backup." }, { status: 400 });
    }

    const tenantsToRestore = session.isSuperAdmin
      ? incomingTenants
      : incomingTenants.filter((tenant) => tenant.id === session.tenantId || tenant.slug === session.tenantId);

    if (!tenantsToRestore.length) {
      return NextResponse.json({ message: "O backup nao contem dados do tenant atual." }, { status: 400 });
    }

    for (const tenant of tenantsToRestore) {
      const tenantId = session.isSuperAdmin ? String(tenant.id) : String(session.tenantId);

      await prisma.tenant.upsert({
        where: { id: tenantId },
        update: {
          name: tenant.name,
          slug: tenant.slug,
          legalName: tenant.legalName ?? null,
          cnpj: tenant.cnpj ?? null,
          status: tenant.status,
          primaryColor: tenant.primaryColor ?? null,
          secondaryColor: tenant.secondaryColor ?? null
        },
        create: {
          id: tenantId,
          name: tenant.name,
          slug: tenant.slug,
          legalName: tenant.legalName ?? null,
          cnpj: tenant.cnpj ?? null,
          status: tenant.status,
          primaryColor: tenant.primaryColor ?? null,
          secondaryColor: tenant.secondaryColor ?? null,
          createdAt: parseDate(tenant.createdAt) ?? new Date()
        }
      });

      await prisma.$transaction(async (tx) => {
        await tx.message.deleteMany({
          where: {
            conversation: {
              tenantId
            }
          }
        });
        await tx.conversation.deleteMany({ where: { tenantId } });
        await tx.appointment.deleteMany({ where: { tenantId } });
        await tx.treatmentEvolution.deleteMany({
          where: {
            treatment: {
              tenantId
            }
          }
        });
        await tx.patientTreatment.deleteMany({ where: { tenantId } });
        await tx.patientBudget.deleteMany({ where: { tenantId } });
        await tx.patientAnamnesis.deleteMany({ where: { tenantId } });
        await tx.patientFile.deleteMany({ where: { tenantId } });
        await tx.financialEntry.deleteMany({ where: { tenantId } });
        await tx.serviceCard.deleteMany({ where: { tenantId } });
        await tx.serviceColumn.deleteMany({
          where: {
            board: {
              tenantId
            }
          }
        });
        await tx.serviceBoard.deleteMany({ where: { tenantId } });
        await tx.agent.deleteMany({ where: { tenantId } });
        await tx.planProcedure.deleteMany({
          where: {
            plan: {
              tenantId
            }
          }
        });
        await tx.patient.deleteMany({ where: { tenantId } });
        await tx.professional.deleteMany({ where: { tenantId } });
        await tx.plan.deleteMany({ where: { tenantId } });
        await tx.contractTemplate.deleteMany({ where: { tenantId } });
        await tx.anamnesisTemplate.deleteMany({ where: { tenantId } });
        await tx.financialAccount.deleteMany({ where: { tenantId } });
        await tx.chair.deleteMany({ where: { tenantId } });
        await tx.clinicSettings.deleteMany({ where: { tenantId } });

        if (tenant.settings) {
          await tx.clinicSettings.create({
            data: {
              id: tenant.settings.id,
              tenantId,
              clinicName: tenant.settings.clinicName,
              legalName: tenant.settings.legalName ?? null,
              email: tenant.settings.email ?? null,
              phone: tenant.settings.phone ?? null,
              whatsapp: tenant.settings.whatsapp ?? null,
              logoUrl: tenant.settings.logoUrl ?? null,
              primaryColor: tenant.settings.primaryColor ?? null,
              secondaryColor: tenant.settings.secondaryColor ?? null,
              createdAt: parseDate(tenant.settings.createdAt) ?? new Date()
            }
          });
        }

        if (Array.isArray(tenant.anamneses) && tenant.anamneses.length) {
          await tx.anamnesisTemplate.createMany({
            data: tenant.anamneses.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              description: item.description ?? null,
              specialty: item.specialty ?? null,
              isActive: Boolean(item.isActive),
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.contracts) && tenant.contracts.length) {
          await tx.contractTemplate.createMany({
            data: tenant.contracts.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              description: item.description ?? null,
              category: item.category ?? null,
              content: item.content,
              isActive: Boolean(item.isActive),
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.accounts) && tenant.accounts.length) {
          await tx.financialAccount.createMany({
            data: tenant.accounts.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              bank: item.bank ?? null,
              agency: item.agency ?? null,
              account: item.account ?? null,
              type: item.type,
              initialBalance: item.initialBalance ?? 0,
              isActive: Boolean(item.isActive),
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.chairs) && tenant.chairs.length) {
          await tx.chair.createMany({
            data: tenant.chairs.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              code: item.code ?? null,
              room: item.room ?? null,
              color: item.color ?? null,
              isActive: Boolean(item.isActive),
              notes: item.notes ?? null,
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.agents) && tenant.agents.length) {
          await tx.agent.createMany({
            data: tenant.agents.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              description: item.description ?? null,
              whatsappNumber: item.whatsappNumber,
              model: item.model,
              temperature: item.temperature ?? 0.2,
              promptBase: item.promptBase,
              initialMessage: item.initialMessage ?? null,
              status: item.status,
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.professionals) && tenant.professionals.length) {
          await tx.professional.createMany({
            data: tenant.professionals.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              email: item.email ?? null,
              phone: item.phone ?? null,
              specialty: item.specialty ?? null,
              roleLabel: item.roleLabel ?? null,
              isActive: Boolean(item.isActive),
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.plans) && tenant.plans.length) {
          await tx.plan.createMany({
            data: tenant.plans.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              description: item.description ?? null,
              isDefault: Boolean(item.isDefault),
              isInsurance: Boolean(item.isInsurance),
              isActive: Boolean(item.isActive),
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });

          const procedures = tenant.plans.flatMap((plan: Record<string, any>) =>
            Array.isArray(plan.procedures)
              ? plan.procedures.map((procedure: Record<string, any>) => ({
                  id: procedure.id,
                  planId: plan.id,
                  specialty: procedure.specialty,
                  name: procedure.name,
                  price: procedure.price ?? 0,
                  cost: procedure.cost ?? 0,
                  isActive: Boolean(procedure.isActive),
                  usesToothFaces: Boolean(procedure.usesToothFaces),
                  notes: procedure.notes ?? null,
                  createdAt: parseDate(procedure.createdAt) ?? new Date(),
                  updatedAt: parseDate(procedure.updatedAt) ?? new Date()
                }))
              : []
          );

          if (procedures.length) {
            await tx.planProcedure.createMany({ data: procedures });
          }
        }

        if (Array.isArray(tenant.patients) && tenant.patients.length) {
          await tx.patient.createMany({
            data: tenant.patients.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              createdById: null,
              fullName: item.fullName,
              chartNumber: item.chartNumber ?? null,
              cpf: item.cpf ?? null,
              rg: item.rg ?? null,
              email: item.email ?? null,
              phone: item.phone ?? null,
              mobilePhone: item.mobilePhone ?? null,
              whatsappPhone: item.whatsappPhone ?? null,
              birthDate: parseDate(item.birthDate),
              status: item.status,
              planId: item.planId ?? null,
              notes: item.notes ?? null,
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });

          const patientBudgets = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.budgets)
              ? item.budgets.map((budget: Record<string, any>) => ({
                  id: budget.id,
                  tenantId,
                  patientId: item.id,
                  professionalId: budget.professionalId ?? null,
                  planId: budget.planId ?? null,
                  number: budget.number,
                  date: parseDate(budget.date) ?? new Date(),
                  value: budget.value ?? 0,
                  finalValue: budget.finalValue ?? 0,
                  status: budget.status,
                  createdAt: parseDate(budget.createdAt) ?? new Date(),
                  updatedAt: parseDate(budget.updatedAt) ?? new Date()
                }))
              : []
          );

          if (patientBudgets.length) {
            await tx.patientBudget.createMany({ data: patientBudgets });
          }

          const patientTreatments = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.treatments)
              ? item.treatments.map((treatment: Record<string, any>) => ({
                  id: treatment.id,
                  tenantId,
                  patientId: item.id,
                  professionalId: treatment.professionalId ?? null,
                  procedure: treatment.procedure,
                  tooth: treatment.tooth ?? null,
                  face: treatment.face ?? null,
                  status: treatment.status,
                  createdAt: parseDate(treatment.createdAt) ?? new Date(),
                  updatedAt: parseDate(treatment.updatedAt) ?? new Date()
                }))
              : []
          );

          if (patientTreatments.length) {
            await tx.patientTreatment.createMany({ data: patientTreatments });
          }

          const evolutions = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.treatments)
              ? item.treatments.flatMap((treatment: Record<string, any>) =>
                  Array.isArray(treatment.evolutions)
                    ? treatment.evolutions.map((evolution: Record<string, any>) => ({
                        id: evolution.id,
                        treatmentId: treatment.id,
                        professionalId: evolution.professionalId ?? null,
                        description: evolution.description,
                        createdAt: parseDate(evolution.createdAt) ?? new Date()
                      }))
                    : []
                )
              : []
          );

          if (evolutions.length) {
            await tx.treatmentEvolution.createMany({ data: evolutions });
          }

          const anamneses = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.anamneses)
              ? item.anamneses.map((anamnesis: Record<string, any>) => ({
                  id: anamnesis.id,
                  tenantId,
                  patientId: item.id,
                  templateId: anamnesis.templateId ?? null,
                  summary: anamnesis.summary,
                  createdAt: parseDate(anamnesis.createdAt) ?? new Date(),
                  updatedAt: parseDate(anamnesis.updatedAt) ?? new Date()
                }))
              : []
          );

          if (anamneses.length) {
            await tx.patientAnamnesis.createMany({ data: anamneses });
          }

          const files = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.files)
              ? item.files.map((file: Record<string, any>) => ({
                  id: file.id,
                  tenantId,
                  patientId: item.id,
                  name: file.name,
                  type: file.type,
                  category: file.category,
                  url: file.url ?? null,
                  createdAt: parseDate(file.createdAt) ?? new Date(),
                  updatedAt: parseDate(file.updatedAt) ?? new Date()
                }))
              : []
          );

          if (files.length) {
            await tx.patientFile.createMany({ data: files });
          }

          const appointments = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.appointments)
              ? item.appointments.map((appointment: Record<string, any>) => ({
                  id: appointment.id,
                  tenantId,
                  patientId: item.id,
                  professionalId: appointment.professionalId,
                  title: appointment.title,
                  startsAt: parseDate(appointment.startsAt) ?? new Date(),
                  endsAt: parseDate(appointment.endsAt) ?? new Date(),
                  status: appointment.status,
                  notes: appointment.notes ?? null,
                  createdAt: parseDate(appointment.createdAt) ?? new Date(),
                  updatedAt: parseDate(appointment.updatedAt) ?? new Date()
                }))
              : []
          );

          if (appointments.length) {
            await tx.appointment.createMany({ data: appointments });
          }

          const conversations = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.conversations)
              ? item.conversations.map((conversation: Record<string, any>) => ({
                  id: conversation.id,
                  tenantId,
                  patientId: item.id,
                  contactName: conversation.contactName,
                  contactPhone: conversation.contactPhone,
                  channel: conversation.channel,
                  unreadCount: conversation.unreadCount ?? 0,
                  isAiEnabled: Boolean(conversation.isAiEnabled),
                  lastMessageAt: parseDate(conversation.lastMessageAt),
                  createdAt: parseDate(conversation.createdAt) ?? new Date(),
                  updatedAt: parseDate(conversation.updatedAt) ?? new Date()
                }))
              : []
          );

          if (conversations.length) {
            await tx.conversation.createMany({ data: conversations });
          }

          const messages = tenant.patients.flatMap((item: Record<string, any>) =>
            Array.isArray(item.conversations)
              ? item.conversations.flatMap((conversation: Record<string, any>) =>
                  Array.isArray(conversation.messages)
                    ? conversation.messages.map((message: Record<string, any>) => ({
                        id: message.id,
                        conversationId: conversation.id,
                        externalId: message.externalId ?? null,
                        direction: message.direction,
                        status: message.status,
                        content: message.content ?? null,
                        mediaUrl: message.mediaUrl ?? null,
                        sentAt: parseDate(message.sentAt),
                        deliveredAt: parseDate(message.deliveredAt),
                        readAt: parseDate(message.readAt),
                        createdAt: parseDate(message.createdAt) ?? new Date(),
                        updatedAt: parseDate(message.updatedAt) ?? new Date()
                      }))
                    : []
                )
              : []
          );

          if (messages.length) {
            await tx.message.createMany({ data: messages });
          }
        }

        if (Array.isArray(tenant.financialItems) && tenant.financialItems.length) {
          await tx.financialEntry.createMany({
            data: tenant.financialItems.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              patientId: item.patientId ?? null,
              professionalId: item.professionalId ?? null,
              description: item.description,
              type: item.type,
              status: item.status,
              category: item.category,
              paymentMethod: item.paymentMethod,
              amount: item.amount ?? 0,
              dueDate: parseDate(item.dueDate),
              paidAt: parseDate(item.paidAt),
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });
        }

        if (Array.isArray(tenant.serviceBoards) && tenant.serviceBoards.length) {
          await tx.serviceBoard.createMany({
            data: tenant.serviceBoards.map((item: Record<string, any>) => ({
              id: item.id,
              tenantId,
              name: item.name,
              description: item.description ?? null,
              createdAt: parseDate(item.createdAt) ?? new Date(),
              updatedAt: parseDate(item.updatedAt) ?? new Date()
            }))
          });

          const columns = tenant.serviceBoards.flatMap((board: Record<string, any>) =>
            Array.isArray(board.columns)
              ? board.columns.map((column: Record<string, any>) => ({
                  id: column.id,
                  boardId: board.id,
                  name: column.name,
                  color: column.color ?? null,
                  position: column.position,
                  createdAt: parseDate(column.createdAt) ?? new Date(),
                  updatedAt: parseDate(column.updatedAt) ?? new Date()
                }))
              : []
          );

          if (columns.length) {
            await tx.serviceColumn.createMany({ data: columns });
          }

          const cards = tenant.serviceBoards.flatMap((board: Record<string, any>) =>
            Array.isArray(board.columns)
              ? board.columns.flatMap((column: Record<string, any>) =>
                  Array.isArray(column.cards)
                    ? column.cards.map((card: Record<string, any>) => ({
                        id: card.id,
                        columnId: column.id,
                        tenantId,
                        patientId: card.patientId ?? null,
                        professionalId: card.professionalId ?? null,
                        title: card.title,
                        description: card.description,
                        priority: card.priority,
                        dueDate: parseDate(card.dueDate),
                        createdAt: parseDate(card.createdAt) ?? new Date(),
                        updatedAt: parseDate(card.updatedAt) ?? new Date()
                      }))
                    : []
                )
              : []
          );

          if (cards.length) {
            await tx.serviceCard.createMany({ data: cards });
          }
        }
      });
    }

    return NextResponse.json({
      message: "Backup restaurado com sucesso.",
      restoredTenants: tenantsToRestore.length
    });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel restaurar o backup." }, { status: 400 });
  }
}
