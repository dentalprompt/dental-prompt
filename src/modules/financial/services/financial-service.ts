import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { mockFinancialEntries } from "@/modules/financial/data/mock-financial";
import type {
  CreateFinancialEntryInput,
  FinancialEntryItem,
  FinancialSummary
} from "@/modules/financial/types/financial";

type FinancialFilters = {
  type?: "INCOME" | "EXPENSE";
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "SCHEDULED";
};

function applyMockFilters(entries: FinancialEntryItem[], filters: FinancialFilters) {
  return entries.filter((entry) => {
    if (filters.type && entry.type !== filters.type) return false;
    if (filters.status && entry.status !== filters.status) return false;
    return true;
  });
}

function getSummary(entries: FinancialEntryItem[]): FinancialSummary {
  const income = entries.filter((entry) => entry.type === "INCOME").reduce((sum, entry) => sum + entry.amount, 0);
  const expense = entries.filter((entry) => entry.type === "EXPENSE").reduce((sum, entry) => sum + entry.amount, 0);

  return {
    income,
    expense,
    balance: income - expense
  };
}

export async function listFinancialEntries(filters: FinancialFilters = {}): Promise<FinancialEntryItem[]> {
  if (!process.env.DATABASE_URL) {
    return applyMockFilters(mockFinancialEntries, filters);
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return [];
  }

  const entries = await prisma.financialEntry.findMany({
    where: {
      tenantId,
      type: filters.type,
      status: filters.status
    },
    include: {
      patient: true,
      professional: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return entries.map((entry) => ({
    id: entry.id,
    description: entry.description,
    patientName: entry.patient?.fullName ?? null,
    professionalName: entry.professional?.name ?? null,
    category: entry.category,
    paymentMethod: entry.paymentMethod,
    amount: Number(entry.amount),
    status: entry.status,
    type: entry.type,
    date: entry.createdAt.toISOString(),
    dueDate: entry.dueDate?.toISOString() ?? null
  }));
}

export async function getFinancialSummary(filters: FinancialFilters = {}): Promise<FinancialSummary> {
  const entries = await listFinancialEntries(filters);
  return getSummary(entries);
}

export async function createFinancialEntry(input: CreateFinancialEntryInput): Promise<FinancialEntryItem> {
  if (!process.env.DATABASE_URL) {
    return {
      id: `mock_fin_${Date.now()}`,
      description: input.description,
      patientName: null,
      professionalName: null,
      category: input.category,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      status: input.status ?? "PENDING",
      type: input.type,
      date: new Date().toISOString(),
      dueDate: input.dueDate ?? null
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado para criar lancamento financeiro.");
  }

  const entry = await prisma.financialEntry.create({
    data: {
      tenantId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      description: input.description,
      type: input.type,
      status: input.status ?? "PENDING",
      category: input.category,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined
    },
    include: {
      patient: true,
      professional: true
    }
  });

  return {
    id: entry.id,
    description: entry.description,
    patientName: entry.patient?.fullName ?? null,
    professionalName: entry.professional?.name ?? null,
    category: entry.category,
    paymentMethod: entry.paymentMethod,
    amount: Number(entry.amount),
    status: entry.status,
    type: entry.type,
    date: entry.createdAt.toISOString(),
    dueDate: entry.dueDate?.toISOString() ?? null
  };
}
