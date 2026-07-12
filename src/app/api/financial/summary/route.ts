import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { getFinancialSummary } from "@/modules/financial/services/financial-service";

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

  const summary = await getFinancialSummary({
    type: type ?? undefined,
    status: status ?? undefined,
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined
  });

  return NextResponse.json({ data: summary });
}
