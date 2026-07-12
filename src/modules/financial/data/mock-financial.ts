import type { FinancialEntryItem } from "@/modules/financial/types/financial";

export const mockFinancialEntries: FinancialEntryItem[] = [
  {
    id: "fin_1",
    description: "Entrada clareamento supervisionado",
    patientName: "Mariana Carvalho de Lima",
    professionalName: "Dra. Camila Borges",
    category: "Tratamento",
    paymentMethod: "Cartao",
    amount: 1800,
    status: "PAID",
    type: "INCOME",
    date: "2026-07-10T10:00:00.000Z",
    dueDate: "2026-07-10T10:00:00.000Z"
  },
  {
    id: "fin_2",
    description: "Parcela ortodontia",
    patientName: "Carlos Eduardo Tavares",
    professionalName: "Dr. Thiago Salles",
    category: "Mensalidade",
    paymentMethod: "PIX",
    amount: 260,
    status: "PENDING",
    type: "INCOME",
    date: "2026-07-12T09:00:00.000Z",
    dueDate: "2026-07-18T09:00:00.000Z"
  },
  {
    id: "fin_3",
    description: "Compra de materiais clinicos",
    patientName: null,
    professionalName: null,
    category: "Insumos",
    paymentMethod: "Boleto",
    amount: 640,
    status: "PAID",
    type: "EXPENSE",
    date: "2026-07-09T11:00:00.000Z",
    dueDate: "2026-07-09T11:00:00.000Z"
  },
  {
    id: "fin_4",
    description: "Manutencao de compressor",
    patientName: null,
    professionalName: null,
    category: "Manutencao",
    paymentMethod: "Transferencia",
    amount: 390,
    status: "SCHEDULED",
    type: "EXPENSE",
    date: "2026-07-12T13:00:00.000Z",
    dueDate: "2026-07-20T13:00:00.000Z"
  }
];
