"use client";

import { CalendarClock, MoveRight, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ServiceEditTrigger } from "@/modules/services/components/service-create-dialog";
import type { ServiceBoardView, ServicePriority } from "@/modules/services/types/service";
import type { PatientListItem } from "@/modules/patients/types/patient";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

const priorityLabel: Record<ServicePriority, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente"
};

const priorityClass: Record<ServicePriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  NORMAL: "bg-sky-100 text-sky-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-rose-100 text-rose-700"
};

function formatDate(date: string | null) {
  if (!date) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date));
}

export function ServiceBoard({
  board,
  patients,
  professionals
}: {
  board: ServiceBoardView;
  patients: PatientListItem[];
  professionals: ProfessionalListItem[];
}) {
  const router = useRouter();
  const [movingCardId, setMovingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const moveCard = async (cardId: string, columnId: string) => {
    setMovingCardId(cardId);

    const response = await fetch(`/api/services/cards/${cardId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ columnId })
    });

    setMovingCardId(null);

    if (!response.ok) {
      return;
    }

    router.refresh();
  };

  const deleteCard = async (cardId: string) => {
    setDeletingCardId(cardId);

    const response = await fetch(`/api/services/cards/${cardId}`, {
      method: "DELETE"
    });

    setDeletingCardId(null);

    if (!response.ok) {
      return;
    }

    router.refresh();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {board.columns.map((column, columnIndex) => (
        <Card key={column.id} className="border-white/70 bg-white/92">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">{column.name}</CardTitle>
                <CardDescription>{column.cards.length} cartao(oes) neste Kanban</CardDescription>
              </div>
              <span className="size-3 rounded-full" style={{ backgroundColor: column.color }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.cards.length > 0 ? (
              column.cards.map((card) => (
                <div key={card.id} className="rounded-[1.25rem] border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-950">{card.title}</p>
                      <p className="text-sm leading-6 text-slate-500">{card.description}</p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", priorityClass[card.priority])}>
                      {priorityLabel[card.priority]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <UserRound className="size-4 text-primary" />
                      <span>{card.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MoveRight className="size-4 text-cyan-600" />
                      <span>{card.professionalName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-amber-600" />
                      <span>{formatDate(card.dueDate)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ServiceEditTrigger
                      board={board}
                      patients={patients}
                      professionals={professionals}
                      card={card}
                    />
                    {columnIndex < board.columns.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => moveCard(card.id, board.columns[columnIndex + 1].id)}
                        disabled={movingCardId === card.id}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-semibold text-primary transition hover:bg-white disabled:opacity-50"
                      >
                        {movingCardId === card.id ? "Movendo..." : `Mover para ${board.columns[columnIndex + 1].name}`}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => deleteCard(card.id)}
                      disabled={deletingCardId === card.id}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                      {deletingCardId === card.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Nenhum servico nesta coluna ainda.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
