import { notFound } from "next/navigation";

import { PatientRecord } from "@/modules/patients/components/patient-record";
import { getPatientDetail } from "@/modules/patients/services/patient-detail-service";

export default async function PatientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatientDetail(id);

  if (!patient) {
    notFound();
  }

  return <PatientRecord patient={patient} />;
}
