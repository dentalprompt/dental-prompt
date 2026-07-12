import { NextResponse } from "next/server";

import { createChair, listChairs } from "@/modules/settings/services/settings-service";

export async function GET() {
  const data = await listChairs();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await createChair({
      name: body.name ?? "",
      code: body.code ?? "",
      room: body.room ?? "",
      color: body.color ?? "",
      notes: body.notes ?? ""
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel salvar a cadeira." }, { status: 400 });
  }
}
