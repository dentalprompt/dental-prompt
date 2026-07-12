import type { AppointmentListItem } from "@/modules/appointments/types/appointment";

export const mockAppointments: AppointmentListItem[] = [
  {
    id: "app_1",
    title: "Avaliacao inicial",
    startsAt: "2026-07-12T09:00:00.000Z",
    endsAt: "2026-07-12T09:40:00.000Z",
    status: "CONFIRMED",
    patient: {
      id: "pat_1",
      fullName: "Mariana Carvalho de Lima"
    },
    professional: {
      id: "pro_1",
      name: "Dra. Camila Borges",
      specialty: "Dentistica"
    },
    notes: "Paciente deseja revisar plano estetico."
  },
  {
    id: "app_2",
    title: "Manutencao ortodontica",
    startsAt: "2026-07-12T10:30:00.000Z",
    endsAt: "2026-07-12T11:00:00.000Z",
    status: "SCHEDULED",
    patient: {
      id: "pat_2",
      fullName: "Carlos Eduardo Tavares"
    },
    professional: {
      id: "pro_2",
      name: "Dr. Thiago Salles",
      specialty: "Ortodontia"
    },
    notes: null
  },
  {
    id: "app_3",
    title: "Consulta de retorno",
    startsAt: "2026-07-12T14:00:00.000Z",
    endsAt: "2026-07-12T14:30:00.000Z",
    status: "RETURN",
    patient: {
      id: "pat_4",
      fullName: "Rafael Gomes Pereira"
    },
    professional: {
      id: "pro_3",
      name: "Dra. Renata Paiva",
      specialty: "Implantodontia"
    },
    notes: "Retorno pos-procedimento."
  }
];
