import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { listProfessionals } from "@/modules/team/services/professional-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const professionals = await listProfessionals(q);

  return NextResponse.json({ data: professionals });
}
