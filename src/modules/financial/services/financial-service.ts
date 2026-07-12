import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { mockFinancialEntries } from "@/modules/financial/data/mock-financial";
import type {
  CreateFinancialEntryInput,
  FinancialFiltersInput,
  FinancialEntryItem,
  FinancialSummary,
  UpdateFinancialEntryInput
} from "@/modules/financial/types/financial";

function isWithinRange(date: string, filters: FinancialFiltersInput) {
  const currentDate = new Date(date);

  if (filters.year && currentDate.getUTCFullYear() !== filters.year) {
    return false;
  }

  if (filters.month && currentDate.getUTCMonth() + 1 !== filters.month) {
    return false;
  }

  if (filters.dateFrom && currentDate < new Date(filters.dateFrom)) {
    return false;
  }

  if (filters.dateTo) {
    const endDate = new Date(filters.dateTo);
    endDate.setUTCHours(23, 59, 59, 999);

    if (currentDate > endDate) {
      return false;
    }
  }

  return true;
}

function applyMockFilters(entries: FinancialEntryItem[], filters: FinancialFiltersInput) {
  return entries.filter((entry) => {
    if (filters.type && entry.type !== filters.type) return false;
    if (filters.status && entry.status !== filters.status) return false;
    if (!isWithinRange(entry.dueDate ?? entry.date, filters)) return false;
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

export async function listFinancialEntries(filters: FinancialFiltersInput = {}): Promise<FinancialEntryItem[]> {
  if (!process.env.DATABASE_URL) {
    return applyMockFilters(mockFinancialEntries, filters);
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return [];
  }

  const createdAtFilter =
    filters.year || filters.month || filters.dateFrom || filters.dateTo
      ? {
          gte: filters.dateFrom
            ? new Date(filters.dateFrom)
            : filters.year
              ? new Date(Date.UTC(filters.year, (filters.month ?? 1) - 1, 1))
              : filters.month
                ? new Date(Date.UTC(new Date().getUTCFullYear(), filters.month - 1, 1))
                : undefined,
          lte: filters.dateTo
            ? (() => {
                const endDate = new Date(filters.dateTo);
                endDate.setUTCHours(23, 59, 59, 999);
                return endDate;
              })()
            : filters.year
              ? new Date(
                  Date.UTC(
                    filters.year,
                    filters.month ? filters.month : 12,
                    0,
                    23,
                    59,
                    59,
                    999
                  )
                )
              : filters.month
                ? new Date(Date.UTC(new Date().getUTCFullYear(), filters.month, 0, 23, 59, 59, 999))
                : undefined
        }
      : undefined;

  const entries = await prisma.financialEntry.findMany({
    where: {
      tenantId,
      type: filters.type,
      status: filters.status,
      createdAt: createdAtFilter
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

export async function getFinancialSummary(filters: FinancialFiltersInput = {}): Promise<FinancialSummary> {
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

export async function updateFinancialEntry(
  id: string,
  input: UpdateFinancialEntryInput
): Promise<FinancialEntryItem | null> {
  if (!process.env.DATABASE_URL) {
    const entry = mockFinancialEntries.find((item) => item.id === id);

    if (!entry) {
      return null;
    }

    return {
      ...entry,
      description: input.description,
      category: input.category,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      status: input.status ?? "PENDING",
      type: input.type,
      dueDate: input.dueDate ?? null
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const existingEntry = await prisma.financialEntry.findUnique({
    where: {
      id
    },
    select: {
      tenantId: true
    }
  });

  if (!existingEntry || existingEntry.tenantId !== tenantId) {
    return null;
  }

  const entry = await prisma.financialEntry.update({
    where: {
      id
    },
    data: {
      patientId: input.patientId || null,
      professionalId: input.professionalId || null,
      description: input.description,
      type: input.type,
      status: input.status ?? "PENDING",
      category: input.category,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      dueDate: input.dueDate ? new Date(input.dueDate) : null
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

export async function deleteFinancialEntry(id: string) {
  if (!process.env.DATABASE_URL) {
    return { id };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const existingEntry = await prisma.financialEntry.findUnique({
    where: {
      id
    },
    select: {
      tenantId: true
    }
  });

  if (!existingEntry || existingEntry.tenantId !== tenantId) {
    return null;
  }

  await prisma.financialEntry.delete({
    where: {
      id
    }
  });

  return { id };
}
