"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function RedeemPlanClient() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function redeem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/billing/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error ?? "No se pudo canjear la llave.");
      return;
    }

    setMessage("Plan Pro activado. Recarga la pagina para ver el cambio.");
    setCode("");
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={redeem}>
      <label className="block text-sm text-slate-300">
        Llave Pro
        <input
          className="field mt-2"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="PRO-XXXX-XXXX-XXXX"
        />
      </label>
      <Button type="submit" disabled={loading}>
        {loading ? "Canjeando..." : "Activar Pro"}
      </Button>
      {message ? <p className="rounded-lg border border-white/10 bg-white/6 p-3 text-sm text-slate-200">{message}</p> : null}
    </form>
  );
}
