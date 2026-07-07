import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { dailyTaskLimit } from "@/lib/env";

export async function assertUserCanRunTask(supabase: SupabaseClient, userId: string) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  if ((count ?? 0) >= dailyTaskLimit) {
    throw new Error(`Limite diario alcanzado (${dailyTaskLimit} tareas)`);
  }
}
