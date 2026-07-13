import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { buildDynamicSummary, parseDynamicTemplateFields } from "@/lib/templates/dynamic-form";

const submitAnamnesisSchema = z.object({
  templateId: z.string().min(1),
  answers: z.record(z.unknown())
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: "Envio de anamnese requer banco configurado." }, { status: 400 });
    }

    const tenantId = await resolveTenantId();
    const { id } = await params;

    if (!tenantId) {
      return NextResponse.json({ message: "Tenant invalido." }, { status: 400 });
    }

    const body = await request.json();
    const values = submitAnamnesisSchema.parse(body);

    const [patient, template] = await Promise.all([
      prisma.patient.findUnique({
        where: { id },
        select: { id: true, tenantId: true }
      }),
      prisma.anamnesisTemplate.findUnique({
        where: { id: values.templateId }
      })
    ]);

    if (!patient || patient.tenantId !== tenantId || !template || template.tenantId !== tenantId) {
      return NextResponse.json({ message: "Paciente ou modelo nao encontrado." }, { status: 404 });
    }

    const fields = parseDynamicTemplateFields(template.description);
    const summary = buildDynamicSummary(fields, values.answers);

    const created = await prisma.patientAnamnesis.create({
      data: {
        tenantId,
        patientId: patient.id,
        templateId: template.id,
        summary
      }
    });

    return NextResponse.json({
      data: {
        id: created.id,
        summary,
        fields
      }
    });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar a anamnese." }, { status: 400 });
  }
}
