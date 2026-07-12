import type { PlanDetail, PlanListItem } from "@/modules/plans/types/plan";

export const mockPlans: PlanListItem[] = [
  {
    id: "plan_demo",
    name: "Particular Premium",
    description: "Plano particular padrao da clinica.",
    isDefault: true,
    isInsurance: false,
    isActive: true,
    proceduresCount: 6
  },
  {
    id: "plan_amil",
    name: "Amil Dental",
    description: "Tabela convenio com cobertura odontologica.",
    isDefault: false,
    isInsurance: true,
    isActive: true,
    proceduresCount: 4
  }
];

export const mockPlanDetails: Record<string, PlanDetail> = {
  plan_demo: {
    id: "plan_demo",
    name: "Particular Premium",
    description: "Plano particular padrao da clinica.",
    isDefault: true,
    isInsurance: false,
    isActive: true,
    procedures: [
      {
        id: "proc_1",
        specialty: "Dentistica",
        name: "Restauracao em resina composta",
        price: 420,
        cost: 110,
        isActive: true,
        usesToothFaces: true,
        notes: "Usado com frequencia em dentes anteriores."
      },
      {
        id: "proc_2",
        specialty: "Ortodontia",
        name: "Manutencao ortodontica",
        price: 260,
        cost: 70,
        isActive: true,
        usesToothFaces: false,
        notes: null
      },
      {
        id: "proc_3",
        specialty: "Implantodontia",
        name: "Avaliacao para implante",
        price: 350,
        cost: 95,
        isActive: true,
        usesToothFaces: false,
        notes: null
      },
      {
        id: "proc_4",
        specialty: "Dentistica",
        name: "Clareamento supervisionado",
        price: 1800,
        cost: 520,
        isActive: true,
        usesToothFaces: false,
        notes: "Pacote completo de tratamento."
      },
      {
        id: "proc_5",
        specialty: "Radiologia",
        name: "Panoramica digital",
        price: 140,
        cost: 30,
        isActive: true,
        usesToothFaces: false,
        notes: null
      },
      {
        id: "proc_6",
        specialty: "Periodontia",
        name: "Profilaxia completa",
        price: 220,
        cost: 55,
        isActive: true,
        usesToothFaces: false,
        notes: null
      }
    ]
  },
  plan_amil: {
    id: "plan_amil",
    name: "Amil Dental",
    description: "Tabela convenio com cobertura odontologica.",
    isDefault: false,
    isInsurance: true,
    isActive: true,
    procedures: [
      {
        id: "proc_amil_1",
        specialty: "Dentistica",
        name: "Consulta inicial convenio",
        price: 120,
        cost: 55,
        isActive: true,
        usesToothFaces: false,
        notes: null
      },
      {
        id: "proc_amil_2",
        specialty: "Radiologia",
        name: "Raio-x periapical",
        price: 45,
        cost: 12,
        isActive: true,
        usesToothFaces: false,
        notes: null
      },
      {
        id: "proc_amil_3",
        specialty: "Periodontia",
        name: "Raspagem supragengival",
        price: 180,
        cost: 66,
        isActive: true,
        usesToothFaces: false,
        notes: null
      },
      {
        id: "proc_amil_4",
        specialty: "Endodontia",
        name: "Urgencia endodontica",
        price: 310,
        cost: 118,
        isActive: true,
        usesToothFaces: true,
        notes: "Exige validacao por dente."
      }
    ]
  }
};
