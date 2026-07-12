import { AppointmentCreateDialog } from "@/modules/appointments/components/appointment-create-dialog";
import { AgendaDayBoard } from "@/modules/appointments/components/agenda-day-board";
import { AgendaProfessionalFilter } from "@/modules/appointments/components/agenda-professional-filter";
import { listAppointments } from "@/modules/appointments/services/appointment-service";
import { listPatients } from "@/modules/patients/services/patient-service";
import { listProfessionals } from "@/modules/team/services/professional-service";

export default async function SchedulePage({
  searchParams
}: {
  searchParams?: Promise<{ professionalId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const date = params?.date ?? new Date().toISOString().slice(0, 10);
  const [appointments, professionals, patients] = await Promise.all([
    listAppointments({
      professionalId: params?.professionalId,
      date
    }),
    listProfessionals(),
    listPatients()
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <AgendaProfessionalFilter professionals={professionals} />
        <AppointmentCreateDialog patients={patients} professionals={professionals} />
      </div>
      <AgendaDayBoard appointments={appointments} date={date} patients={patients} professionals={professionals} />
    </div>
  );
}
