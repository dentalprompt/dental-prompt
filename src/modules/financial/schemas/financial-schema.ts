import { z } from "zod";

export const createFinancialEntrySchema = z.object({
  description: z.string().min(3, "Informe a descricao do lancamento."),
  patientId: z.string().optional(),
  professionalId: z.string().optional(),
  category: z.string().min(2, "Informe a categoria."),
  paymentMethod: z.string().min(2, "Informe a forma de pagamento."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  dueDate: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELED", "SCHEDULED"]).optional()
});

export type CreateFinancialEntryFormValues = z.infer<typeof createFinancialEntrySchema>;
