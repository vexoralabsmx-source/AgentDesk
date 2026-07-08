import Link from "next/link";

const capabilities = [
  "Vault cifrado para OpenAI y Gemini",
  "Agentes con prompt base y skills",
  "Single, parallel, debate y router",
  "Historial, outputs y logs"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-mint/40 bg-mint/15 text-sm font-semibold text-mint">AD</span>
          <span className="font-display text-xl text-[#fff8eb]">AgentDesk</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link className="rounded-lg px-4 py-2 text-sm font-medium text-[#d9cdbc] hover:bg-white/7" href="/login">
            Login
          </Link>
          <Link className="rounded-lg border border-mint/60 bg-mint px-4 py-2 text-sm font-medium text-ink shadow-soft hover:bg-[#f0c58f]" href="/login">
            Crear workspace
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-7xl items-center gap-12 px-4 pb-16 pt-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-medium uppercase text-mint">
            Plataforma web SaaS
          </p>
          <h1 className="max-w-4xl font-display text-6xl text-[#fff8eb] md:text-8xl">
            AgentDesk
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d9cdbc]">
            Una interfaz limpia para conectar tus API keys, crear agentes y trabajar con
            OpenAI y Gemini desde un dashboard web sobrio, rapido y seguro.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="rounded-lg border border-mint/60 bg-mint px-6 py-3 text-center font-medium text-ink shadow-soft hover:bg-[#f0c58f]" href="/login">
              Entrar al dashboard
            </Link>
            <Link className="rounded-lg border border-white/12 px-6 py-3 text-center font-medium text-[#fff8eb] hover:bg-white/7" href="#arquitectura">
              Ver arquitectura
            </Link>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {capabilities.map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-[#e8dccb]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass relative p-4 shadow-glow">
          <div className="rounded-lg border border-white/10 bg-[#181411] p-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase text-mint">Task Runner</p>
                <h2 className="mt-2 text-3xl text-[#fff8eb]">Parallel execution</h2>
              </div>
              <span className="rounded-full border border-solar/20 bg-solar/12 px-3 py-1 text-xs font-medium text-solar">Live</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {["OpenAI", "Gemini"].map((provider, index) => (
                <div key={provider} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">{provider}</span>
                    <span className="h-2 w-2 rounded-full bg-mint/80" />
                  </div>
                  <div className="space-y-2">
                    <span className="block h-2 rounded-full bg-white/14" />
                    <span className="block h-2 rounded-full bg-white/10" />
                    <span className={`block h-2 rounded-full ${index === 1 ? "w-7/12 bg-mint/55" : "w-10/12 bg-white/10"}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-mint/20 bg-mint/8 p-4">
              <p className="text-sm font-medium text-mint">Fusionar mejor respuesta</p>
              <p className="mt-2 text-sm leading-6 text-[#d9cdbc]">
                Orquesta, compara y guarda outputs por provider sin exponer keys al navegador.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="arquitectura" className="border-t border-white/10 bg-black/10 px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {["Supabase Auth", "PostgreSQL + RLS", "API routes seguras", "Planes Free y Pro"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-5">
              <h3 className="font-display text-xl text-[#fff8eb]">{item}</h3>
              <p className="mt-3 text-sm leading-6 text-[#b9ad9c]">Base simple, mantenible y lista para crecer sin mover secretos al cliente.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
