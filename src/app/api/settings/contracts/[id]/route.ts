import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import {
  deleteContractTemplate,
  toggleContractTemplate,
  updateContractTemplate
} from "@/modules/settings/services/settings-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await toggleContractTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o contrato." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await deleteContractTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover o contrato." }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = await updateContractTemplate(id, {
      name: body.name ?? "",
      description: body.description ?? "",
      category: body.category ?? "",
      content: body.content ?? ""
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o contrato." }, { status: 400 });
  }
}
