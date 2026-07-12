import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestSession } from "@/lib/auth/request-session";
import { sendMessage } from "@/modules/conversations/services/conversation-service";

const sendMessageSchema = z.object({
  content: z.string().min(1, "Informe uma mensagem.")
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = sendMessageSchema.parse(body);
    const message = await sendMessage({ conversationId: id, content: values.content });

    if (!message) {
      return NextResponse.json({ message: "Conversa nao encontrada." }, { status: 404 });
    }

    return NextResponse.json({ data: message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel enviar a mensagem." },
      { status: 400 }
    );
  }
}
