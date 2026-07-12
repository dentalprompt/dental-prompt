import { prisma } from "@/lib/db/prisma";
import { mockAppointments } from "@/modules/appointments/data/mock-appointments";
import type { AppointmentListItem, CreateAppointmentInput } from "@/modules/appointments/types/appointment";

type ListAppointmentsFilters = {
  professionalId?: string;
  date?: string;
};

function toDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export async function listAppointments(filters: ListAppointmentsFilters = {}): Promise<AppointmentListItem[]> {
  if (!process.env.DATABASE_URL) {
    return mockAppointments
      .filter((appointment) => {
        const matchesProfessional = filters.professionalId
          ? appointment.professional.id === filters.professionalId
          : true;
        const matchesDate = filters.date
          ? appointment.startsAt.slice(0, 10) === filters.date
          : true;

        return matchesProfessional && matchesDate;
      })
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId: filters.professionalId,
      ...(filters.date
        ? {
            startsAt: {
              gte: new Date(`${filters.date}T00:00:00.000Z`),
              lte: new Date(`${filters.date}T23:59:59.999Z`)
            }
          }
        : {})
    },
    include: {
      patient: true,
      professional: true
    },
    orderBy: {
      startsAt: "asc"
    }
  });

  return appointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.title,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status,
    patient: {
      id: appointment.patient.id,
      fullName: appointment.patient.fullName
    },
    professional: {
      id: appointment.professional.id,
      name: appointment.professional.name,
      specialty: appointment.professional.specialty
    },
    notes: appointment.notes
  }));
}

export async function createAppointment(input: CreateAppointmentInput): Promise<AppointmentListItem> {
  if (!process.env.DATABASE_URL) {
    const patient = {
      id: input.patientId,
      fullName:
        mockAppointments.find((appointment) => appointment.patient.id === input.patientId)?.patient.fullName ??
        "Paciente selecionado"
    };
    const professional = {
      id: input.professionalId,
      name:
        mockAppointments.find((appointment) => appointment.professional.id === input.professionalId)?.professional.name ??
        "Profissional selecionado",
      specialty:
        mockAppointments.find((appointment) => appointment.professional.id === input.professionalId)?.professional.specialty ??
        null
    };

    return {
      id: `mock_app_${Date.now()}`,
      title: input.title,
      startsAt: toDateTime(input.date, input.startTime).toISOString(),
      endsAt: toDateTime(input.date, input.endTime).toISOString(),
      status: input.status ?? "SCHEDULED",
      patient,
      professional,
      notes: input.notes ?? null
    };
  }

  const tenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!tenant) {
    throw new Error("Tenant nao encontrado para criar agendamento.");
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: tenant.id,
      patientId: input.patientId,
      professionalId: input.professionalId,
      title: input.title,
      startsAt: toDateTime(input.date, input.startTime),
      endsAt: toDateTime(input.date, input.endTime),
      status: input.status ?? "SCHEDULED",
      notes: input.notes
    },
    include: {
      patient: true,
      professional: true
    }
  });

  return {
    id: appointment.id,
    title: appointment.title,
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    status: appointment.status,
    patient: {
      id: appointment.patient.id,
      fullName: appointment.patient.fullName
    },
    professional: {
      id: appointment.professional.id,
      name: appointment.professional.name,
      specialty: appointment.professional.specialty
    },
    notes: appointment.notes
  };
}
