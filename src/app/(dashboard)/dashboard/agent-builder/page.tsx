import { AgentBuilderClient } from "@/components/agents/AgentBuilderClient";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function AgentBuilderPage() {
  return (
    <>
      <PageHeader eyebrow="Agent Builder" title="Crea agentes con rol, prompt, modelo y skills." />
      <AgentBuilderClient />
    </>
  );
}
