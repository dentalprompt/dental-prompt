import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientCreateDialog } from "@/modules/patients/components/patient-create-dialog";
import { PatientImportDialog } from "@/modules/patients/components/patient-import-dialog";
import { PatientSearch } from "@/modules/patients/components/patient-search";
import { PatientTable } from "@/modules/patients/components/patient-table";
import { listPatients } from "@/modules/patients/services/patient-service";

export default async function PatientsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const patients = await listPatients(params?.q);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>Modulo central</Badge>
            <div className="space-y-2">
              <CardTitle>Pacientes</CardTitle>
              <CardDescription>
                Listagem, busca e cadastro inicial conectados a uma camada de dados pronta para multi-tenant, auditoria e evolucao futura da ficha completa.
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <a href="/api/exports/patients?format=xlsx">Exportar</a>
            </Button>
            <PatientImportDialog />
            <PatientCreateDialog />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <PatientSearch />
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
              {patients.length} paciente{patients.length === 1 ? "" : "s"} encontrado{patients.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientTable patients={patients} />
    </div>
  );
}
