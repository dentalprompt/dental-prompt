import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";

import { recordAuditLog } from "@/lib/audit/audit-log";
import { getRequestSession } from "@/lib/auth/request-session";
import { createFinancialEntrySchema } from "@/modules/financial/schemas/financial-schema";
import { createFinancialEntry, listFinancialEntries } from "@/modules/financial/services/financial-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const status = searchParams.get("status") as
    | "PENDING"
    | "PAID"
    | "OVERDUE"
    | "CANCELED"
    | "SCHEDULED"
    | null;
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const entries = await listFinancialEntries({
    type: type ?? undefined,
    status: status ?? undefined,
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined
  });

  return NextResponse.json({ data: entries });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const values = createFinancialEntrySchema.parse(body);
    const entry = await createFinancialEntry(values);
    await recordAuditLog({
      session,
      request,
      module: "financial",
      action: AuditAction.CREATE,
      recordType: "FinancialEntry",
      recordId: entry.id,
      next: entry
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel criar o lancamento financeiro." },
      { status: 400 }
    );
  }
}
