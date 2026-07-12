import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createFinancialEntrySchema } from "@/modules/financial/schemas/financial-schema";
import { deleteFinancialEntry, updateFinancialEntry } from "@/modules/financial/services/financial-service";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = createFinancialEntrySchema.parse(body);
    const entry = await updateFinancialEntry(id, values);

    if (!entry) {
      return NextResponse.json({ message: "Lancamento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: entry });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar o lancamento." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteFinancialEntry(id);

  if (!result) {
    return NextResponse.json({ message: "Lancamento nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(result);
}
