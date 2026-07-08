import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Provider } from "@/lib/ai/types";
import { getEnvApiKeys } from "@/lib/ai/providers/env";
import { getDecryptedKeys } from "@/lib/vault/service";

export type UserPlan = "free" | "pro";

export async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<UserPlan> {
  const { data } = await supabase.from("profiles").select("plan").eq("id", userId).maybeSingle();
  return data?.plan === "pro" ? "pro" : "free";
}

export async function getPlanApiKeys(
  supabase: SupabaseClient,
  userId: string,
  providers?: Provider[]
) {
  const plan = await getUserPlan(supabase, userId);

  if (plan === "pro") {
    const keys = getEnvApiKeys();
    if (providers?.length) {
      return {
        plan,
        apiKeys: providers.reduce<Partial<Record<Provider, string>>>((acc, provider) => {
          acc[provider] = keys[provider];
          return acc;
        }, {})
      };
    }
    return { plan, apiKeys: keys };
  }

  return { plan, apiKeys: await getDecryptedKeys(supabase, userId, providers) };
}
