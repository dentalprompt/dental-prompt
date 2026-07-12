import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { deleteChair, toggleChair, updateChairItem } from "@/modules/settings/services/settings-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await toggleChair(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar a cadeira." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await deleteChair(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover a cadeira." }, { status: 400 });
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
    const data = await updateChairItem(id, {
      name: body.name ?? "",
      code: body.code ?? "",
      room: body.room ?? "",
      color: body.color ?? "",
      notes: body.notes ?? ""
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar a cadeira." }, { status: 400 });
  }
}
