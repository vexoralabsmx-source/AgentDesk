import { ChatWorkspaceClient } from "@/components/chat/ChatWorkspaceClient";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function ChatPage() {
  return (
    <>
      <PageHeader eyebrow="Chat Workspace" title="Conversa con agentes especializados y compara modelos." />
      <ChatWorkspaceClient />
    </>
  );
}
