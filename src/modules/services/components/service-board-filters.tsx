"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ServiceBoardView, ServicePriority } from "@/modules/services/types/service";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

const priorityOptions: Array<{ value: ServicePriority; label: string }> = [
  { value: "LOW", label: "Baixa" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" }
];

type Props = {
  board: ServiceBoardView;
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
};

export function ServiceBoardFilters({ board, patients, professionals }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}` as Route);
  }

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <input
        type="search"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(event) => updateParam("search", event.target.value)}
        placeholder="Pesquisar por paciente, profissional ou tratamento"
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      />
      <select
        defaultValue={searchParams.get("patientId") ?? ""}
        onChange={(event) => updateParam("patientId", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todos os pacientes</option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.fullName}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("professionalId") ?? ""}
        onChange={(event) => updateParam("professionalId", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todos os profissionais</option>
        {professionals.map((professional) => (
          <option key={professional.id} value={professional.id}>
            {professional.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("priority") ?? ""}
        onChange={(event) => updateParam("priority", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todas as prioridades</option>
        {priorityOptions.map((priority) => (
          <option key={priority.value} value={priority.value}>
            {priority.label}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("columnId") ?? ""}
        onChange={(event) => updateParam("columnId", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todos os Kanbans</option>
        {board.columns.map((column) => (
          <option key={column.id} value={column.id}>
            {column.name}
          </option>
        ))}
      </select>
    </div>
  );
}
