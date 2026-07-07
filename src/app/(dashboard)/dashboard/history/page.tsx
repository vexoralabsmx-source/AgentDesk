import { PageHeader } from "@/components/dashboard/PageHeader";
import { HistoryClient } from "@/components/tasks/HistoryClient";

export default function HistoryPage() {
  return (
    <>
      <PageHeader eyebrow="Task History" title="Historial de tareas, outputs y logs basicos." />
      <HistoryClient />
    </>
  );
}
