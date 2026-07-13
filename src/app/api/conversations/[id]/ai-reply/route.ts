import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { generateAiReplyForConversation } from "@/modules/conversations/services/conversation-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const reply = await generateAiReplyForConversation(id);

    if (!reply) {
      return NextResponse.json({ message: "Nao foi possivel gerar a resposta com IA." }, { status: 400 });
    }

    return NextResponse.json({ data: reply });
  } catch {
    return NextResponse.json({ message: "Falha ao gerar resposta com IA." }, { status: 400 });
  }
}
