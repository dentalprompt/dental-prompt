import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(2, "Informe o nome do plano."),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  isInsurance: z.boolean().optional()
});

export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;

export const updateProcedureSchema = z.object({
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  isActive: z.boolean(),
  usesToothFaces: z.boolean(),
  notes: z.string().optional()
});

export type UpdateProcedureFormValues = z.infer<typeof updateProcedureSchema>;
