import { NextResponse } from "next/server";

import { verifyAccessToken } from "@/lib/auth/jwt";
import { getClinicSettings, updateClinicSettings } from "@/modules/settings/services/settings-service";
import { updateClinicSettingsSchema } from "@/modules/settings/schemas/clinic-settings-schema";

function getTenantIdFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const accessToken = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("dp_access_token="))
    ?.split("=")[1];

  if (!accessToken) {
    return null;
  }

  try {
    return verifyAccessToken(accessToken).tenantId ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const tenantId = getTenantIdFromRequest(request);

  if (!tenantId) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const settings = await getClinicSettings(tenantId);

  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const tenantId = getTenantIdFromRequest(request);

  if (!tenantId) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const body = await request.json();
  const values = updateClinicSettingsSchema.parse(body);
  const settings = await updateClinicSettings(tenantId, values);

  return NextResponse.json(settings);
}
