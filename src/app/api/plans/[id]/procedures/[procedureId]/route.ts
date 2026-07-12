import { NextResponse } from "next/server";

import { updateProcedureSchema } from "@/modules/plans/schemas/plan-schema";
import { updatePlanProcedure } from "@/modules/plans/services/plan-service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; procedureId: string }> }
) {
  try {
    const { id, procedureId } = await params;
    const body = await request.json();
    const values = updateProcedureSchema.parse(body);
    const procedure = await updatePlanProcedure(id, procedureId, values);

    if (!procedure) {
      return NextResponse.json({ message: "Procedimento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: procedure });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel atualizar o procedimento." },
      { status: 400 }
    );
  }
}
