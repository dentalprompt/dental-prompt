import { NextResponse } from "next/server";

import { deleteAnamnesisTemplate, toggleAnamnesisTemplate } from "@/modules/settings/services/settings-service";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await toggleAnamnesisTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o modelo." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteAnamnesisTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover o modelo." }, { status: 400 });
  }
}
