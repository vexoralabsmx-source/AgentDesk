import { runOpenAI } from "@/lib/ai/openaiAdapter";
import { runGemini } from "@/lib/ai/geminiAdapter";
import { runClaude } from "@/lib/ai/claudeAdapter";
import { defaultModels, providers, type Provider } from "@/lib/ai/types";
import { json, readJson, requireUser } from "@/lib/api/http";
import { getDecryptedKeys } from "@/lib/vault/service";

type FuseBody = {
  taskId: string;
  provider?: Provider;
};

async function runFusion(provider: Provider, apiKey: string, source: string) {
  const request = {
    apiKey,
    model: defaultModels[provider],
    systemPrompt: "Fusiona respuestas de IA en una version final clara, util y sin duplicacion.",
    userPrompt: source
  };

  if (provider === "openai") return runOpenAI(request);
  if (provider === "gemini") return runGemini(request);
  return runClaude(request);
}

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  let body: FuseBody;
  try {
    body = await readJson<FuseBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  if (!body.taskId) return json({ error: "taskId requerido" }, { status: 400 });

  const { data: task } = await supabase.from("tasks").select("*").eq("id", body.taskId).eq("user_id", user.id).single();
  if (!task) return json({ error: "Tarea no encontrada" }, { status: 404 });

  const { data: outputs, error } = await supabase
    .from("task_outputs")
    .select("provider, content, error")
    .eq("task_id", body.taskId)
    .eq("user_id", user.id)
    .is("error", null);

  if (error) return json({ error: error.message }, { status: 500 });
  if (!outputs?.length) return json({ error: "No hay respuestas validas para fusionar" }, { status: 400 });

  const apiKeys = await getDecryptedKeys(supabase, user.id);
  const provider = body.provider && providers.includes(body.provider)
    ? body.provider
    : providers.find((item) => apiKeys[item]);

  if (!provider || !apiKeys[provider]) {
    return json({ error: "No hay API key disponible para fusionar" }, { status: 400 });
  }

  const source = [
    `Tarea original:\n${task.input}`,
    ...outputs.map((output: { provider: string; content: string }) => `Respuesta ${output.provider}:\n${output.content}`)
  ].join("\n\n---\n\n");

  try {
    const result = await runFusion(provider, apiKeys[provider], source);
    await supabase.from("task_outputs").insert({
      task_id: body.taskId,
      user_id: user.id,
      provider: "fusion",
      model: `${provider}:${result.model}`,
      content: result.content,
      latency_ms: result.latencyMs
    });
    await supabase.from("task_logs").insert({
      task_id: body.taskId,
      user_id: user.id,
      level: "info",
      message: `Respuesta fusionada con ${provider}`
    });

    return json({ result });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "No se pudo fusionar" }, { status: 500 });
  }
}
