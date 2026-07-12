import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck2, Clock3, Plus, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentEditTrigger } from "@/modules/appointments/components/appointment-create-dialog";
import type { AppointmentListItem } from "@/modules/appointments/types/appointment";
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

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

function getMinutesFromIso(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

export function AgendaDayBoard({
  appointments,
  date,
  patients,
  professionals
}: {
  appointments: AppointmentListItem[];
  date: string;
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
}) {
  const grouped = appointments.reduce<
    Record<string, { specialty: string; items: AppointmentListItem[] }>
  >((accumulator, appointment) => {
    const professional = appointment.professional.name;
    accumulator[professional] ??= {
      specialty: appointment.professional.specialty ?? "Sem especialidade definida",
      items: []
    };
    accumulator[professional].items.push(appointment);
    return accumulator;
  }, {});

  const professionalColumns = Object.entries(grouped);
  const startHour = 8;
  const endHour = 20;
  const slotHeight = 72;
  const totalMinutes = (endHour - startHour) * 60;
  const hourLabels = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);

  return (
    <div className="space-y-4">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>
              Visualizacao em grade diaria, inspirada em calendario, com leitura rapida por horario e profissional.
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

      <Card className="overflow-hidden border-white/70 bg-white/92">
        <CardContent className="p-0">
          <div
            className="grid min-w-[960px]"
            style={{ gridTemplateColumns: `88px repeat(${Math.max(professionalColumns.length, 1)}, minmax(240px, 1fr))` }}
          >
            <div className="border-r border-border/70 bg-white/35" />
            {professionalColumns.map(([professional, data]) => (
              <div key={professional} className="border-r border-border/70 bg-white/35 p-4 last:border-r-0">
                <p className="font-semibold text-slate-950">{professional}</p>
                <p className="text-sm text-slate-500">{data.specialty}</p>
              </div>
            ))}

            <div className="relative border-r border-border/70 bg-white/30">
              {hourLabels.map((hour, index) => (
                <div
                  key={hour}
                  className="relative border-t border-border/60 pr-3 text-right text-xs text-slate-400 first:border-t-0"
                  style={{ height: index === hourLabels.length - 1 ? 0 : slotHeight }}
                >
                  <span className="-translate-y-3 inline-block bg-white/80 px-2 py-1">{`${String(hour).padStart(2, "0")}:00`}</span>
                </div>
              ))}
            </div>

            {professionalColumns.map(([professional, data]) => (
              <div key={professional} className="relative border-r border-border/70 last:border-r-0">
                <div className="absolute inset-0">
                  {Array.from({ length: endHour - startHour }).map((_, index) => (
                    <div
                      key={index}
                      className="border-t border-border/60"
                      style={{ height: slotHeight }}
                    />
                  ))}
                </div>

                <div className="relative" style={{ height: `${(endHour - startHour) * slotHeight}px` }}>
                  {data.items.map((appointment) => {
                    const startMinutes = getMinutesFromIso(appointment.startsAt);
                    const endMinutes = getMinutesFromIso(appointment.endsAt);
                    const top = ((startMinutes - startHour * 60) / totalMinutes) * ((endHour - startHour) * slotHeight);
                    const height = Math.max(
                      ((endMinutes - startMinutes) / totalMinutes) * ((endHour - startHour) * slotHeight),
                      88
                    );

                    return (
                      <div
                        key={appointment.id}
                        className="absolute left-3 right-3 overflow-hidden rounded-[1.25rem] border border-primary/15 bg-white/92 p-4 shadow-sm backdrop-blur-sm"
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="flex items-start justify-between gap-3">
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
                              <p className="line-clamp-2 text-sm leading-6 text-slate-600">{appointment.notes}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={appointmentStatusMap[appointment.status].variant}>
                              {appointmentStatusMap[appointment.status].label}
                            </Badge>
                            <AppointmentEditTrigger
                              appointment={appointment}
                              patients={patients}
                              professionals={professionals}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="absolute bottom-4 right-4">
                    <button
                      type="button"
                      className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30"
                      aria-label={`Novo agendamento para ${professional}`}
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
