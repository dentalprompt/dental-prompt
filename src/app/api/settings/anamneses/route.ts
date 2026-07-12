import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createAnamnesisTemplate, listAnamnesisTemplates } from "@/modules/settings/services/settings-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const data = await listAnamnesisTemplates();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const data = await createAnamnesisTemplate({
      name: body.name ?? "",
      description: body.description ?? "",
      specialty: body.specialty ?? ""
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar o modelo de anamnese." }, { status: 400 });
  }
}
