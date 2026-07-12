import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createChair, listChairs } from "@/modules/settings/services/settings-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const data = await listChairs();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const data = await createChair({
      name: body.name ?? "",
      code: body.code ?? "",
      room: body.room ?? "",
      color: body.color ?? "",
      notes: body.notes ?? ""
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar a cadeira." }, { status: 400 });
  }
}
