export type FinancialSummary = {
  income: number;
  expense: number;
  balance: number;
};

export type FinancialEntryItem = {
  id: string;
  description: string;
  patientName: string | null;
  professionalName: string | null;
  category: string;
  paymentMethod: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "SCHEDULED";
  type: "INCOME" | "EXPENSE";
  date: string;
  dueDate: string | null;
};

export type CreateFinancialEntryInput = {
  description: string;
  patientId?: string;
  professionalId?: string;
  category: string;
  paymentMethod: string;
  amount: number;
  dueDate?: string;
  type: "INCOME" | "EXPENSE";
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "SCHEDULED";
};

export type FinancialFiltersInput = {
  type?: "INCOME" | "EXPENSE";
  status?: "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "SCHEDULED";
  year?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
};
