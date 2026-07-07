import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-5xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-3 text-sm font-medium text-[#d9cdbc] hover:text-[#fff8eb]">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-mint/40 bg-mint/15 text-mint">AD</span>
          AgentDesk
        </Link>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_28rem]">
          <div>
            <p className="text-xs font-medium uppercase text-mint">Acceso web</p>
            <h1 className="mt-4 font-display text-5xl text-[#fff8eb] md:text-7xl">Tu escritorio de agentes.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#d9cdbc]">
              Inicia sesion, guarda tus API keys cifradas y ejecuta tareas multi-modelo desde el navegador.
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
