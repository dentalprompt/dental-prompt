import { NextResponse } from "next/server";

import { getPatientDetail } from "@/modules/patients/services/patient-detail-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await getPatientDetail(id);

  if (!patient) {
    return NextResponse.json({ message: "Paciente nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: patient });
}
