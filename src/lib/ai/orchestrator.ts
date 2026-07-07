import { runClaude } from "@/lib/ai/claudeAdapter";
import { runGemini } from "@/lib/ai/geminiAdapter";
import { runOpenAI } from "@/lib/ai/openaiAdapter";
import { defaultModels, type Provider, type ProviderRequest, type ProviderResult, type TaskMode } from "@/lib/ai/types";

type AgentContext = {
  name?: string;
  role?: string;
  description?: string;
  basePrompt?: string;
  favoriteProvider?: Provider;
  model?: string;
};

export type OrchestratorInput = {
  mode: TaskMode;
  prompt: string;
  provider?: Provider;
  providers?: Provider[];
  apiKeys: Partial<Record<Provider, string>>;
  agent?: AgentContext;
  skillPrompts: string[];
};

function buildSystemPrompt(agent: AgentContext | undefined, skillPrompts: string[]) {
  const base = [
    "Eres un agente de AgentDesk. Responde con precision, criterio practico y pasos claros.",
    agent?.role ? `Rol: ${agent.role}` : "",
    agent?.description ? `Descripcion: ${agent.description}` : "",
    agent?.basePrompt ? `Prompt base: ${agent.basePrompt}` : "",
    skillPrompts.length ? `Skills activas:\n${skillPrompts.map((prompt) => `- ${prompt}`).join("\n")}` : ""
  ].filter(Boolean);

  return base.join("\n\n");
}

function pickModel(provider: Provider, agent?: AgentContext) {
  if (agent?.favoriteProvider === provider && agent.model) {
    return agent.model;
  }

  return defaultModels[provider];
}

async function runProvider(provider: Provider, request: Omit<ProviderRequest, "apiKey" | "model">, apiKeys: Partial<Record<Provider, string>>, agent?: AgentContext) {
  const apiKey = apiKeys[provider];

  if (!apiKey) {
    throw new Error(`Falta API key para ${provider}`);
  }

  const fullRequest = {
    ...request,
    apiKey,
    model: pickModel(provider, agent)
  };

  if (provider === "openai") return runOpenAI(fullRequest);
  if (provider === "gemini") return runGemini(fullRequest);
  return runClaude(fullRequest);
}

async function captureProvider(provider: Provider, request: Omit<ProviderRequest, "apiKey" | "model">, apiKeys: Partial<Record<Provider, string>>, agent?: AgentContext): Promise<ProviderResult> {
  const started = Date.now();

  try {
    return await runProvider(provider, request, apiKeys, agent);
  } catch (error) {
    return {
      provider,
      model: pickModel(provider, agent),
      content: "",
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}

function routeProvider(prompt: string, apiKeys: Partial<Record<Provider, string>>, fallback?: Provider): Provider {
  const normalized = prompt.toLowerCase();
  const available = (["openai", "gemini", "claude"] as Provider[]).filter((provider) => apiKeys[provider]);

  if (!available.length) {
    throw new Error("No hay API keys disponibles para ejecutar la tarea");
  }

  if (normalized.includes("codigo") || normalized.includes("code") || normalized.includes("arquitectura")) {
    return available.includes("claude") ? "claude" : available[0];
  }

  if (normalized.includes("rapido") || normalized.includes("resumen") || normalized.length < 600) {
    return available.includes("gemini") ? "gemini" : available[0];
  }

  return fallback && available.includes(fallback) ? fallback : available.includes("openai") ? "openai" : available[0];
}

export async function orchestrateTask(input: OrchestratorInput) {
  const systemPrompt = buildSystemPrompt(input.agent, input.skillPrompts);
  const request = { systemPrompt, userPrompt: input.prompt };
  const selectedProviders = input.providers?.length ? input.providers : (["openai", "gemini", "claude"] as Provider[]);

  if (input.mode === "single") {
    const provider = input.provider ?? input.agent?.favoriteProvider ?? "openai";
    return {
      selectedProvider: provider,
      results: [await captureProvider(provider, request, input.apiKeys, input.agent)]
    };
  }

  if (input.mode === "parallel") {
    const results = await Promise.all(
      selectedProviders.map((provider) => captureProvider(provider, request, input.apiKeys, input.agent))
    );
    return { selectedProvider: selectedProviders.join(","), results };
  }

  if (input.mode === "router") {
    const provider = routeProvider(input.prompt, input.apiKeys, input.agent?.favoriteProvider);
    return {
      selectedProvider: provider,
      results: [await captureProvider(provider, request, input.apiKeys, input.agent)]
    };
  }

  const debateProviders = selectedProviders.slice(0, 3);
  if (debateProviders.length < 3) {
    throw new Error("El modo debate necesita tres providers seleccionados");
  }

  const draft = await captureProvider(debateProviders[0], request, input.apiKeys, input.agent);
  const review = await captureProvider(
    debateProviders[1],
    {
      systemPrompt,
      userPrompt: `Revisa criticamente esta respuesta y mejora sus puntos debiles.\n\nTarea original:\n${input.prompt}\n\nRespuesta:\n${draft.content}`
    },
    input.apiKeys,
    input.agent
  );
  const improved = await captureProvider(
    debateProviders[2],
    {
      systemPrompt,
      userPrompt: `Crea la mejor version final usando la tarea original, el borrador y la revision.\n\nTarea:\n${input.prompt}\n\nBorrador:\n${draft.content}\n\nRevision:\n${review.content}`
    },
    input.apiKeys,
    input.agent
  );

  return {
    selectedProvider: debateProviders.join(" -> "),
    results: [draft, review, improved]
  };
}
