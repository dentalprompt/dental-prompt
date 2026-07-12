export type ServicePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ServiceCardView = {
  id: string;
  title: string;
  description: string;
  patientId: string | null;
  patientName: string;
  professionalId: string | null;
  professionalName: string;
  priority: ServicePriority;
  dueDate: string | null;
};

export type ServiceColumnView = {
  id: string;
  name: string;
  color: string;
  position: number;
  cards: ServiceCardView[];
};

export type ServiceBoardView = {
  id: string;
  name: string;
  description: string;
  columns: ServiceColumnView[];
};

export type CreateServiceCardInput = {
  title: string;
  description: string;
  patientId?: string;
  professionalId?: string;
  priority: ServicePriority;
  dueDate?: string;
  columnId: string;
};

export type UpdateServiceCardInput = CreateServiceCardInput;

export type ServiceBoardFilters = {
  search?: string;
  patientId?: string;
  professionalId?: string;
  priority?: ServicePriority;
  columnId?: string;
};
