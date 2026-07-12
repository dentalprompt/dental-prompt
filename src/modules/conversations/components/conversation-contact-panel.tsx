import Link from "next/link";
import type { Route } from "next";
import { FileText, Phone, Tags, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConversationDetail } from "@/modules/conversations/types/conversation";

export function ConversationContactPanel({
  conversation
}: {
  conversation: ConversationDetail | null;
}) {
  return (
    <Card className="min-h-[70vh] border-white/70 bg-white/92">
      <CardHeader>
        <CardTitle>Contato</CardTitle>
        <CardDescription>Resumo do vinculo com paciente, etiquetas, arquivos e observacoes internas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {conversation ? (
          <>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-accent p-3 text-primary">
                  <Phone className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-slate-950">{conversation.contactName}</p>
                  <p className="text-sm text-slate-500">{conversation.contactPhone}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-accent p-3 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="space-y-2">
                  <p className="font-semibold text-slate-950">Paciente vinculado</p>
                  {conversation.patient ? (
                    <>
                      <Link
                        href={`/dashboard/pacientes/${conversation.patient.id}` as Route}
                        className="text-sm font-medium text-primary"
                      >
                        {conversation.patient.name}
                      </Link>
                      <p className="text-sm text-slate-500">
                        Prontuario {conversation.patient.chartNumber ?? "nao informado"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Nenhum paciente vinculado ainda.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-accent p-3 text-primary">
                  <Tags className="size-5" />
                </span>
                <div className="space-y-3">
                  <p className="font-semibold text-slate-950">Etiquetas</p>
                  <div className="flex flex-wrap gap-2">
                    {conversation.labels.length ? (
                      conversation.labels.map((label) => <Badge key={label}>{label}</Badge>)
                    ) : (
                      <p className="text-sm text-slate-500">Sem etiquetas no momento.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-accent p-3 text-primary">
                  <FileText className="size-5" />
                </span>
                <div className="space-y-3">
                  <p className="font-semibold text-slate-950">Arquivos compartilhados</p>
                  {conversation.sharedFiles.length ? (
                    <div className="space-y-2">
                      {conversation.sharedFiles.map((file) => (
                        <p key={file.id} className="text-sm text-slate-600">
                          {file.name} • {file.type}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Nenhum arquivo compartilhado nesta conversa.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="font-semibold text-slate-950">Notas internas</p>
              <div className="mt-3 space-y-2">
                {conversation.notes.length ? (
                  conversation.notes.map((note) => (
                    <p key={note} className="text-sm leading-6 text-slate-600">
                      {note}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Nenhuma nota registrada.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center text-center text-sm text-slate-500">
            Selecione uma conversa para visualizar os detalhes do contato.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
