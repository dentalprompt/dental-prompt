import { prisma } from "@/lib/db/prisma";
import { mockAgents } from "@/modules/agents/data/mock-agents";
import type { AgentListItem, CreateAgentInput } from "@/modules/agents/types/agent";

export async function listAgents(search?: string): Promise<AgentListItem[]> {
  if (!process.env.DATABASE_URL) {
    if (!search) {
      return mockAgents;
    }

    const term = search.toLowerCase();
    return mockAgents.filter((agent) =>
      [agent.name, agent.description, agent.whatsappNumber, agent.model]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }

  const agents = await prisma.agent.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { whatsappNumber: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: {
      createdAt: "desc"
    }
  });

  return agents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    whatsappNumber: agent.whatsappNumber,
    model: agent.model,
    temperature: agent.temperature,
    status: agent.status
  }));
}

export async function createAgent(input: CreateAgentInput): Promise<AgentListItem> {
  if (!process.env.DATABASE_URL) {
    return {
      id: `mock_agent_${Date.now()}`,
      name: input.name,
      description: input.description ?? null,
      whatsappNumber: input.whatsappNumber,
      model: input.model,
      temperature: input.temperature,
      status: input.status ?? "DRAFT"
    };
  }

  const tenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!tenant) {
    throw new Error("Tenant nao encontrado para criar agente.");
  }

  const agent = await prisma.agent.create({
    data: {
      tenantId: tenant.id,
      name: input.name,
      description: input.description,
      whatsappNumber: input.whatsappNumber,
      model: input.model,
      temperature: input.temperature,
      promptBase: input.promptBase,
      initialMessage: input.initialMessage,
      status: input.status ?? "DRAFT"
    }
  });

  return {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    whatsappNumber: agent.whatsappNumber,
    model: agent.model,
    temperature: agent.temperature,
    status: agent.status
  };
}
