import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createProcedureSchema } from "@/modules/plans/schemas/plan-schema";
import { createPlanProcedure } from "@/modules/plans/services/plan-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = createProcedureSchema.parse(body);
    const procedure = await createPlanProcedure(id, values);

    if (!procedure) {
      return NextResponse.json({ message: "Plano nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: procedure }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel criar o procedimento." }, { status: 400 });
  }
}
