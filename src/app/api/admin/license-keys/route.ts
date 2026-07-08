import crypto from "node:crypto";
import { adminEmail, isAdminEmail } from "@/lib/admin/config";
import { json, readJson, requireUser } from "@/lib/api/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateKeysBody = {
  count?: number;
};

function makeCode() {
  const raw = crypto.randomBytes(9).toString("base64url").toUpperCase();
  return `PRO-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response || !user) return response;

  if (!isAdminEmail(user.email)) {
    return json({ error: `Solo ${adminEmail} puede entrar al panel admin.` }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("license_keys")
    .select("id, code, plan, used_by, used_at, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ keys: data ?? [] });
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response || !user) return response;

  if (!isAdminEmail(user.email)) {
    return json({ error: `Solo ${adminEmail} puede crear llaves Pro.` }, { status: 403 });
  }

  let body: CreateKeysBody;
  try {
    body = await readJson<CreateKeysBody>(request);
  } catch {
    body = {};
  }

  const count = Math.min(Math.max(Number(body.count ?? 1), 1), 25);
  const rows = Array.from({ length: count }, () => ({
    code: makeCode(),
    plan: "pro",
    created_by: user.id
  }));

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("license_keys").insert(rows).select("*");

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ keys: data ?? [] });
}
