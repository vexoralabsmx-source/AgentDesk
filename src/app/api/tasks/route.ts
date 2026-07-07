import { json, requireUser } from "@/lib/api/http";

export async function GET() {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("id, mode, input, selected_provider, status, error, created_at, completed_at, agent_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return json({ error: error.message }, { status: 500 });

  const ids = (tasks ?? []).map((task: { id: string }) => task.id);
  const { data: outputs } = ids.length
    ? await supabase.from("task_outputs").select("*").in("task_id", ids).eq("user_id", user.id).order("created_at")
    : { data: [] };
  const { data: logs } = ids.length
    ? await supabase.from("task_logs").select("*").in("task_id", ids).eq("user_id", user.id).order("created_at")
    : { data: [] };

  return json({ tasks: tasks ?? [], outputs: outputs ?? [], logs: logs ?? [] });
}
