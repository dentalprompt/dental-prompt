import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo."),
  email: z.string().email("Informe um e-mail valido."),
  phone: z.string().min(10, "Informe um telefone valido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.")
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
