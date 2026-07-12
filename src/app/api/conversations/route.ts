import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { createConversation, listConversations } from "@/modules/conversations/services/conversation-service";

const conversationUpsertSchema = z.object({
  contactName: z.string().min(2),
  contactPhone: z.string().min(8),
  patientId: z.string().optional(),
  isAiEnabled: z.boolean().optional()
});

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const conversations = await listConversations(q);

  return NextResponse.json({ data: conversations });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const values = conversationUpsertSchema.parse(body);
    const conversation = await createConversation(values);

    return NextResponse.json({ data: conversation }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel criar a conversa." }, { status: 400 });
  }
}
