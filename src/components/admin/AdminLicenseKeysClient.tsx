"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type LicenseKey = {
  id: string;
  code: string;
  plan: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
};

export function AdminLicenseKeysClient() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadKeys() {
    const response = await fetch("/api/admin/license-keys");
    const data = await response.json();
    if (response.ok) setKeys(data.keys ?? []);
    else setMessage(data.error ?? "No se pudieron cargar las llaves.");
  }

  useEffect(() => {
    loadKeys();
  }, []);

  async function createKeys(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/license-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "No se pudieron crear llaves.");
      return;
    }

    setMessage(`${data.keys?.length ?? 0} llave(s) Pro creada(s).`);
    await loadKeys();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <form className="glass p-5" onSubmit={createKeys}>
        <p className="text-xs font-medium uppercase text-mint">Admin</p>
        <h2 className="mt-2 text-2xl text-[#fff8eb]">Crear llaves Pro</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Cada llave se puede canjear una sola vez para activar el plan Pro.
        </p>
        <label className="mt-5 block text-sm text-slate-300">
          Cantidad
          <input
            className="field mt-2"
            type="number"
            min={1}
            max={25}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
        <Button className="mt-4" type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear llaves"}
        </Button>
        {message ? <p className="mt-4 rounded-lg border border-white/10 bg-white/6 p-3 text-sm text-slate-200">{message}</p> : null}
      </form>

      <section className="glass p-5">
        <h2 className="text-2xl text-[#fff8eb]">Llaves recientes</h2>
        <div className="mt-5 grid gap-3">
          {keys.map((item) => (
            <article key={item.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                <code className="text-sm text-mint">{item.code}</code>
                <span className={`rounded-full px-3 py-1 text-xs ${item.used_by ? "bg-solar/15 text-solar" : "bg-mint/15 text-mint"}`}>
                  {item.used_by ? "Usada" : "Disponible"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Creada: {new Date(item.created_at).toLocaleString()}
                {item.used_at ? ` · Usada: ${new Date(item.used_at).toLocaleString()}` : ""}
              </p>
            </article>
          ))}
          {!keys.length ? <p className="text-sm text-slate-400">Todavia no hay llaves creadas.</p> : null}
        </div>
      </section>
    </div>
  );
}
