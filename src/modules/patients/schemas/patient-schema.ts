import { z } from "zod";

export const createPatientSchema = z.object({
  fullName: z.string().min(3, "Informe o nome completo do paciente."),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  email: z.string().email("Informe um e-mail valido.").optional().or(z.literal("")),
  mobilePhone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  birthDate: z.string().optional(),
  chartNumber: z.string().optional(),
  notes: z.string().optional()
});

export type CreatePatientFormValues = z.infer<typeof createPatientSchema>;
