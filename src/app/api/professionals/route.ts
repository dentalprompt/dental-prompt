import { NextResponse } from "next/server";

import { listProfessionals } from "@/modules/team/services/professional-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const professionals = await listProfessionals(q);

  return NextResponse.json({ data: professionals });
}
