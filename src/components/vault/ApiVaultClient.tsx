"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Provider } from "@/lib/ai/types";

type SavedKey = {
  provider: Provider;
  key_hint: string;
  updated_at: string;
};

const providerLabels: Record<Provider, string> = {
  openai: "OpenAI",
  gemini: "Gemini"
};

export function ApiVaultClient() {
  const [keys, setKeys] = useState<SavedKey[]>([]);
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadKeys() {
    const response = await fetch("/api/vault");
    const data = await response.json();
    if (response.ok) setKeys(data.keys ?? []);
    else setMessage(data.error ?? "No se pudo cargar el vault");
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function saveKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "No se pudo guardar la key");
      return;
    }

    setApiKey("");
    setMessage("Key guardada cifrada.");
    await loadKeys();
  }

  async function deleteKey(target: Provider) {
    if (!window.confirm(`Borrar la key de ${providerLabels[target]}?`)) return;
    const response = await fetch(`/api/vault?provider=${target}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "No se pudo borrar");
    else {
      setMessage("Key eliminada.");
      await loadKeys();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form className="glass rounded-2xl p-6" onSubmit={saveKey}>
        <h2 className="text-xl font-black">Guardar API key</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm text-slate-300">
            Provider
            <select className="field mt-2" value={provider} onChange={(event) => setProvider(event.target.value as Provider)}>
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            API key
            <input
              className="field mt-2"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Pega tu key privada"
              required
            />
          </label>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar cifrada"}
          </Button>
          {message ? <p className="rounded-lg border border-white/10 bg-white/7 p-3 text-sm text-slate-200">{message}</p> : null}
        </div>
      </form>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-black">Keys conectadas</h2>
        <div className="mt-5 grid gap-3">
          {(["openai", "gemini"] as Provider[]).map((item) => {
            const saved = keys.find((key) => key.provider === item);
            return (
              <div key={item} className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-white/6 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-bold">{providerLabels[item]}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {saved ? `${saved.key_hint} · ${new Date(saved.updated_at).toLocaleDateString()}` : "Sin conectar"}
                  </p>
                </div>
                {saved ? (
                  <Button type="button" variant="danger" onClick={() => deleteKey(item)}>
                    Borrar
                  </Button>
                ) : (
                  <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-slate-400">Pendiente</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
