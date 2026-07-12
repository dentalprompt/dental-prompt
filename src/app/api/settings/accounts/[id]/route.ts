import { NextResponse } from "next/server";

import { deleteFinancialAccount, toggleFinancialAccount } from "@/modules/settings/services/settings-service";

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await toggleFinancialAccount(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar a conta." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteFinancialAccount(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover a conta." }, { status: 400 });
  }
}
