import { PageHeader } from "@/components/dashboard/PageHeader";
import { TaskRunnerClient } from "@/components/tasks/TaskRunnerClient";

export default function TaskRunnerPage() {
  return (
    <>
      <PageHeader eyebrow="Task Runner" title="Ejecuta tareas con uno o varios modelos." />
      <TaskRunnerClient />
    </>
  );
}
