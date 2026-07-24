import { z } from "zod";

export const updateZApiSettingsSchema = z.object({
  apiBaseUrl: z.string().url("Informe uma URL valida para a API da instância.").or(z.literal("")),
  instanceId: z.string().min(1, "Informe o Instance ID da Z-API."),
  instanceToken: z.string().min(1, "Informe o token da instância."),
  clientToken: z.string().min(1, "Informe o Client-Token da Z-API."),
  whatsappNumber: z.string().min(8, "Informe o numero do WhatsApp.").or(z.literal(""))
});

export const zApiActionSchema = z.object({
  action: z.enum(["refresh-qrcode", "sync-webhooks", "disconnect", "refresh-status"])
});

export type UpdateZApiSettingsFormValues = z.infer<typeof updateZApiSettingsSchema>;
export type ZApiActionFormValues = z.infer<typeof zApiActionSchema>;
