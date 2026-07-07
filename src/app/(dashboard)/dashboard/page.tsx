import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";

const cards = [
  { href: "/dashboard/api-vault", title: "API Vault", text: "Guarda keys cifradas y administralas por provider." },
  { href: "/dashboard/agent-builder", title: "Agent Builder", text: "Crea agentes con rol, prompt, modelo y skills." },
  { href: "/dashboard/task-runner", title: "Task Runner", text: "Ejecuta single, parallel, debate o router." },
  { href: "/dashboard/compare", title: "Compare View", text: "Compara outputs y fusiona la mejor respuesta." }
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Dashboard web" title="Centro de control para agentes multi-modelo." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:border-mint/40">
            <h2 className="text-2xl text-[#fff8eb]">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#b9ad9c]">{card.text}</p>
          </Link>
        ))}
      </section>
      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-medium uppercase text-mint">Flujo recomendado</p>
          <div className="mt-5 grid gap-3">
            {["Conecta keys en API Vault", "Activa skills relevantes", "Crea un agente", "Ejecuta y compara resultados"].map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/6 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/8 text-sm font-medium text-mint">{index + 1}</span>
                <span className="font-medium text-[#efe4d4]">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-medium uppercase text-solar">Uso</p>
          <h2 className="mt-4 text-4xl text-[#fff8eb]">25 tareas/dia</h2>
          <p className="mt-3 text-sm leading-6 text-[#b9ad9c]">
            Limite basico por usuario configurable con `DEFAULT_DAILY_TASK_LIMIT`.
          </p>
        </div>
      </section>
    </>
  );
}
