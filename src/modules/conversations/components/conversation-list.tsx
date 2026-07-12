import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bot, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConversationListItem } from "@/modules/conversations/types/conversation";

function formatTimestamp(value: string | null) {
  if (!value) {
    return "";
  }

  return format(new Date(value), "HH:mm", { locale: ptBR });
}

export function ConversationList({
  conversations,
  activeId
}: {
  conversations: ConversationListItem[];
  activeId?: string;
}) {
  return (
    <Card className="min-h-[70vh] border-white/70 bg-white/92">
      <CardContent className="space-y-3 p-4">
        {conversations.length ? (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeId;

            return (
              <Link
                key={conversation.id}
                href={`/dashboard/conversas?conversationId=${conversation.id}` as Route}
                className={cn(
                  "block rounded-[1.25rem] border p-4 transition",
                  isActive
                    ? "border-primary bg-accent/60"
                    : "border-border bg-background hover:border-primary/30 hover:bg-accent/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-950">{conversation.contactName}</p>
                      {conversation.isAiEnabled ? (
                        <Badge variant="info">
                          <Bot className="mr-1 size-3" />
                          IA
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">{conversation.contactPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{formatTimestamp(conversation.lastMessageAt)}</p>
                    {conversation.unreadCount ? (
                      <span className="mt-2 inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {conversation.lastMessagePreview ?? "Sem mensagens registradas ainda."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {conversation.patientName ? (
                    <Badge variant="success">
                      <UserRound className="mr-1 size-3" />
                      {conversation.patientName}
                    </Badge>
                  ) : null}
                  {conversation.labels.map((label) => (
                    <Badge key={label}>{label}</Badge>
                  ))}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex min-h-40 items-center justify-center text-center text-sm text-slate-500">
            Nenhuma conversa encontrada para os filtros atuais.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
