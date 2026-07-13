import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { parseDynamicTemplateFields } from "@/lib/templates/dynamic-form";

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

  const template = await prisma.anamnesisTemplate.findUnique({
    where: { id }
  });

  if (!template || template.tenantId !== tenantId) {
    return NextResponse.json({ message: "Modelo nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    data: parseDynamicTemplateFields(template.description)
  });
}
