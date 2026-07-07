"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();

    const action = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });

    const { error } = await action;
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "register") {
      setMessage("Cuenta creada. Revisa tu correo si Supabase requiere confirmacion.");
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="glass mx-auto w-full max-w-md p-6">
      <div className="mb-6 flex rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${mode === "login" ? "bg-[#fff8eb] text-ink" : "text-[#d9cdbc]"}`}
          onClick={() => setMode("login")}
          type="button"
        >
          Login
        </button>
        <button
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium ${mode === "register" ? "bg-[#fff8eb] text-ink" : "text-[#d9cdbc]"}`}
          onClick={() => setMode("register")}
          type="button"
        >
          Register
        </button>
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm text-slate-300">
          Email
          <input
            className="field mt-2"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block text-sm text-slate-300">
          Password
          <input
            className="field mt-2"
            type="password"
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {message ? <p className="rounded-lg border border-white/10 bg-white/7 p-3 text-sm text-slate-200">{message}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Procesando..." : mode === "login" ? "Entrar al dashboard" : "Crear cuenta"}
        </Button>
      </form>
    </div>
  );
}
