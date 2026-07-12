import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createAgentSchema } from "@/modules/agents/schemas/agent-schema";
import { createAgent, listAgents } from "@/modules/agents/services/agent-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const agents = await listAgents(q);

  return NextResponse.json({ data: agents });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const values = createAgentSchema.parse(body);
    const agent = await createAgent(values);

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel criar o agente com os dados enviados." },
      { status: 400 }
    );
  }
}
