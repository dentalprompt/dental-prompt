import { z } from "zod";

export const updateZApiSettingsSchema = z.object({
  instanceId: z.string().min(1, "Informe o Instance ID da Z-API."),
  instanceToken: z.string().min(1, "Informe o token da instância."),
  clientToken: z.string().min(1, "Informe o Client-Token da Z-API.")
});

export const zApiActionSchema = z.object({
  action: z.enum(["refresh-qrcode", "sync-webhooks", "disconnect", "refresh-status"])
});

export type UpdateZApiSettingsFormValues = z.infer<typeof updateZApiSettingsSchema>;
export type ZApiActionFormValues = z.infer<typeof zApiActionSchema>;
