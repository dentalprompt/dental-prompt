import type { ProfessionalListItem } from "@/modules/team/types/professional";

export const mockProfessionals: ProfessionalListItem[] = [
  {
    id: "pro_1",
    name: "Dra. Camila Borges",
    specialty: "Dentistica",
    roleLabel: "Dentista",
    email: "camila@dentalprompt.com",
    phone: "(11) 98888-1001",
    isActive: true
  },
  {
    id: "pro_2",
    name: "Dr. Thiago Salles",
    specialty: "Ortodontia",
    roleLabel: "Dentista",
    email: "thiago@dentalprompt.com",
    phone: "(11) 98888-1002",
    isActive: true
  },
  {
    id: "pro_3",
    name: "Dra. Renata Paiva",
    specialty: "Implantodontia",
    roleLabel: "Dentista",
    email: "renata@dentalprompt.com",
    phone: "(11) 98888-1003",
    isActive: true
  }
];
