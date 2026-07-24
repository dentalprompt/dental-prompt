import { NextResponse } from "next/server";

import { processZApiWebhook } from "@/modules/conversations/services/zapi-webhook-service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await processZApiWebhook(payload);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Nao foi possivel processar o webhook da Z-API." }, { status: 400 });
  }
}
