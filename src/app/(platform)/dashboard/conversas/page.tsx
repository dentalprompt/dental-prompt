import { ConversationList } from "@/modules/conversations/components/conversation-list";
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
      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ConversationList conversations={conversations} activeId={activeId} />
        <ConversationThread conversation={activeConversation} />
      </div>
    </div>
  );
}
