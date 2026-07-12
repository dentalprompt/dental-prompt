import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createPlanSchema } from "@/modules/plans/schemas/plan-schema";
import { createPlan, listPlans } from "@/modules/plans/services/plan-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const plans = await listPlans(q);

  return NextResponse.json({ data: plans });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const values = createPlanSchema.parse(body);
    const plan = await createPlan(values);

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel criar o plano com os dados enviados." },
      { status: 400 }
    );
  }
}
