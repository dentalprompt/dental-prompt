import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import {
  getConversationDetail,
  toggleConversationAi,
  updateConversation
} from "@/modules/conversations/services/conversation-service";

const conversationUpsertSchema = z.object({
  contactName: z.string().min(2),
  contactPhone: z.string().min(8),
  patientId: z.string().optional(),
  isAiEnabled: z.boolean().optional()
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await getConversationDetail(id);

  if (!conversation) {
    return NextResponse.json({ message: "Conversa nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ data: conversation });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = conversationUpsertSchema.parse(body);
    const conversation = await updateConversation(id, values);

    if (!conversation) {
      return NextResponse.json({ message: "Conversa nao encontrada." }, { status: 404 });
    }

    return NextResponse.json({ data: conversation });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel atualizar a conversa." }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await toggleConversationAi(id);

  if (!conversation) {
    return NextResponse.json({ message: "Conversa nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ data: conversation });
}
