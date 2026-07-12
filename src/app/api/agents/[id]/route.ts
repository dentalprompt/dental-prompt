import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createAgentSchema } from "@/modules/agents/schemas/agent-schema";
import { updateAgent } from "@/modules/agents/services/agent-service";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = createAgentSchema.parse(body);
    const agent = await updateAgent(id, values);

    if (!agent) {
      return NextResponse.json({ message: "Agente nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: agent });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o agente." }, { status: 400 });
  }
}
