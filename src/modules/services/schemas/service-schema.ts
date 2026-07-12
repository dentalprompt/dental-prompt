import { z } from "zod";

export const createServiceCardSchema = z.object({
  title: z.string().min(3, "Informe o tratamento ou servico."),
  description: z.string().min(3, "Informe a descricao do servico."),
  patientId: z.string().optional(),
  professionalId: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
  columnId: z.string().min(1, "Selecione o Kanban inicial.")
});

export type CreateServiceCardFormValues = z.infer<typeof createServiceCardSchema>;
