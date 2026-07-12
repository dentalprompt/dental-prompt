import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { mockPatients } from "@/modules/patients/data/mock-patients";
import type { CreatePatientInput, PatientListItem } from "@/modules/patients/types/patient";

function filterMockPatients(search?: string) {
  if (!search) {
    return mockPatients;
  }

  const term = search.toLowerCase();

  return mockPatients.filter((patient) =>
    [patient.fullName, patient.chartNumber, patient.cpf, patient.mobilePhone, patient.email]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(term))
  );
}

export async function listPatients(search?: string): Promise<PatientListItem[]> {
  if (!process.env.DATABASE_URL) {
    return filterMockPatients(search);
  }

  const patients = await prisma.patient.findMany({
    where: search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { chartNumber: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search, mode: "insensitive" } },
            { mobilePhone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: {
      createdAt: "desc"
    }
  });

  return patients.map((patient) => ({
    id: patient.id,
    fullName: patient.fullName,
    chartNumber: patient.chartNumber,
    cpf: patient.cpf,
    mobilePhone: patient.mobilePhone,
    whatsappPhone: patient.whatsappPhone,
    email: patient.email,
    birthDate: patient.birthDate?.toISOString() ?? null,
    status: patient.status,
    createdAt: patient.createdAt.toISOString()
  }));
}

export async function createPatient(input: CreatePatientInput): Promise<PatientListItem> {
  if (!process.env.DATABASE_URL) {
    return {
      id: `mock_${Date.now()}`,
      fullName: input.fullName,
      chartNumber: input.chartNumber ?? null,
      cpf: input.cpf ?? null,
      mobilePhone: input.mobilePhone ?? null,
      whatsappPhone: input.whatsappPhone ?? input.mobilePhone ?? null,
      email: input.email ?? null,
      birthDate: input.birthDate ?? null,
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };
  }

  const tenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!tenant) {
    throw new Prisma.PrismaClientKnownRequestError("Tenant not found", {
      code: "P2025",
      clientVersion: "5"
    });
  }

  const patient = await prisma.patient.create({
    data: {
      tenantId: tenant.id,
      fullName: input.fullName,
      cpf: input.cpf,
      rg: input.rg,
      email: input.email,
      mobilePhone: input.mobilePhone,
      whatsappPhone: input.whatsappPhone ?? input.mobilePhone,
      chartNumber: input.chartNumber,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      notes: input.notes
    }
  });

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
    createdAt: patient.createdAt.toISOString()
  };
}
