"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  input: string;
  mode: string;
  selected_provider: string | null;
  status: string;
  error: string | null;
  created_at: string;
};

type Log = {
  id: string;
  task_id: string;
  level: string;
  message: string;
  created_at: string;
};

export function HistoryClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/tasks")
      .then((response) => response.json())
      .then((data) => {
        setTasks(data.tasks ?? []);
        setLogs(data.logs ?? []);
      })
      .catch(() => setMessage("No se pudo cargar historial"));
  }, []);

  return (
    <section className="space-y-4">
      {tasks.map((task) => (
        <article key={task.id} className="glass rounded-2xl p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-slate-300">{task.mode}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${task.status === "completed" ? "bg-mint/15 text-mint" : task.status === "failed" ? "bg-red-500/15 text-red-200" : "bg-solar/15 text-solar"}`}>
                  {task.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{task.input}</p>
              {task.error ? <p className="mt-2 text-sm text-red-200">{task.error}</p> : null}
            </div>
            <p className="text-sm text-slate-500">{new Date(task.created_at).toLocaleString()}</p>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs font-medium uppercase text-mint">Logs</p>
            <div className="mt-3 grid gap-2">
              {logs.filter((log) => log.task_id === task.id).map((log) => (
                <p key={log.id} className="rounded-lg bg-white/6 p-3 text-sm text-slate-300">
                  <span className="font-bold">{log.level}</span> · {log.message}
                </p>
              ))}
            </div>
          </div>
        </article>
      ))}
      {!tasks.length ? <p className="rounded-xl border border-white/10 bg-white/6 p-4 text-sm text-slate-400">Todavia no hay tareas guardadas.</p> : null}
      {message ? <p className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">{message}</p> : null}
    </section>
  );
}
