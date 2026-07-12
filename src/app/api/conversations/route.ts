import { NextResponse } from "next/server";

import { listConversations } from "@/modules/conversations/services/conversation-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const conversations = await listConversations(q);

  return NextResponse.json({ data: conversations });
}
