import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ message: "Exportacao requer banco configurado." }, { status: 400 });
  }

  const tenantId = await resolveTenantId();
  const { id } = await params;

  if (!tenantId) {
    return NextResponse.json({ message: "Tenant invalido." }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      plan: true,
      appointments: {
        include: {
          professional: true
        }
      },
      conversations: {
        include: {
          messages: true
        }
      },
      financialItems: true,
      budgets: {
        include: {
          professional: true,
          plan: true
        }
      },
      treatments: {
        include: {
          professional: true,
          evolutions: {
            include: {
              professional: true
            }
          }
        }
      },
      anamneses: true,
      files: true
    }
  });

  if (!patient || patient.tenantId !== tenantId) {
    return NextResponse.json({ message: "Paciente nao encontrado." }, { status: 404 });
  }

  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), patient }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="paciente-${patient.id}.json"`
    }
  });
}
