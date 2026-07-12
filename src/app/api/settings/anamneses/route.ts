import { NextResponse } from "next/server";

import { createAnamnesisTemplate, listAnamnesisTemplates } from "@/modules/settings/services/settings-service";

export async function GET() {
  const data = await listAnamnesisTemplates();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createAnamnesisTemplate({
      name: body.name ?? "",
      description: body.description ?? "",
      specialty: body.specialty ?? ""
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar o modelo de anamnese." }, { status: 400 });
  }
}
