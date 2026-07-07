"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";

const nav = [
  { href: "/dashboard", label: "Overview", icon: "01" },
  { href: "/dashboard/api-vault", label: "API Vault", icon: "02" },
  { href: "/dashboard/agent-builder", label: "Agent Builder", icon: "03" },
  { href: "/dashboard/skill-store", label: "Skill Store", icon: "04" },
  { href: "/dashboard/task-runner", label: "Task Runner", icon: "05" },
  { href: "/dashboard/compare", label: "Compare View", icon: "06" },
  { href: "/dashboard/history", label: "Task History", icon: "07" },
  { href: "/dashboard/settings", label: "Settings", icon: "08" }
];

export function DashboardShell({ children, email }: { children: React.ReactNode; email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-white/10 bg-[#171412]/92 p-4 backdrop-blur lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between lg:block">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-mint/35 bg-mint/12 text-sm font-medium text-mint">AD</span>
            <span>
              <span className="block font-display text-xl text-[#fff8eb]">AgentDesk</span>
              <span className="block text-xs text-[#a99d8e]">Web AI workspace</span>
            </span>
          </Link>
          <Button className="lg:hidden" variant="ghost" onClick={signOut}>
            Salir
          </Button>
        </div>

        <nav className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                  active ? "border border-mint/35 bg-mint/14 text-[#fff8eb]" : "border border-transparent text-[#cdbfaf] hover:border-white/8 hover:bg-white/6 hover:text-[#fff8eb]"
                }`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-md text-xs ${active ? "bg-mint/14 text-mint" : "bg-white/6 text-[#a99d8e]"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 hidden rounded-lg border border-white/10 bg-white/5 p-4 lg:block">
          <p className="text-xs uppercase text-mint">Sesion</p>
          <p className="mt-2 break-words text-sm text-[#e8dccb]">{email}</p>
          <Button className="mt-4 w-full" variant="secondary" onClick={signOut}>
            Cerrar sesion
          </Button>
        </div>
      </aside>

      <main className="w-full px-4 py-6 lg:ml-72 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
