import type { PatientListItem } from "@/modules/patients/types/patient";

export const mockPatients: PatientListItem[] = [
  {
    id: "pat_1",
    fullName: "Mariana Carvalho de Lima",
    chartNumber: "PC-00018",
    cpf: "092.114.330-19",
    mobilePhone: "(11) 99876-4231",
    whatsappPhone: "(11) 99876-4231",
    email: "mariana.lima@email.com",
    birthDate: "1990-05-12",
    status: "IN_TREATMENT",
    createdAt: "2026-06-18T10:00:00.000Z"
  },
  {
    id: "pat_2",
    fullName: "Carlos Eduardo Tavares",
    chartNumber: "PC-00019",
    cpf: "413.702.910-08",
    mobilePhone: "(21) 98765-5521",
    whatsappPhone: "(21) 98765-5521",
    email: "carlos.tavares@email.com",
    birthDate: "1984-10-02",
    status: "ACTIVE",
    createdAt: "2026-06-25T14:30:00.000Z"
  },
  {
    id: "pat_3",
    fullName: "Aline Moreira Santos",
    chartNumber: "PC-00020",
    cpf: "781.523.060-37",
    mobilePhone: "(31) 99123-1134",
    whatsappPhone: "(31) 99123-1134",
    email: "aline.moreira@email.com",
    birthDate: "1998-01-24",
    status: "LEAD",
    createdAt: "2026-07-01T09:15:00.000Z"
  },
  {
    id: "pat_4",
    fullName: "Rafael Gomes Pereira",
    chartNumber: "PC-00021",
    cpf: "014.961.180-00",
    mobilePhone: "(41) 99654-1020",
    whatsappPhone: "(41) 99654-1020",
    email: "rafael.pereira@email.com",
    birthDate: "1979-07-11",
    status: "ACTIVE",
    createdAt: "2026-07-04T16:45:00.000Z"
  }
];
