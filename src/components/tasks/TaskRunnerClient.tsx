"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Provider, TaskMode } from "@/lib/ai/types";

type Agent = {
  id: string;
  name: string;
};

type Result = {
  provider: string;
  model: string;
  content: string;
  error?: string;
  latencyMs: number;
};

const providerList: Provider[] = ["openai", "gemini", "claude"];

export function TaskRunnerClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [mode, setMode] = useState<TaskMode>("single");
  const [provider, setProvider] = useState<Provider>("openai");
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>(providerList);
  const [agentId, setAgentId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/agents")
      .then((response) => response.json())
      .then((data) => setAgents(data.agents ?? []))
      .catch(() => setMessage("No se pudieron cargar agentes"));
  }, []);

  function toggleProvider(target: Provider) {
    setSelectedProviders((current) =>
      current.includes(target) ? current.filter((item) => item !== target) : [...current, target]
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setResults([]);

    if ((mode === "parallel" || mode === "debate") && !window.confirm(`Ejecutar modo ${mode}? Usara varias API keys.`)) {
      return;
    }

    setLoading(true);
    const response = await fetch("/api/tasks/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        provider,
        providers: selectedProviders,
        agentId: agentId || undefined,
        prompt
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "No se pudo ejecutar la tarea");
      return;
    }

    setResults(data.results ?? []);
    setMessage(`Tarea guardada. Provider: ${data.selectedProvider}`);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form className="glass rounded-2xl p-6" onSubmit={submit}>
        <h2 className="text-xl font-black">Nueva tarea</h2>
        <div className="mt-5 grid gap-4">
          <label className="block text-sm text-slate-300">
            Agente
            <select className="field mt-2" value={agentId} onChange={(event) => setAgentId(event.target.value)}>
              <option value="">Sin agente</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-2 text-sm text-slate-300">Modo</p>
            <div className="grid gap-2 sm:grid-cols-4">
              {(["single", "parallel", "debate", "router"] as TaskMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-xl border px-3 py-3 text-sm font-bold transition ${
                    mode === item ? "border-mint bg-mint text-ink" : "border-white/10 bg-white/7 text-slate-300"
                  }`}
                  onClick={() => setMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {mode === "single" ? (
            <label className="block text-sm text-slate-300">
              Provider
              <select className="field mt-2" value={provider} onChange={(event) => setProvider(event.target.value as Provider)}>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
              </select>
            </label>
          ) : mode !== "router" ? (
            <div>
              <p className="mb-2 text-sm text-slate-300">Providers</p>
              <div className="flex flex-wrap gap-2">
                {providerList.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                      selectedProviders.includes(item) ? "border-mint bg-mint text-ink" : "border-white/10 bg-white/7 text-slate-300"
                    }`}
                    onClick={() => toggleProvider(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <label className="block text-sm text-slate-300">
            Tarea
            <textarea
              className="field mt-2 min-h-44"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe la tarea que quieres ejecutar"
              required
            />
          </label>

          <Button type="submit" disabled={loading}>
            {loading ? "Ejecutando..." : "Ejecutar tarea"}
          </Button>
          {message ? <p className="rounded-lg border border-white/10 bg-white/7 p-3 text-sm text-slate-200">{message}</p> : null}
        </div>
      </form>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-black">Resultados recientes</h2>
        <div className="mt-5 grid gap-3">
          {results.map((result) => (
            <article key={`${result.provider}-${result.model}`} className="rounded-xl border border-white/10 bg-white/6 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{result.provider}</h3>
                <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-slate-300">{result.model} · {result.latencyMs}ms</span>
              </div>
              {result.error ? (
                <p className="mt-3 text-sm text-red-200">{result.error}</p>
              ) : (
                <pre className="scrollbar-soft mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">{result.content}</pre>
              )}
            </article>
          ))}
          {!results.length ? <p className="text-sm text-slate-400">Los resultados apareceran aqui al ejecutar una tarea.</p> : null}
        </div>
      </section>
    </div>
  );
}
