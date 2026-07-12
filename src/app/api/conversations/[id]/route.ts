import { NextResponse } from "next/server";

import { getConversationDetail } from "@/modules/conversations/services/conversation-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conversation = await getConversationDetail(id);

  if (!conversation) {
    return NextResponse.json({ message: "Conversa nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({ data: conversation });
}
