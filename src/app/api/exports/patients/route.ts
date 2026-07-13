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
import { listPatients } from "@/modules/patients/services/patient-service";

const allowedFormats = new Set<ExportFormat>(["csv", "xlsx", "pdf"]);

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "csv") as ExportFormat;
  const q = searchParams.get("q") || undefined;

  if (!allowedFormats.has(format)) {
    return NextResponse.json({ message: "Formato de exportacao invalido." }, { status: 400 });
  }

  const patients = await listPatients(q);
  const rows = patients.map((patient) => ({
    nome: patient.fullName,
    prontuario: patient.chartNumber ?? "",
    cpf: patient.cpf ?? "",
    celular: patient.mobilePhone ?? "",
    whatsapp: patient.whatsappPhone ?? "",
    email: patient.email ?? "",
    status: patient.status,
    criadoEm: patient.createdAt.slice(0, 10)
  }));

  const columns = [
    { key: "nome", label: "Nome" },
    { key: "prontuario", label: "Prontuario" },
    { key: "cpf", label: "CPF" },
    { key: "celular", label: "Celular" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "email", label: "E-mail" },
    { key: "status", label: "Status" },
    { key: "criadoEm", label: "Criado em" }
  ] as const;

  let payload: string | Uint8Array;

  if (format === "csv") {
    payload = buildCsv(rows, columns);
  } else if (format === "xlsx") {
    payload = new Uint8Array(buildXlsx(rows, columns));
  } else {
    payload = new Uint8Array(await buildPdf("Relatorio de Pacientes", rows, columns));
  }

  const body = typeof payload === "string" ? payload : new Blob([Uint8Array.from(payload)]);

  return new Response(body, {
    headers: {
      "Content-Type": getContentType(format),
      "Content-Disposition": `attachment; filename="pacientes.${getFileExtension(format)}"`
    }
  });
}
