import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createContractTemplate, listContractTemplates } from "@/modules/settings/services/settings-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const data = await listContractTemplates();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const data = await createContractTemplate({
      name: body.name ?? "",
      description: body.description ?? "",
      category: body.category ?? "",
      content: body.content ?? ""
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar o contrato." }, { status: 400 });
  }
}
