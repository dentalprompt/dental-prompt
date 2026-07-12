import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import {
  deleteFinancialAccount,
  toggleFinancialAccount,
  updateFinancialAccount
} from "@/modules/settings/services/settings-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await toggleFinancialAccount(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar a conta." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    await deleteFinancialAccount(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel remover a conta." }, { status: 400 });
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
    const data = await updateFinancialAccount(id, {
      name: body.name ?? "",
      bank: body.bank ?? "",
      agency: body.agency ?? "",
      account: body.account ?? "",
      type: body.type ?? "",
      initialBalance: Number(body.initialBalance ?? 0)
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar a conta financeira." }, { status: 400 });
  }
}
