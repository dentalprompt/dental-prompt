import { NextResponse } from "next/server";

import { getPlanDetail } from "@/modules/plans/services/plan-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plan = await getPlanDetail(id);

  if (!plan) {
    return NextResponse.json({ message: "Plano nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: plan });
}
