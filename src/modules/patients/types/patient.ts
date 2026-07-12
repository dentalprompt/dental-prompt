export type PatientListItem = {
  id: string;
  fullName: string;
  chartNumber: string | null;
  cpf: string | null;
  mobilePhone: string | null;
  whatsappPhone: string | null;
  email: string | null;
  birthDate: string | null;
  status: "ACTIVE" | "LEAD" | "IN_TREATMENT" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
};

export type CreatePatientInput = {
  fullName: string;
  cpf?: string;
  rg?: string;
  email?: string;
  mobilePhone?: string;
  whatsappPhone?: string;
  birthDate?: string;
  chartNumber?: string;
  notes?: string;
};
