import { NextResponse } from "next/server";

import { deleteContractTemplate, toggleContractTemplate } from "@/modules/settings/services/settings-service";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await toggleContractTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o contrato." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteContractTemplate(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover o contrato." }, { status: 400 });
  }
}
