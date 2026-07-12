import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listPatients } from "@/modules/patients/services/patient-service";
import { ServiceBoard } from "@/modules/services/components/service-board";
import { ServiceCreateDialog } from "@/modules/services/components/service-create-dialog";
import { getPrimaryServiceBoard } from "@/modules/services/services/service-board-service";
import { listProfessionals } from "@/modules/team/services/professional-service";

export default async function ServicesPage() {
  const [board, patients, professionals] = await Promise.all([
    getPrimaryServiceBoard(),
    listPatients(),
    listProfessionals()
  ]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle>Servicos</CardTitle>
            <CardDescription>
              Kanban operacional da clinica para acompanhar tratamentos internos, prioridades e andamento dos servicos.
            </CardDescription>
          </div>
          <ServiceCreateDialog board={board} patients={patients} professionals={professionals} />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <p className="text-sm text-slate-500">Board ativo</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{board.name}</p>
          </div>
          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <p className="text-sm text-slate-500">Colunas</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">{board.columns.length}</p>
          </div>
          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <p className="text-sm text-slate-500">Cartoes</p>
            <p className="mt-1 text-xl font-semibold text-slate-950">
              {board.columns.reduce((total, column) => total + column.cards.length, 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      <ServiceBoard board={board} />
    </div>
  );
}
