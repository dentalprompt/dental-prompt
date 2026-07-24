import { NextResponse } from "next/server";

import { processZApiWebhook } from "@/modules/conversations/services/zapi-webhook-service";

export async function POST(request: Request, { params }: { params: Promise<{ tenantId: string }> }) {
  try {
    const { tenantId } = await params;
    const payload = (await request.json()) as Record<string, unknown>;
    const result = await processZApiWebhook(payload, tenantId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Nao foi possivel processar o webhook da Z-API." }, { status: 400 });
  }
}
