import { NextResponse } from "next/server";

import { createContractTemplate, listContractTemplates } from "@/modules/settings/services/settings-service";

export async function GET() {
  const data = await listContractTemplates();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createContractTemplate({
      name: body.name ?? "",
      description: body.description ?? "",
      category: body.category ?? "",
      content: body.content ?? ""
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar o contrato." }, { status: 400 });
  }
}
