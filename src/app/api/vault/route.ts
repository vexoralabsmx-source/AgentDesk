import { encryptSecret, maskSecret } from "@/lib/security/encryption";
import { providers, type Provider } from "@/lib/ai/types";
import { json, readJson, requireUser } from "@/lib/api/http";

type SaveKeyBody = {
  provider: Provider;
  apiKey: string;
};

function isProvider(value: string): value is Provider {
  return providers.includes(value as Provider);
}

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  const { data, error } = await supabase
    .from("api_keys")
    .select("provider, key_hint, updated_at")
    .eq("user_id", user.id)
    .order("provider");

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ keys: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  let body: SaveKeyBody;
  try {
    body = await readJson<SaveKeyBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  if (!isProvider(body.provider)) {
    return json({ error: "Provider invalido" }, { status: 400 });
  }

  if (!body.apiKey || body.apiKey.trim().length < 10) {
    return json({ error: "API key invalida" }, { status: 400 });
  }

  const encrypted = encryptSecret(body.apiKey.trim());
  const { error } = await supabase.from("api_keys").upsert(
    {
      user_id: user.id,
      provider: body.provider,
      encrypted_key: encrypted,
      key_hint: maskSecret(body.apiKey.trim())
    },
    { onConflict: "user_id,provider" }
  );

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ ok: true, key: { provider: body.provider, key_hint: maskSecret(body.apiKey.trim()) } });
}

export async function DELETE(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");

  if (!provider || !isProvider(provider)) {
    return json({ error: "Provider invalido" }, { status: 400 });
  }

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("user_id", user.id)
    .eq("provider", provider);

  if (error) return json({ error: error.message }, { status: 500 });
  return json({ ok: true });
}
