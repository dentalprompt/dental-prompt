import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { savePatientFile } from "@/lib/files/patient-file-storage";

const uploadSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  category: z.enum(["IMAGE", "DOCUMENT"]),
  base64Content: z.string().min(1)
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ data: [] });
  }

  const tenantId = await resolveTenantId();
  const { id } = await params;

  if (!tenantId) {
    return NextResponse.json({ data: [] });
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    select: { tenantId: true }
  });

  if (!patient || patient.tenantId !== tenantId) {
    return NextResponse.json({ message: "Paciente nao encontrado." }, { status: 404 });
  }

  const files = await prisma.patientFile.findMany({
    where: {
      tenantId,
      patientId: id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({
    data: files.map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      category: file.category,
      url: file.url,
      createdAt: file.createdAt.toISOString()
    }))
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ message: "Upload requer banco configurado." }, { status: 400 });
    }

    const tenantId = await resolveTenantId();
    const { id } = await params;

    if (!tenantId) {
      return NextResponse.json({ message: "Tenant invalido." }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { tenantId: true }
    });

    if (!patient || patient.tenantId !== tenantId) {
      return NextResponse.json({ message: "Paciente nao encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const values = uploadSchema.parse(body);
    const file = await savePatientFile({
      patientId: id,
      fileName: values.name,
      base64Content: values.base64Content
    });

    const created = await prisma.patientFile.create({
      data: {
        tenantId,
        patientId: id,
        name: values.name,
        type: values.type,
        category: values.category,
        url: file.publicUrl
      }
    });

    return NextResponse.json(
      {
        data: {
          id: created.id,
          name: created.name,
          type: created.type,
          category: created.category,
          url: created.url,
          createdAt: created.createdAt.toISOString()
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Nao foi possivel enviar o arquivo." }, { status: 400 });
  }
}
