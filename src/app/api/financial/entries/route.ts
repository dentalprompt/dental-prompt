import { NextResponse } from "next/server";

import { createFinancialEntrySchema } from "@/modules/financial/schemas/financial-schema";
import { createFinancialEntry, listFinancialEntries } from "@/modules/financial/services/financial-service";

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

  const entries = await listFinancialEntries({
    type: type ?? undefined,
    status: status ?? undefined
  });

  return NextResponse.json({ data: entries });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = createFinancialEntrySchema.parse(body);
    const entry = await createFinancialEntry(values);

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel criar o lancamento financeiro." },
      { status: 400 }
    );
  }
}
