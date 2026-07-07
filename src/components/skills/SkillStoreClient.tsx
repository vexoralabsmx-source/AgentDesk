"use client";

import { useEffect, useState } from "react";

type SkillView = {
  id: string;
  title: string;
  category: string;
  description: string;
  enabled: boolean;
};

export function SkillStoreClient() {
  const [skills, setSkills] = useState<SkillView[]>([]);
  const [message, setMessage] = useState("");

  async function loadSkills() {
    const response = await fetch("/api/skills");
    const data = await response.json();
    if (response.ok) setSkills(data.skills ?? []);
    else setMessage(data.error ?? "No se pudieron cargar skills");
  }

  useEffect(() => {
    loadSkills();
  }, []);

  async function toggle(skillId: string, enabled: boolean) {
    setSkills((current) => current.map((skill) => (skill.id === skillId ? { ...skill, enabled } : skill)));
    const response = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillId, enabled })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "No se pudo actualizar");
      await loadSkills();
    }
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {skills.map((skill) => (
        <article key={skill.id} className="glass rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-mint">{skill.category}</p>
              <h2 className="mt-3 text-2xl text-[#fff8eb]">{skill.title}</h2>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={skill.enabled}
                onChange={(event) => toggle(skill.id, event.target.checked)}
              />
              <span className="h-7 w-12 rounded-full bg-white/12 transition peer-checked:bg-mint" />
              <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5 peer-checked:bg-ink" />
            </label>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{skill.description}</p>
        </article>
      ))}
      {message ? <p className="md:col-span-2 xl:col-span-3 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">{message}</p> : null}
    </section>
  );
}
