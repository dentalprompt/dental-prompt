export type AgentListItem = {
  id: string;
  name: string;
  description: string | null;
  whatsappNumber: string;
  model: string;
  temperature: number;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
};

export type CreateAgentInput = {
  name: string;
  description?: string;
  whatsappNumber: string;
  model: string;
  temperature: number;
  promptBase: string;
  initialMessage?: string;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
};

export type UpdateAgentInput = CreateAgentInput;
