import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { getPrimaryServiceBoard } from "@/modules/services/services/service-board-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const board = await getPrimaryServiceBoard();

  return NextResponse.json(board);
}
