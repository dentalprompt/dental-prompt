import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";

import { recordAuditLog } from "@/lib/audit/audit-log";
import { getRequestSession } from "@/lib/auth/request-session";
import { createPlanSchema } from "@/modules/plans/schemas/plan-schema";
import { getPlanDetail, updatePlan } from "@/modules/plans/services/plan-service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await params;
  const plan = await getPlanDetail(id);

  if (!plan) {
    return NextResponse.json({ message: "Plano nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: plan });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const previousPlan = await getPlanDetail(id);
    const body = await request.json();
    const values = createPlanSchema.parse(body);
    const plan = await updatePlan(id, values);

    if (!plan) {
      return NextResponse.json({ message: "Plano nao encontrado." }, { status: 404 });
    }

    await recordAuditLog({
      session,
      request,
      module: "plans",
      action: AuditAction.UPDATE,
      recordType: "Plan",
      recordId: plan.id,
      previous: previousPlan,
      next: plan
    });

    return NextResponse.json({ data: plan });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o plano." }, { status: 400 });
  }
}
