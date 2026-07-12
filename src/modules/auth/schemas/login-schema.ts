import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha precisa ter ao menos 8 caracteres.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
