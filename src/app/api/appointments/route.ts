import { NextResponse } from "next/server";

import { createAppointmentSchema } from "@/modules/appointments/schemas/appointment-schema";
import { createAppointment, listAppointments } from "@/modules/appointments/services/appointment-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const professionalId = searchParams.get("professionalId") ?? undefined;
  const date = searchParams.get("date") ?? undefined;

  const appointments = await listAppointments({ professionalId, date });

  return NextResponse.json({ data: appointments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = createAppointmentSchema.parse(body);
    const appointment = await createAppointment(values);

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel criar o agendamento com os dados enviados." },
      { status: 400 }
    );
  }
}
