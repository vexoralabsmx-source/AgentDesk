import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptSecret } from "@/lib/security/encryption";
import type { Provider } from "@/lib/ai/types";

type KeyRow = {
  provider: Provider;
  encrypted_key: string;
};

export async function getDecryptedKeys(
  supabase: SupabaseClient,
  userId: string,
  providers?: Provider[]
) {
  let query = supabase.from("api_keys").select("provider, encrypted_key").eq("user_id", userId);

  if (providers?.length) {
    query = query.in("provider", providers);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as KeyRow[]).reduce<Partial<Record<Provider, string>>>((acc, row) => {
    acc[row.provider] = decryptSecret(row.encrypted_key);
    return acc;
  }, {});
}
