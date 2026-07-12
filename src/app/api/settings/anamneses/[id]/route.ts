import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import {
  deleteAnamnesisTemplate,
  toggleAnamnesisTemplate,
  updateAnamnesisTemplate
} from "@/modules/settings/services/settings-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await toggleAnamnesisTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o modelo." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await deleteAnamnesisTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover o modelo." }, { status: 400 });
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
    const data = await updateAnamnesisTemplate(id, {
      name: body.name ?? "",
      description: body.description ?? "",
      specialty: body.specialty ?? ""
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o modelo de anamnese." }, { status: 400 });
  }
}
