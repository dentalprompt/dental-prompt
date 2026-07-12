import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { moveServiceCard } from "@/modules/services/services/service-board-service";

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
