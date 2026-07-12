import type { PatientDetail } from "@/modules/patients/types/patient-detail";

export const mockPatientDetails: Record<string, PatientDetail> = {
  pat_1: {
    id: "pat_1",
    fullName: "Mariana Carvalho de Lima",
    chartNumber: "PC-00018",
    cpf: "092.114.330-19",
    mobilePhone: "(11) 99876-4231",
    whatsappPhone: "(11) 99876-4231",
    email: "mariana.lima@email.com",
    birthDate: "1990-05-12",
    status: "IN_TREATMENT",
    plan: "Particular Premium",
    responsibleProfessional: "Dra. Camila Borges",
    lastAppointment: "2026-07-08T14:00:00.000Z",
    nextAppointment: "2026-07-19T10:30:00.000Z",
    notes: "Paciente com foco em reabilitacao estetica e alinhamento funcional.",
    budgets: [
      {
        id: "bud_1",
        number: "ORC-2026-0018",
        date: "2026-07-01",
        professional: "Dra. Camila Borges",
        plan: "Particular Premium",
        value: 5200,
        finalValue: 4800,
        status: "APPROVED"
      },
      {
        id: "bud_2",
        number: "ORC-2026-0027",
        date: "2026-07-10",
        professional: "Dr. Thiago Salles",
        plan: "Particular Premium",
        value: 1800,
        finalValue: 1800,
        status: "SENT"
      }
    ],
    treatments: [
      {
        id: "trt_1",
        procedure: "Clareamento dental supervisionado",
        tooth: "Arcada completa",
        face: "-",
        professional: "Dra. Camila Borges",
        status: "IN_PROGRESS",
        updatedAt: "2026-07-09T09:00:00.000Z"
      },
      {
        id: "trt_2",
        procedure: "Resina composta",
        tooth: "11",
        face: "Vestibular",
        professional: "Dr. Thiago Salles",
        status: "PLANNED",
        updatedAt: "2026-07-10T11:20:00.000Z"
      }
    ],
    evolutions: [
      {
        id: "ev_1",
        professional: "Dra. Camila Borges",
        description: "Paciente apresentou boa adaptacao ao plano inicial e respondeu bem ao protocolo caseiro.",
        createdAt: "2026-07-08T14:40:00.000Z"
      }
    ],
    anamnesisSummary: [
      "Sem alergias medicamentosas relatadas.",
      "Sem historico de diabetes ou hipertensao.",
      "Relata sensibilidade dentaria moderada."
    ],
    images: [
      {
        id: "img_1",
        name: "Panoramica julho 2026",
        type: "Radiografia",
        createdAt: "2026-07-03T12:00:00.000Z"
      }
    ],
    documents: [
      {
        id: "doc_1",
        name: "Contrato de tratamento",
        type: "PDF",
        createdAt: "2026-07-01T15:10:00.000Z"
      }
    ],
    debts: [
      {
        id: "debt_1",
        description: "Parcela 2 de 4 - clareamento",
        dueDate: "2026-07-20",
        amount: 1200,
        status: "PENDING"
      }
    ]
  }
};
