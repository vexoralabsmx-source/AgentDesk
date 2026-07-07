import { PageHeader } from "@/components/dashboard/PageHeader";
import { dailyTaskLimit } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const { user } = await getCurrentUser();

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
              <dd className="text-slate-100">Free</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Limite diario</dt>
              <dd className="text-slate-100">{dailyTaskLimit} tareas</dd>
            </div>
          </dl>
        </article>
        <article className="glass rounded-2xl p-6">
          <h2 className="text-xl font-black">Deploy</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
            <p>Configura variables de entorno en Vercel o Netlify.</p>
            <p>Ejecuta `supabase/schema.sql` en Supabase antes de publicar.</p>
            <p>Usa `npm run build` como build command.</p>
          </div>
        </article>
      </section>
    </>
  );
}
