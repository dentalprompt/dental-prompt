import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { getPatientDetail } from "@/modules/patients/services/patient-detail-service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { id } = await params;
  const patient = await getPatientDetail(id);

  if (!patient) {
    return NextResponse.json({ message: "Paciente nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: patient });
}
