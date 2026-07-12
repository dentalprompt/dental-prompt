import { z } from "zod";

export const createAgentSchema = z.object({
  name: z.string().min(2, "Informe o nome do agente."),
  description: z.string().optional(),
  whatsappNumber: z.string().min(8, "Informe um numero valido."),
  model: z.string().min(1, "Informe o modelo."),
  temperature: z.coerce.number().min(0).max(1.5),
  promptBase: z.string().min(10, "Informe um prompt base minimamente descritivo."),
  initialMessage: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"]).optional()
});

export type CreateAgentFormValues = z.infer<typeof createAgentSchema>;
