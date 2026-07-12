export type AppointmentListItem = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_ATTENDANCE"
    | "COMPLETED"
    | "CANCELED"
    | "NO_SHOW"
    | "RESCHEDULED"
    | "WALK_IN"
    | "RETURN";
  patient: {
    id: string;
    fullName: string;
  };
  professional: {
    id: string;
    name: string;
    specialty: string | null;
  };
  notes: string | null;
};

export type CreateAppointmentInput = {
  patientId: string;
  professionalId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status?:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_ATTENDANCE"
    | "COMPLETED"
    | "CANCELED"
    | "NO_SHOW"
    | "RESCHEDULED"
    | "WALK_IN"
    | "RETURN";
};
