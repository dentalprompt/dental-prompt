"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SendHorizonal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ConversationDetail } from "@/modules/conversations/types/conversation";

function formatTime(value: string) {
  return format(new Date(value), "HH:mm", { locale: ptBR });
}

export function ConversationThread({ conversation }: { conversation: ConversationDetail | null }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    if (!conversation || !content.trim()) {
      return;
    }

    setIsSending(true);

    try {
      await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });

      setContent("");
      router.refresh();
    } finally {
      setIsSending(false);
    }
  }

  if (!conversation) {
    return (
      <Card className="min-h-[72vh] border-white/70 bg-white/88 backdrop-blur-md">
        <CardContent className="flex min-h-[72vh] items-center justify-center p-8 text-center text-sm text-slate-500">
          Selecione uma conversa para visualizar as mensagens e interagir com o contato.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[72vh] overflow-hidden border-white/70 bg-white/88 backdrop-blur-md">
      <CardHeader className="border-b border-border/70 bg-white/45 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{conversation.contactName}</CardTitle>
            <CardDescription>{conversation.contactPhone}</CardDescription>
          </div>
          <div className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
            {conversation.messages.length} mensagem{conversation.messages.length === 1 ? "" : "ens"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-[calc(72vh-92px)] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto bg-white/20 p-5">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.direction === "OUTBOUND" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 shadow-sm",
                  message.direction === "OUTBOUND"
                    ? "bg-primary text-white"
                    : "bg-white text-slate-700"
                )}
              >
                <p>{message.content}</p>
                <p
                  className={cn(
                    "mt-2 text-[11px]",
                    message.direction === "OUTBOUND" ? "text-white/70" : "text-slate-400"
                  )}
                >
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border/70 bg-white/45 p-4 backdrop-blur-sm">
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Escreva uma mensagem..."
              className="min-h-[90px] border-white/70 bg-white/85"
            />
            <div className="flex justify-end">
              <Button onClick={handleSend} disabled={isSending || !content.trim()}>
                <SendHorizonal className="mr-2 size-4" />
                {isSending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
