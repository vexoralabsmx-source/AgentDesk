import { orchestrateTask } from "@/lib/ai/orchestrator";
import { providers, type Provider, type TaskMode } from "@/lib/ai/types";
import { json, readJson, requireUser } from "@/lib/api/http";
import { getSkillsByIds } from "@/lib/skills/catalog";
import { assertUserCanRunTask } from "@/lib/tasks/limits";
import { getDecryptedKeys } from "@/lib/vault/service";

type RunTaskBody = {
  mode: TaskMode;
  prompt: string;
  provider?: Provider;
  providers?: Provider[];
  agentId?: string;
};

const modes: TaskMode[] = ["single", "parallel", "debate", "router"];

function cleanProviders(values?: Provider[]) {
  return (values ?? providers).filter((provider) => providers.includes(provider));
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  let body: RunTaskBody;
  try {
    body = await readJson<RunTaskBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  if (!modes.includes(body.mode)) {
    return json({ error: "Modo invalido" }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return json({ error: "La tarea no puede estar vacia" }, { status: 400 });
  }

  try {
    await assertUserCanRunTask(supabase, user.id);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Limite de uso alcanzado" }, { status: 429 });
  }

  const selectedProviders = cleanProviders(body.mode === "single" && body.provider ? [body.provider] : body.providers);

  const { data: agentRow, error: agentError } = body.agentId
    ? await supabase.from("agents").select("*").eq("id", body.agentId).eq("user_id", user.id).single()
    : { data: null, error: null };

  if (agentError) return json({ error: agentError.message }, { status: 404 });

  const agent = agentRow
    ? {
        name: agentRow.name,
        role: agentRow.role,
        description: agentRow.description,
        basePrompt: agentRow.base_prompt,
        favoriteProvider: agentRow.favorite_provider as Provider,
        model: agentRow.model
      }
    : undefined;

  const activeSkillIds = Array.isArray(agentRow?.active_skills) ? agentRow.active_skills : [];
  const skillPrompts = getSkillsByIds(activeSkillIds).map((skill) => skill.prompt);

  let apiKeys: Partial<Record<Provider, string>>;
  try {
    apiKeys = await getDecryptedKeys(supabase, user.id, body.mode === "router" ? undefined : selectedProviders);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "No se pudieron leer las API keys" }, { status: 500 });
  }

  if (!Object.keys(apiKeys).length) {
    return json({ error: "Guarda al menos una API key en API Vault antes de ejecutar tareas" }, { status: 400 });
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      agent_id: body.agentId || null,
      mode: body.mode,
      input: body.prompt.trim(),
      selected_provider: body.provider ?? null,
      status: "running"
    })
    .select("*")
    .single();

  if (taskError) return json({ error: taskError.message }, { status: 500 });

  await supabase.from("task_logs").insert({
    task_id: task.id,
    user_id: user.id,
    level: "info",
    message: `Tarea iniciada en modo ${body.mode}`
  });

  try {
    const result = await orchestrateTask({
      mode: body.mode,
      prompt: body.prompt.trim(),
      provider: body.provider,
      providers: selectedProviders,
      apiKeys,
      agent,
      skillPrompts
    });

    const outputRows = result.results.map((output) => ({
      task_id: task.id,
      user_id: user.id,
      provider: output.provider,
      model: output.model,
      content: output.content,
      error: output.error ?? null,
      latency_ms: output.latencyMs
    }));

    if (outputRows.length) {
      await supabase.from("task_outputs").insert(outputRows);
    }

    const hasErrors = result.results.some((output) => output.error);
    await supabase
      .from("tasks")
      .update({
        status: hasErrors && result.results.every((output) => output.error) ? "failed" : "completed",
        selected_provider: result.selectedProvider,
        error: hasErrors ? "Una o mas respuestas fallaron. Revisa Compare View." : null,
        completed_at: new Date().toISOString()
      })
      .eq("id", task.id)
      .eq("user_id", user.id);

    await supabase.from("task_logs").insert({
      task_id: task.id,
      user_id: user.id,
      level: hasErrors ? "warn" : "info",
      message: hasErrors ? "Tarea completada con errores parciales" : "Tarea completada"
    });

    return json({ taskId: task.id, results: result.results, selectedProvider: result.selectedProvider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error ejecutando tarea";
    await supabase
      .from("tasks")
      .update({ status: "failed", error: message, completed_at: new Date().toISOString() })
      .eq("id", task.id)
      .eq("user_id", user.id);
    await supabase.from("task_logs").insert({
      task_id: task.id,
      user_id: user.id,
      level: "error",
      message
    });

    return json({ error: message, taskId: task.id }, { status: 500 });
  }
}
