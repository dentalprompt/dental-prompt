export type PatientBudget = {
  id: string;
  number: string;
  date: string;
  professional: string;
  plan: string;
  value: number;
  finalValue: number;
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "CANCELED" | "FINISHED";
};

export type PatientTreatment = {
  id: string;
  procedure: string;
  tooth: string;
  face: string;
  professional: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "WAITING";
  updatedAt: string;
};

export type PatientEvolution = {
  id: string;
  professional: string;
  description: string;
  createdAt: string;
};

export type PatientDocument = {
  id: string;
  name: string;
  type: string;
  createdAt: string;
};

export type PatientDebt = {
  id: string;
  description: string;
  dueDate: string;
  amount: number;
  status: "PENDING" | "OVERDUE" | "PAID";
};

export type PatientDetail = {
  id: string;
  fullName: string;
  chartNumber: string | null;
  cpf: string | null;
  mobilePhone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  birthDate: string | null;
  status: string;
  plan: string | null;
  responsibleProfessional: string | null;
  lastAppointment: string | null;
  nextAppointment: string | null;
  notes: string | null;
  budgets: PatientBudget[];
  treatments: PatientTreatment[];
  evolutions: PatientEvolution[];
  anamnesisSummary: string[];
  images: PatientDocument[];
  documents: PatientDocument[];
  debts: PatientDebt[];
};
