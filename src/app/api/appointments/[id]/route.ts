import { NextResponse } from "next/server";

import { getRequestSession } from "@/lib/auth/request-session";
import { createAppointmentSchema } from "@/modules/appointments/schemas/appointment-schema";
import { updateAppointment } from "@/modules/appointments/services/appointment-service";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getRequestSession(request);

    if (!session) {
      return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const values = createAppointmentSchema.parse(body);
    const appointment = await updateAppointment(id, values);

    if (!appointment) {
      return NextResponse.json({ message: "Agendamento nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ data: appointment });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel atualizar o agendamento com os dados enviados." },
      { status: 400 }
    );
  }
}
