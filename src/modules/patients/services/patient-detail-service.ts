import { prisma } from "@/lib/db/prisma";
import { mockPatients } from "@/modules/patients/data/mock-patients";
import { mockPatientDetails } from "@/modules/patients/data/mock-patient-detail";
import type { PatientDetail } from "@/modules/patients/types/patient-detail";

export async function getPatientDetail(id: string): Promise<PatientDetail | null> {
  if (!process.env.DATABASE_URL) {
    return (
      mockPatientDetails[id] ?? {
        id,
        fullName: mockPatients.find((patient) => patient.id === id)?.fullName ?? "Paciente",
        chartNumber: mockPatients.find((patient) => patient.id === id)?.chartNumber ?? null,
        cpf: mockPatients.find((patient) => patient.id === id)?.cpf ?? null,
        mobilePhone: mockPatients.find((patient) => patient.id === id)?.mobilePhone ?? null,
        whatsappPhone: mockPatients.find((patient) => patient.id === id)?.whatsappPhone ?? null,
        email: mockPatients.find((patient) => patient.id === id)?.email ?? null,
        birthDate: mockPatients.find((patient) => patient.id === id)?.birthDate ?? null,
        status: mockPatients.find((patient) => patient.id === id)?.status ?? "ACTIVE",
        plan: "Particular Premium",
        responsibleProfessional: "Nao definido",
        lastAppointment: null,
        nextAppointment: null,
        notes: null,
        budgets: [],
        treatments: [],
        evolutions: [],
        anamnesisSummary: ["Anamnese ainda nao registrada."],
        images: [],
        documents: [],
        debts: []
      }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      plan: true,
      appointments: {
        include: {
          professional: true
        },
        orderBy: {
          startsAt: "asc"
        }
      },
      financialItems: {
        orderBy: {
          dueDate: "asc"
        }
      }
    }
  });

  if (!patient) {
    return null;
  }

  const previousAppointments = patient.appointments.filter((item) => item.startsAt < new Date());
  const nextAppointments = patient.appointments.filter((item) => item.startsAt >= new Date());
  const latestProfessional = nextAppointments[0]?.professional?.name ?? previousAppointments.at(-1)?.professional?.name ?? null;

  return {
    id: patient.id,
    fullName: patient.fullName,
    chartNumber: patient.chartNumber,
    cpf: patient.cpf,
    mobilePhone: patient.mobilePhone,
    whatsappPhone: patient.whatsappPhone,
    email: patient.email,
    birthDate: patient.birthDate?.toISOString() ?? null,
    status: patient.status,
    plan: patient.plan?.name ?? null,
    responsibleProfessional: latestProfessional,
    lastAppointment: previousAppointments.at(-1)?.startsAt.toISOString() ?? null,
    nextAppointment: nextAppointments[0]?.startsAt.toISOString() ?? null,
    notes: patient.notes,
    budgets: [],
    treatments: [],
    evolutions: [],
    anamnesisSummary: ["Estrutura pronta para modelos dinamicos por clinica."],
    images: [],
    documents: [],
    debts: patient.financialItems.map((item) => ({
      id: item.id,
      description: item.description,
      dueDate: item.dueDate?.toISOString() ?? item.createdAt.toISOString(),
      amount: Number(item.amount),
      status: item.status === "PAID" ? "PAID" : item.status === "OVERDUE" ? "OVERDUE" : "PENDING"
    }))
  };
}
