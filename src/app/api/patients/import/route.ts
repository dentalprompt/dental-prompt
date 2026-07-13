import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { createPatient } from "@/modules/patients/services/patient-service";

const importSchema = z.object({
  fileName: z.string().min(1),
  base64Content: z.string().min(1)
});

function normalizeOptional(value: unknown) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const values = importSchema.parse(body);
    const buffer = Buffer.from(values.base64Content, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json({ message: "Arquivo sem planilha valida." }, { status: 400 });
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], {
      defval: ""
    });

    const created = [];

    for (const row of rows) {
      const fullName =
        normalizeOptional(row.fullName) ||
        normalizeOptional(row.nome) ||
        normalizeOptional(row["Nome"]) ||
        normalizeOptional(row["nome_completo"]);

      if (!fullName) {
        continue;
      }

      const patient = await createPatient({
        fullName,
        cpf: normalizeOptional(row.cpf || row.CPF),
        rg: normalizeOptional(row.rg || row.RG),
        email: normalizeOptional(row.email || row["E-mail"] || row["email"]),
        mobilePhone: normalizeOptional(row.mobilePhone || row.celular || row["Celular"]),
        whatsappPhone: normalizeOptional(row.whatsappPhone || row.whatsapp || row["WhatsApp"]),
        birthDate: normalizeOptional(row.birthDate || row.nascimento || row["Nascimento"]),
        chartNumber: normalizeOptional(row.chartNumber || row.prontuario || row["Prontuario"]),
        notes: normalizeOptional(row.notes || row.observacoes || row["Observacoes"])
      });

      created.push(patient);
    }

    return NextResponse.json({
      data: {
        imported: created.length,
        patients: created
      }
    });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel importar os pacientes." }, { status: 400 });
  }
}
