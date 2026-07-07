import { PageHeader } from "@/components/dashboard/PageHeader";
import { CompareViewClient } from "@/components/tasks/CompareViewClient";

export default function ComparePage() {
  return (
    <>
      <PageHeader eyebrow="Compare View" title="Compara outputs por provider y fusiona la mejor respuesta." />
      <CompareViewClient />
    </>
  );
}
