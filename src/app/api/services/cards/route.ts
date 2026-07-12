import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createServiceCardSchema } from "@/modules/services/schemas/service-schema";
import { createServiceCard } from "@/modules/services/services/service-board-service";

export async function POST(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const body = await request.json();
  const values = createServiceCardSchema.parse(body);
  const card = await createServiceCard(values);

  return NextResponse.json(card, { status: 201 });
}
