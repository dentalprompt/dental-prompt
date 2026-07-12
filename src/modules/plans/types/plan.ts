export type PlanListItem = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isInsurance: boolean;
  isActive: boolean;
  proceduresCount: number;
};

export type CreatePlanInput = {
  name: string;
  description?: string;
  isDefault?: boolean;
  isInsurance?: boolean;
};

export type UpdatePlanInput = CreatePlanInput;

export type PlanProcedureItem = {
  id: string;
  specialty: string;
  name: string;
  price: number;
  cost: number;
  isActive: boolean;
  usesToothFaces: boolean;
  notes: string | null;
};

export type PlanDetail = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isInsurance: boolean;
  isActive: boolean;
  procedures: PlanProcedureItem[];
};

export type UpdateProcedureInput = {
  price?: number;
  cost?: number;
  isActive?: boolean;
  usesToothFaces?: boolean;
  notes?: string;
};

export type CreateProcedureInput = {
  specialty: string;
  name: string;
  price: number;
  cost: number;
  isActive?: boolean;
  usesToothFaces?: boolean;
  notes?: string;
};
