import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null, response: json({ error: "Sesion requerida" }, { status: 401 }) };
  }

  return { supabase, user, response: null };
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("JSON invalido");
  }
}
