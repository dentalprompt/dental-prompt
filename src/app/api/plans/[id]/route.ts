import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { getPlanDetail } from "@/modules/plans/services/plan-service";

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
