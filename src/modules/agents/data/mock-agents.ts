import type { AgentListItem } from "@/modules/agents/types/agent";

export const mockAgents: AgentListItem[] = [
  {
    id: "agent_1",
    name: "Recepcionista IA",
    description: "Atendimento inicial e confirmacao de agenda.",
    whatsappNumber: "5511999990001",
    model: "gpt-4o-mini",
    temperature: 0.3,
    status: "ACTIVE"
  },
  {
    id: "agent_2",
    name: "Comercial IA",
    description: "Qualificacao e conversao de novos pacientes.",
    whatsappNumber: "5511999990002",
    model: "gpt-4o-mini",
    temperature: 0.5,
    status: "DRAFT"
  }
];
