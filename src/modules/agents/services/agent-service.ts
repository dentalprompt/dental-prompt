import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { mockAgents } from "@/modules/agents/data/mock-agents";
import type { AgentListItem, CreateAgentInput, UpdateAgentInput } from "@/modules/agents/types/agent";

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

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return [];
  }

  const agents = await prisma.agent.findMany({
    where: {
      tenantId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { whatsappNumber: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
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

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado para criar agente.");
  }

  const agent = await prisma.agent.create({
    data: {
      tenantId,
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

export async function updateAgent(id: string, input: UpdateAgentInput): Promise<AgentListItem | null> {
  if (!process.env.DATABASE_URL) {
    const agent = mockAgents.find((item) => item.id === id);

    if (!agent) {
      return null;
    }

    return {
      ...agent,
      name: input.name,
      description: input.description ?? null,
      whatsappNumber: input.whatsappNumber,
      model: input.model,
      temperature: input.temperature,
      status: input.status ?? "DRAFT"
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const existingAgent = await prisma.agent.findUnique({
    where: {
      id
    },
    select: {
      tenantId: true
    }
  });

  if (!existingAgent || existingAgent.tenantId !== tenantId) {
    return null;
  }

  const agent = await prisma.agent.update({
    where: {
      id
    },
    data: {
      name: input.name,
      description: input.description || null,
      whatsappNumber: input.whatsappNumber,
      model: input.model,
      temperature: input.temperature,
      promptBase: input.promptBase,
      initialMessage: input.initialMessage || null,
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
