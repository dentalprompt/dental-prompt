import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente."),
  professionalId: z.string().min(1, "Selecione um profissional."),
  title: z.string().min(3, "Informe o procedimento ou titulo do agendamento."),
  date: z.string().min(1, "Informe a data."),
  startTime: z.string().min(1, "Informe a hora inicial."),
  endTime: z.string().min(1, "Informe a hora final."),
  notes: z.string().optional(),
  status: z
    .enum([
      "SCHEDULED",
      "CONFIRMED",
      "IN_ATTENDANCE",
      "COMPLETED",
      "CANCELED",
      "NO_SHOW",
      "RESCHEDULED",
      "WALK_IN",
      "RETURN"
    ])
    .optional()
});

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;
