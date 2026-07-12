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
      <Card className="min-h-[70vh] border-white/70 bg-white/92">
        <CardContent className="flex min-h-[70vh] items-center justify-center p-8 text-center text-sm text-slate-500">
          Selecione uma conversa para visualizar as mensagens e interagir com o contato.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[70vh] border-white/70 bg-white/92">
      <CardHeader className="border-b border-border/70">
        <CardTitle>{conversation.contactName}</CardTitle>
        <CardDescription>{conversation.contactPhone}</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-[calc(70vh-92px)] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
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
                    : "bg-background text-slate-700"
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
        <div className="border-t border-border/70 p-4">
          <div className="space-y-3">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Escreva uma mensagem..."
              className="min-h-[90px]"
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
