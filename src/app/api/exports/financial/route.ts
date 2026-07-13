import { NextResponse } from "next/server";

import {
  buildCsv,
  buildPdf,
  buildXlsx,
  getContentType,
  getFileExtension,
  type ExportFormat
} from "@/lib/exports/report-export";
import { getRequestSession } from "@/lib/auth/request-session";
import { listFinancialEntries } from "@/modules/financial/services/financial-service";

const allowedFormats = new Set<ExportFormat>(["csv", "xlsx", "pdf"]);

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "csv") as ExportFormat;

  if (!allowedFormats.has(format)) {
    return NextResponse.json({ message: "Formato de exportacao invalido." }, { status: 400 });
  }

  const entries = await listFinancialEntries({
    type: (searchParams.get("type") as "INCOME" | "EXPENSE" | null) ?? undefined,
    status:
      (searchParams.get("status") as "PENDING" | "PAID" | "OVERDUE" | "CANCELED" | "SCHEDULED" | null) ?? undefined,
    year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
    month: searchParams.get("month") ? Number(searchParams.get("month")) : undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined
  });

  const rows = entries.map((entry) => ({
    descricao: entry.description,
    tipo: entry.type,
    status: entry.status,
    categoria: entry.category,
    metodo: entry.paymentMethod,
    valor: entry.amount.toFixed(2),
    paciente: entry.patientName ?? "",
    profissional: entry.professionalName ?? "",
    data: entry.date.slice(0, 10),
    vencimento: entry.dueDate?.slice(0, 10) ?? ""
  }));

  const columns = [
    { key: "descricao", label: "Descricao" },
    { key: "tipo", label: "Tipo" },
    { key: "status", label: "Status" },
    { key: "categoria", label: "Categoria" },
    { key: "metodo", label: "Pagamento" },
    { key: "valor", label: "Valor" },
    { key: "paciente", label: "Paciente" },
    { key: "profissional", label: "Profissional" },
    { key: "data", label: "Data" },
    { key: "vencimento", label: "Vencimento" }
  ] as const;

  let payload: string | Uint8Array;

  if (format === "csv") {
    payload = buildCsv(rows, columns);
  } else if (format === "xlsx") {
    payload = new Uint8Array(buildXlsx(rows, columns));
  } else {
    payload = new Uint8Array(await buildPdf("Relatorio Financeiro", rows, columns));
  }

  const body = typeof payload === "string" ? payload : new Blob([Uint8Array.from(payload)]);

  return new Response(body, {
    headers: {
      "Content-Type": getContentType(format),
      "Content-Disposition": `attachment; filename="financeiro.${getFileExtension(format)}"`
    }
  });
}
