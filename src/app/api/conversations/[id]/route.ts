import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { getConversationDetail } from "@/modules/conversations/services/conversation-service";

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
