"use client";

import { useEffect, useMemo, useState } from "react";
import { systemAgents } from "@/config/agents";
import { defaultModels, type Provider } from "@/lib/ai/types";
import { Button } from "@/components/ui/Button";

type ChatMode = "individual" | "compare" | "team" | "debate";

type ChatResult = {
  provider: Provider;
  model: string;
  content: string;
  latencyMs: number;
  error?: string;
  agentId: string;
  agentName: string;
};

type ConversationItem = {
  id: string;
  message: string;
  answer: string;
  provider: string;
  model: string;
  agent: string;
  mode: ChatMode;
  createdAt: string;
  results: ChatResult[];
};

const storageKey = "agentdesk.chat.history";
const providerLabels: Record<Provider, string> = {
  openai: "OpenAI",
  claude: "Claude",
  gemini: "Gemini"
};
const providerOptions: Provider[] = ["openai", "claude", "gemini"];
const modelOptions: Record<Provider, string[]> = {
  openai: ["gpt-4o-mini"],
  claude: ["claude-3-5-haiku-latest"],
  gemini: ["gemini-1.5-flash"]
};
const modeLabels: Record<ChatMode, string> = {
  individual: "Individual",
  compare: "Comparar",
  team: "Equipo",
  debate: "Debate"
};

export function ChatWorkspaceClient() {
  const [message, setMessage] = useState("");
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState(defaultModels.openai);
  const [agentId, setAgentId] = useState(systemAgents[0].id);
  const [mode, setMode] = useState<ChatMode>("individual");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["atlas-director", "nova-coder", "shield-guard"]);
  const [history, setHistory] = useState<ConversationItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const activeAgent = useMemo(
    () => systemAgents.find((agent) => agent.id === agentId) ?? systemAgents[0],
    [agentId]
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setHistory(JSON.parse(saved) as ConversationItem[]);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    setModel(modelOptions[provider][0]);
  }, [provider]);

  function persist(items: ConversationItem[]) {
    setHistory(items);
    window.localStorage.setItem(storageKey, JSON.stringify(items.slice(0, 30)));
  }

  function toggleAgent(targetId: string) {
    setSelectedAgents((current) =>
      current.includes(targetId) ? current.filter((item) => item !== targetId) : [...current, targetId]
    );
  }

  function clearConversation() {
    persist([]);
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanMessage = message.trim();
    setError("");

    if (!cleanMessage) {
      setError("Escribe un mensaje para iniciar.");
      return;
    }

    if (cleanMessage.length > 8000) {
      setError("Tu mensaje es demasiado largo. Reduce el texto y vuelve a intentar.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: cleanMessage,
        provider,
        model,
        agentId,
        mode,
        selectedAgents
      })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "No se pudo completar la solicitud.");
      if (data.results?.length) {
        const item: ConversationItem = {
          id: crypto.randomUUID(),
          message: cleanMessage,
          answer: data.error ?? "Error",
          provider,
          model,
          agent: activeAgent.name,
          mode,
          createdAt: new Date().toISOString(),
          results: data.results
        };
        persist([item, ...history]);
      }
      return;
    }

    const item: ConversationItem = {
      id: crypto.randomUUID(),
      message: cleanMessage,
      answer: data.answer,
      provider: data.providerUsed,
      model: data.modelUsed,
      agent: data.agentUsed,
      mode: data.mode,
      createdAt: new Date().toISOString(),
      results: data.results ?? []
    };

    persist([item, ...history]);
    setMessage("");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[23rem_1fr]">
      <aside className="glass p-5">
        <div>
          <p className="text-xs font-medium uppercase text-mint">Configuracion</p>
          <h2 className="mt-2 text-2xl text-[#fff8eb]">Chat Workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Elige un agente, provider y modo. Las API keys viven solo en el backend.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block text-sm text-slate-300">
            Modo de trabajo
            <select className="field mt-2" value={mode} onChange={(event) => setMode(event.target.value as ChatMode)}>
              {Object.entries(modeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Provider
            <select className="field mt-2" value={provider} onChange={(event) => setProvider(event.target.value as Provider)}>
              {providerOptions.map((item) => (
                <option key={item} value={item}>{providerLabels[item]}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Modelo
            <select className="field mt-2" value={model} onChange={(event) => setModel(event.target.value)}>
              {modelOptions[provider].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Agente principal
            <select className="field mt-2" value={agentId} onChange={(event) => setAgentId(event.target.value)}>
              {systemAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-slate-200">Agentes para modo equipo</p>
          <div className="grid gap-2">
            {systemAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => toggleAgent(agent.id)}
                className={`rounded-lg border p-3 text-left transition ${
                  selectedAgents.includes(agent.id)
                    ? "border-mint/50 bg-mint/12"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span className="block text-sm font-medium text-[#fff8eb]">{agent.name}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">{agent.role}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <form className="glass p-5" onSubmit={submit}>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-medium uppercase text-mint">{activeAgent.role}</p>
              <h2 className="mt-1 text-2xl text-[#fff8eb]">{activeAgent.name}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{activeAgent.description}</p>
            </div>
            <Button type="button" variant="secondary" onClick={clearConversation}>
              Limpiar conversacion
            </Button>
          </div>

          <label className="mt-5 block text-sm text-slate-300">
            Mensaje
            <textarea
              className="field mt-2 min-h-36"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe que necesitas resolver..."
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" disabled={loading}>
              {loading ? "Pensando..." : "Enviar a agentes"}
            </Button>
            <p className="text-sm text-slate-400">
              {mode === "compare" ? "Comparar usa los 3 providers." : mode === "team" ? "Equipo coordina varios agentes." : "Respuesta directa con el agente seleccionado."}
            </p>
          </div>

          {error ? <p className="mt-4 rounded-lg border border-red-300/20 bg-red-500/12 p-3 text-sm text-red-100">{error}</p> : null}
        </form>

        <section className="mt-5 space-y-4">
          {history.map((item) => (
            <article key={item.id} className="glass p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  <h3 className="mt-2 text-lg font-medium text-[#fff8eb]">{item.message}</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
                  {modeLabels[item.mode]} · {item.provider}
                </span>
              </div>

              <pre className="scrollbar-soft mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">
                {item.answer}
              </pre>

              {item.results.length > 1 ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  {item.results.map((result) => (
                    <div key={`${item.id}-${result.provider}-${result.agentId}`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#fff8eb]">{result.agentName}</p>
                        <span className="text-xs text-slate-500">{result.provider}</span>
                      </div>
                      {result.error ? (
                        <p className="mt-2 text-xs leading-5 text-red-100">{result.error}</p>
                      ) : (
                        <p className="mt-2 line-clamp-6 text-xs leading-5 text-slate-400">{result.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          {!history.length ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-400">
              Aun no hay conversacion. Prueba con Atlas Director para dividir una tarea, o usa modo Equipo para combinar desarrollo, UX y seguridad.
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
