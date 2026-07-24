import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import {
  disconnectZApiInstance,
  getZApiInstanceStatus,
  refreshZApiQrCode,
  saveZApiCredentials,
  syncZApiWebhooks
} from "@/lib/integrations/zapi";
import { zApiActionSchema, updateZApiSettingsSchema } from "@/modules/settings/schemas/zapi-settings-schema";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session?.tenantId) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const data = await getZApiInstanceStatus(session.tenantId);
  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const session = getRequestSession(request);

  if (!session?.tenantId) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const values = updateZApiSettingsSchema.parse(body);
    await saveZApiCredentials(session.tenantId, values);
    await syncZApiWebhooks(session.tenantId);
    const data = await getZApiInstanceStatus(session.tenantId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel salvar a configuracao da Z-API." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const session = getRequestSession(request);

  if (!session?.tenantId) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = zApiActionSchema.parse(body);

    if (action === "refresh-qrcode") {
      const data = await refreshZApiQrCode(session.tenantId);
      return NextResponse.json({ data });
    }

    if (action === "sync-webhooks") {
      const data = await syncZApiWebhooks(session.tenantId);
      return NextResponse.json({ data });
    }

    if (action === "disconnect") {
      const data = await disconnectZApiInstance(session.tenantId);
      return NextResponse.json({ data });
    }

    const data = await getZApiInstanceStatus(session.tenantId);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel executar a acao da Z-API." },
      { status: 400 }
    );
  }
}
