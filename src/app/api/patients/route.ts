import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createPatientSchema } from "@/modules/patients/schemas/patient-schema";
import { createPatient, listPatients } from "@/modules/patients/services/patient-service";

export async function GET(request: Request) {
  const session = getRequestSession(request);

  if (!session) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;

  const patients = await listPatients(q);

  return NextResponse.json({ data: patients });
}

export async function POST(request: Request) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const body = await request.json();
    const values = createPatientSchema.parse(body);
    const patient = await createPatient(values);

    return NextResponse.json({ data: patient }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel salvar o paciente com os dados informados." },
      { status: 400 }
    );
  }
}
