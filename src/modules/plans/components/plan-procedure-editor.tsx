"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlanProcedureItem } from "@/modules/plans/types/plan";

export function PlanProcedureEditor({
  planId,
  procedure
}: {
  planId: string;
  procedure: PlanProcedureItem;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    price: String(procedure.price),
    cost: String(procedure.cost),
    isActive: procedure.isActive,
    usesToothFaces: procedure.usesToothFaces,
    notes: procedure.notes ?? ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function saveChanges() {
    setIsSaving(true);

    try {
      await fetch(`/api/plans/${planId}/procedures/${procedure.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          price: Number(form.price),
          cost: Number(form.cost),
          isActive: form.isActive,
          usesToothFaces: form.usesToothFaces,
          notes: form.notes
        })
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteProcedure() {
    setIsDeleting(true);

    try {
      await fetch(`/api/plans/${planId}/procedures/${procedure.id}`, {
        method: "DELETE"
      });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-white/70 bg-white/92">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-slate-950">{procedure.name}</h3>
              <Badge>{procedure.specialty}</Badge>
              {form.usesToothFaces ? <Badge variant="info">Faces dentarias</Badge> : null}
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {procedure.notes ?? "Sem observacoes cadastradas para este procedimento."}
            </p>
          </div>
          <Badge variant={form.isActive ? "success" : "warning"}>
            {form.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Preco de venda</Label>
            <Input value={form.price} onChange={(event) => setForm((state) => ({ ...state, price: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Custo</Label>
            <Input value={form.cost} onChange={(event) => setForm((state) => ({ ...state, cost: event.target.value }))} />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((state) => ({ ...state, isActive: event.target.checked }))}
            />
            Procedimento ativo
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.usesToothFaces}
              onChange={(event) => setForm((state) => ({ ...state, usesToothFaces: event.target.checked }))}
            />
            Usa faces dentarias
          </label>
        </div>

        <div className="space-y-2">
          <Label>Observacoes</Label>
          <Input value={form.notes} onChange={(event) => setForm((state) => ({ ...state, notes: event.target.value }))} />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={deleteProcedure} disabled={isDeleting}>
            <Trash2 className="mr-2 size-4" />
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
          <Button onClick={saveChanges} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alteracoes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
