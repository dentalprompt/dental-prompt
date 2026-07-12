import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createPatientSchema } from "@/modules/patients/schemas/patient-schema";
import { getPatientDetail } from "@/modules/patients/services/patient-detail-service";
import { updatePatient } from "@/modules/patients/services/patient-service";

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = createPatientSchema.parse(body);
    const patient = await updatePatient(id, values);

    if (!patient) {
      return NextResponse.json({ message: "Paciente nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: patient });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel atualizar o paciente com os dados informados." },
      { status: 400 }
    );
  }
}
