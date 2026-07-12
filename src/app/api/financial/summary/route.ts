import { NextResponse } from "next/server";

import { getFinancialSummary } from "@/modules/financial/services/financial-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const status = searchParams.get("status") as
    | "PENDING"
    | "PAID"
    | "OVERDUE"
    | "CANCELED"
    | "SCHEDULED"
    | null;

  const summary = await getFinancialSummary({
    type: type ?? undefined,
    status: status ?? undefined
  });

  return NextResponse.json({ data: summary });
}
