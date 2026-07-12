import { z } from "zod";

export const updateClinicSettingsSchema = z.object({
  clinicName: z.string().min(2, "Informe o nome da clinica."),
  legalName: z.string().optional(),
  email: z.string().email("Informe um e-mail valido.").or(z.literal("")).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  logoUrl: z.string().url("Informe uma URL valida.").or(z.literal("")).optional(),
  primaryColor: z.string().min(4, "Informe a cor principal."),
  secondaryColor: z.string().min(4, "Informe a cor secundaria.")
});

export type UpdateClinicSettingsFormValues = z.infer<typeof updateClinicSettingsSchema>;
