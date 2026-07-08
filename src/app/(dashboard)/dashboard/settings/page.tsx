import { PageHeader } from "@/components/dashboard/PageHeader";
import { RedeemPlanClient } from "@/components/billing/RedeemPlanClient";
import { adminEmail } from "@/lib/admin/config";
import { dailyTaskLimit } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const { supabase, user } = await getCurrentUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("plan, daily_task_limit").eq("id", user.id).maybeSingle()
    : { data: null };
  const plan = profile?.plan === "pro" ? "Pro" : "Free";
  const limit = profile?.daily_task_limit ?? dailyTaskLimit;

  return (
    <>
      <PageHeader eyebrow="Settings" title="Configuracion del workspace." />
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="glass rounded-2xl p-6">
          <h2 className="text-xl font-black">Cuenta</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-400">Email</dt>
              <dd className="break-all text-slate-100">{user?.email}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
              <dt className="text-slate-400">Plan</dt>
              <dd className="text-slate-100">{plan}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Limite diario</dt>
              <dd className="text-slate-100">{limit} tareas</dd>
            </div>
          </dl>
        </article>
        <article className="glass rounded-2xl p-6">
          <h2 className="text-xl font-black">Planes</h2>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-300">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-medium text-[#fff8eb]">Free</p>
              <p className="mt-1">Usa tus propias API keys guardadas en API Vault.</p>
            </div>
            <div className="rounded-lg border border-mint/25 bg-mint/10 p-4">
              <p className="font-medium text-[#fff8eb]">Pro</p>
              <p className="mt-1">Activa keys predeterminadas del servidor y mas capacidad diaria.</p>
              <p className="mt-2 text-mint">Para comprar tu plan escribe a {adminEmail}.</p>
            </div>
          </div>
          <RedeemPlanClient />
        </article>
      </section>
    </>
  );
}
