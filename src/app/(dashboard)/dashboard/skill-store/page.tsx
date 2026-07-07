import { PageHeader } from "@/components/dashboard/PageHeader";
import { SkillStoreClient } from "@/components/skills/SkillStoreClient";

export default function SkillStorePage() {
  return (
    <>
      <PageHeader eyebrow="Skill Store" title="Activa capacidades modulares para tus agentes." />
      <SkillStoreClient />
    </>
  );
}
