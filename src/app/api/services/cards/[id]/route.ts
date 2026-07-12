import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { createServiceCardSchema } from "@/modules/services/schemas/service-schema";
import { deleteServiceCard, moveServiceCard, updateServiceCard } from "@/modules/services/services/service-board-service";

const moveServiceCardSchema = z.object({
  columnId: z.string().min(1, "Informe a coluna de destino.")
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const resolvedParams = await params;
  const body = await request.json();
  const values = moveServiceCardSchema.parse(body);
  const card = await moveServiceCard(resolvedParams.id, values.columnId);

  return NextResponse.json(card);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const resolvedParams = await params;
  const body = await request.json();
  const values = createServiceCardSchema.parse(body);
  const card = await updateServiceCard(resolvedParams.id, values);

  if (!card) {
    return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const resolvedParams = await params;
  const result = await deleteServiceCard(resolvedParams.id);

  if (!result) {
    return NextResponse.json({ message: "Servico nao encontrado." }, { status: 404 });
  }

  return NextResponse.json(result);
}
