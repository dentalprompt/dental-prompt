import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { getRequestSession } from "@/lib/auth/request-session";
import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { buildPdf } from "@/lib/exports/report-export";
import { replaceContractVariables } from "@/lib/templates/dynamic-form";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "Renderizacao requer banco configurado." }, { status: 400 });
  }

  const tenantId = await resolveTenantId();
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const budgetId = searchParams.get("budgetId");
  const formatMode = searchParams.get("format") || "text";

  if (!tenantId) {
    return NextResponse.json({ message: "Tenant invalido." }, { status: 400 });
  }

  const [template, patient, budget] = await Promise.all([
    prisma.contractTemplate.findUnique({ where: { id } }),
    patientId
      ? prisma.patient.findUnique({
          where: { id: patientId },
          include: { plan: true }
        })
      : Promise.resolve(null),
    budgetId
      ? prisma.patientBudget.findUnique({
          where: { id: budgetId },
          include: {
            professional: true,
            plan: true
          }
        })
      : Promise.resolve(null)
  ]);

  if (!template || template.tenantId !== tenantId) {
    return NextResponse.json({ message: "Contrato nao encontrado." }, { status: 404 });
  }

  const rendered = replaceContractVariables(template.content, {
    nome_paciente: patient?.fullName,
    cpf_paciente: patient?.cpf,
    email_paciente: patient?.email,
    telefone_paciente: patient?.mobilePhone,
    prontuario: patient?.chartNumber,
    plano: budget?.plan?.name ?? patient?.plan?.name,
    profissional: budget?.professional?.name,
    valor: budget ? formatCurrency(Number(budget.finalValue)) : undefined,
    data: format(new Date(), "dd/MM/yyyy", { locale: ptBR }),
    clinica: session.tenantId ?? "Dental Prompt"
  });

  if (formatMode === "pdf") {
    const pdf = await buildPdf(
      template.name,
      rendered.split("\n").map((line) => ({ linha: line })),
      [{ key: "linha", label: template.name }]
    );

    return new Response(new Blob([Uint8Array.from(pdf)]), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${template.id}.pdf"`
      }
    });
  }

  return NextResponse.json({
    data: {
      id: template.id,
      name: template.name,
      rendered
    }
  });
}
