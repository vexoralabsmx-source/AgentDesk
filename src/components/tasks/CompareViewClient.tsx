"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

type Task = {
  id: string;
  input: string;
  mode: string;
  status: string;
  created_at: string;
};

type Output = {
  id: string;
  task_id: string;
  provider: string;
  model: string;
  content: string | null;
  error: string | null;
  latency_ms: number | null;
};

export function CompareViewClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [taskId, setTaskId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const response = await fetch("/api/tasks");
    const data = await response.json();
    if (response.ok) {
      setTasks(data.tasks ?? []);
      setOutputs(data.outputs ?? []);
      setTaskId((current) => current || data.tasks?.[0]?.id || "");
    } else {
      setMessage(data.error ?? "No se pudo cargar historial");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const selectedOutputs = useMemo(() => outputs.filter((output) => output.task_id === taskId), [outputs, taskId]);
  const selectedTask = tasks.find((task) => task.id === taskId);

  async function fuse() {
    if (!taskId) return;
    if (!window.confirm("Fusionar las respuestas validas de esta tarea?")) return;
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/tasks/fuse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId })
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "No se pudo fusionar");
      return;
    }
    setMessage("Respuesta fusionada y guardada.");
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <label className="block flex-1 text-sm text-slate-300">
            Tarea
            <select className="field mt-2" value={taskId} onChange={(event) => setTaskId(event.target.value)}>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {new Date(task.created_at).toLocaleString()} · {task.mode} · {task.input.slice(0, 70)}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" onClick={fuse} disabled={!taskId || loading}>
            {loading ? "Fusionando..." : "Fusionar mejor respuesta"}
          </Button>
        </div>
        {selectedTask ? <p className="mt-4 text-sm leading-6 text-slate-300">{selectedTask.input}</p> : null}
        {message ? <p className="mt-4 rounded-lg border border-white/10 bg-white/7 p-3 text-sm text-slate-200">{message}</p> : null}
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        {selectedOutputs.map((output) => (
          <article key={output.id} className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-black">{output.provider}</h2>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300">{output.model}</span>
            </div>
            {output.error ? (
              <p className="mt-4 text-sm leading-6 text-red-200">{output.error}</p>
            ) : (
              <pre className="scrollbar-soft mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">{output.content}</pre>
            )}
          </article>
        ))}
      </section>
      {!selectedOutputs.length ? <p className="rounded-xl border border-white/10 bg-white/6 p-4 text-sm text-slate-400">No hay outputs para comparar.</p> : null}
    </div>
  );
}
