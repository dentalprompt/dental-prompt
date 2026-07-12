import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck2, Clock3, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppointmentListItem } from "@/modules/appointments/types/appointment";

const appointmentStatusMap: Record<AppointmentListItem["status"], { label: string; variant: "default" | "success" | "warning" | "info" }> = {
  SCHEDULED: { label: "Agendado", variant: "default" },
  CONFIRMED: { label: "Confirmado", variant: "success" },
  IN_ATTENDANCE: { label: "Em atendimento", variant: "info" },
  COMPLETED: { label: "Concluido", variant: "success" },
  CANCELED: { label: "Cancelado", variant: "warning" },
  NO_SHOW: { label: "Faltou", variant: "warning" },
  RESCHEDULED: { label: "Remarcado", variant: "info" },
  WALK_IN: { label: "Encaixe", variant: "info" },
  RETURN: { label: "Retorno", variant: "default" }
};

function formatHour(value: string) {
  return format(new Date(value), "HH:mm", { locale: ptBR });
}

export function AgendaDayBoard({
  appointments,
  date
}: {
  appointments: AppointmentListItem[];
  date: string;
}) {
  const grouped = appointments.reduce<Record<string, AppointmentListItem[]>>((accumulator, appointment) => {
    const professional = appointment.professional.name;
    accumulator[professional] ??= [];
    accumulator[professional].push(appointment);
    return accumulator;
  }, {});

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Agenda do dia</CardTitle>
            <CardDescription>
              Visualizacao operacional simplificada com base pronta para semana, mes e drag and drop.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/55 px-4 py-3 text-sm font-medium text-slate-700 backdrop-blur-md">
            {format(new Date(`${date}T12:00:00`), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
        </CardHeader>
      </Card>

      {appointments.length === 0 ? (
        <Card className="border-white/70 bg-white/92">
          <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-accent p-4 text-primary">
              <CalendarCheck2 className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Nenhum agendamento encontrado</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Tente outro profissional, ajuste a data atual ou crie um novo agendamento para iniciar a agenda.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {Object.entries(grouped).map(([professional, items]) => (
          <Card key={professional} className="border-white/70 bg-white/92">
            <CardHeader>
              <CardTitle>{professional}</CardTitle>
              <CardDescription>{items[0]?.professional.specialty ?? "Sem especialidade definida"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((appointment) => (
                <div key={appointment.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4 text-primary" />
                        <span className="text-sm font-semibold text-slate-950">
                          {formatHour(appointment.startsAt)} - {formatHour(appointment.endsAt)}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-slate-950">{appointment.title}</p>
                      <p className="flex items-center gap-2 text-sm text-slate-500">
                        <UserRound className="size-4" />
                        {appointment.patient.fullName}
                      </p>
                      {appointment.notes ? (
                        <p className="text-sm leading-6 text-slate-600">{appointment.notes}</p>
                      ) : null}
                    </div>
                    <Badge variant={appointmentStatusMap[appointment.status].variant}>
                      {appointmentStatusMap[appointment.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
