"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { defaultModels, type Provider } from "@/lib/ai/types";

type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
  base_prompt: string;
  favorite_provider: Provider;
  model: string;
  active_skills: string[];
};

type Skill = {
  id: string;
  title: string;
  enabled: boolean;
};

export function AgentBuilderClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    role: "",
    description: "",
    basePrompt: "",
    favoriteProvider: "openai" as Provider,
    model: defaultModels.openai,
    activeSkills: [] as string[]
  });

  async function load() {
    const [agentsResponse, skillsResponse] = await Promise.all([fetch("/api/agents"), fetch("/api/skills")]);
    const agentsData = await agentsResponse.json();
    const skillsData = await skillsResponse.json();
    if (agentsResponse.ok) setAgents(agentsData.agents ?? []);
    if (skillsResponse.ok) setSkills((skillsData.skills ?? []).filter((skill: Skill) => skill.enabled));
  }

  useEffect(() => {
    load();
  }, []);

  function updateProvider(provider: Provider) {
    setForm((current) => ({
      ...current,
      favoriteProvider: provider,
      model: current.model || defaultModels[provider]
    }));
  }

  function toggleSkill(skillId: string) {
    setForm((current) => ({
      ...current,
      activeSkills: current.activeSkills.includes(skillId)
        ? current.activeSkills.filter((id) => id !== skillId)
        : [...current.activeSkills, skillId]
    }));
  }

  function edit(agent: Agent) {
    setForm({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      description: agent.description,
      basePrompt: agent.base_prompt,
      favoriteProvider: agent.favorite_provider,
      model: agent.model || defaultModels[agent.favorite_provider],
      activeSkills: agent.active_skills ?? []
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "No se pudo guardar el agente");
      return;
    }
    setMessage("Agente guardado.");
    setForm((current) => ({ ...current, id: "", name: "", role: "", description: "", basePrompt: "" }));
    await load();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <form className="glass rounded-2xl p-6" onSubmit={submit}>
        <h2 className="text-xl font-black">Configurar agente</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-slate-300">
            Nombre
            <input className="field mt-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="block text-sm text-slate-300">
            Rol
            <input className="field mt-2" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required />
          </label>
          <label className="block text-sm text-slate-300 md:col-span-2">
            Descripcion
            <input className="field mt-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            Provider favorito
            <select className="field mt-2" value={form.favoriteProvider} onChange={(event) => updateProvider(event.target.value as Provider)}>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Modelo
            <input className="field mt-2" value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300 md:col-span-2">
            Prompt base
            <textarea className="field mt-2 min-h-36" value={form.basePrompt} onChange={(event) => setForm({ ...form, basePrompt: event.target.value })} required />
          </label>
        </div>
        <div className="mt-5">
          <p className="mb-3 text-sm font-bold text-slate-200">Skills activas</p>
          <div className="flex flex-wrap gap-2">
            {skills.length ? skills.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.id)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  form.activeSkills.includes(skill.id) ? "border-mint bg-mint text-ink" : "border-white/10 bg-white/7 text-slate-300"
                }`}
              >
                {skill.title}
              </button>
            )) : <span className="text-sm text-slate-400">Activa skills en Skill Store.</span>}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="submit">{form.id ? "Actualizar agente" : "Crear agente"}</Button>
          {form.id ? <Button type="button" variant="secondary" onClick={() => setForm({ ...form, id: "", name: "", role: "", description: "", basePrompt: "" })}>Nuevo</Button> : null}
        </div>
        {message ? <p className="mt-4 rounded-lg border border-white/10 bg-white/7 p-3 text-sm text-slate-200">{message}</p> : null}
      </form>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-black">Agentes guardados</h2>
        <div className="mt-5 grid gap-3">
          {agents.map((agent) => (
            <button key={agent.id} className="rounded-xl border border-white/10 bg-white/6 p-4 text-left transition hover:border-mint/40" onClick={() => edit(agent)}>
              <p className="font-bold">{agent.name}</p>
              <p className="mt-1 text-sm text-slate-400">{agent.role} · {agent.favorite_provider}</p>
            </button>
          ))}
          {!agents.length ? <p className="text-sm text-slate-400">Aun no hay agentes.</p> : null}
        </div>
      </section>
    </div>
  );
}
