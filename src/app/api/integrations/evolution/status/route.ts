import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { getEvolutionInstanceStatus } from "@/lib/integrations/evolution";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  try {
    const status = await getEvolutionInstanceStatus();
    return NextResponse.json({ data: status });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Falha ao consultar a Evolution API." },
      { status: 400 }
    );
  }
}
