import { json, readJson, requireUser } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type RedeemBody = {
  code: string;
};

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response || !user) return response;

  let body: RedeemBody;
  try {
    body = await readJson<RedeemBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) return json({ error: "Escribe una llave Pro." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: license, error: lookupError } = await supabase
    .from("license_keys")
    .select("*")
    .eq("code", code)
    .eq("plan", "pro")
    .maybeSingle();

  if (lookupError) return json({ error: lookupError.message }, { status: 500 });
  if (!license) return json({ error: "La llave Pro no existe." }, { status: 404 });
  if (license.used_by) return json({ error: "Esta llave Pro ya fue usada." }, { status: 409 });

  const { error: updateKeyError } = await supabase
    .from("license_keys")
    .update({ used_by: user.id, used_at: new Date().toISOString() })
    .eq("id", license.id)
    .is("used_by", null);

  if (updateKeyError) return json({ error: updateKeyError.message }, { status: 500 });

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      plan: "pro",
      daily_task_limit: 250
    },
    { onConflict: "id" }
  );

  if (profileError) return json({ error: profileError.message }, { status: 500 });

  return json({ ok: true, plan: "pro" });
}
