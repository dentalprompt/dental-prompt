import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createFinancialAccount, listFinancialAccounts } from "@/modules/settings/services/settings-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const data = await listFinancialAccounts();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const data = await createFinancialAccount({
      name: body.name ?? "",
      bank: body.bank ?? "",
      agency: body.agency ?? "",
      account: body.account ?? "",
      type: body.type ?? "",
      initialBalance: Number(body.initialBalance ?? 0)
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar a conta financeira." }, { status: 400 });
  }
}
