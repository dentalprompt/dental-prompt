import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationContactPanel } from "@/modules/conversations/components/conversation-contact-panel";
import { ConversationList } from "@/modules/conversations/components/conversation-list";
import { ConversationSearch } from "@/modules/conversations/components/conversation-search";
import { ConversationThread } from "@/modules/conversations/components/conversation-thread";
import { getConversationDetail, listConversations } from "@/modules/conversations/services/conversation-service";

export default async function ConversationsPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; conversationId?: string }>;
}) {
  const params = await searchParams;
  const conversations = await listConversations(params?.q);
  const activeId = params?.conversationId ?? conversations[0]?.id;
  const activeConversation = activeId ? await getConversationDetail(activeId) : null;

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge>Atendimento em tempo real</Badge>
            <div className="space-y-2">
              <CardTitle>Conversas</CardTitle>
              <CardDescription>
                Estrutura inspirada no WhatsApp Web, preparada para Evolution API, agentes de IA, etiquetas, notas internas e vinculo direto com pacientes.
              </CardDescription>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
            {conversations.length} conversa{conversations.length === 1 ? "" : "s"} ativa{conversations.length === 1 ? "" : "s"}
          </div>
        </CardHeader>
        <CardContent>
          <ConversationSearch />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)_320px]">
        <ConversationList conversations={conversations} activeId={activeId} />
        <ConversationThread conversation={activeConversation} />
        <ConversationContactPanel conversation={activeConversation} />
      </div>
    </div>
  );
}
