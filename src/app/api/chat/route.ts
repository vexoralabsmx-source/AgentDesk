import { systemAgents } from "@/config/agents";
import { providers, type Provider } from "@/lib/ai/types";
import { json, readJson, requireUser } from "@/lib/api/http";
import { checkRateLimit } from "@/lib/api/rateLimit";
import { getPlanApiKeys } from "@/lib/billing/planKeys";
import { runChat, type ChatMode } from "@/lib/chat/orchestrator";

type ChatBody = {
  message: string;
  provider: Provider;
  model?: string;
  agentId: string;
  mode: ChatMode;
  selectedAgents?: string[];
};

const modes: ChatMode[] = ["individual", "compare", "team", "debate"];
const maxMessageLength = 8000;

export async function POST(request: Request) {
  const { supabase, user, response } = await requireUser();
  if (response || !user) return response;

  const limit = checkRateLimit(user.id, 30, 60_000);
  if (!limit.allowed) {
    return json(
      { error: "Demasiadas solicitudes seguidas. Espera un momento y vuelve a intentar." },
      { status: 429 }
    );
  }

  let body: ChatBody;
  try {
    body = await readJson<ChatBody>(request);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Solicitud invalida" }, { status: 400 });
  }

  const message = body.message?.trim();
  const provider = body.provider;
  const validAgentIds = new Set(systemAgents.map((agent) => agent.id));

  if (!message) {
    return json({ error: "Escribe un mensaje antes de ejecutar el chat." }, { status: 400 });
  }

  if (message.length > maxMessageLength) {
    return json({ error: `El mensaje es demasiado largo. Maximo ${maxMessageLength} caracteres.` }, { status: 400 });
  }

  if (!providers.includes(provider)) {
    return json({ error: "Provider invalido. Elige OpenAI o Gemini." }, { status: 400 });
  }

  if (!modes.includes(body.mode)) {
    return json({ error: "Modo invalido. Elige individual, comparar, equipo o debate." }, { status: 400 });
  }

  if (!validAgentIds.has(body.agentId)) {
    return json({ error: "Agente invalido. Selecciona un agente disponible." }, { status: 400 });
  }

  const selectedAgents = (body.selectedAgents ?? []).filter((agentId) => validAgentIds.has(agentId));

  const requiredProviders = body.mode === "individual" ? [provider] : providers;
  const { plan, apiKeys } = await getPlanApiKeys(supabase, user.id, requiredProviders);
  if (!Object.values(apiKeys).some(Boolean)) {
    return json(
      {
        error:
          plan === "pro"
            ? "Tu plan Pro esta activo, pero faltan las API keys Pro en el servidor."
            : "En Free necesitas guardar tus propias keys en API Vault antes de usar el chatbot."
      },
      { status: 400 }
    );
  }

  try {
    const result = await runChat({
      message,
      provider,
      model: body.model,
      agentId: body.agentId,
      mode: body.mode,
      selectedAgents,
      apiKeys
    });

    const failed = result.results.every((item) => item.error);
    if (failed) {
      return json(
        {
          error: "No se pudo obtener respuesta. Revisa que las API keys del servidor esten configuradas.",
          results: result.results
        },
        { status: 400 }
      );
    }

    return json(result);
  } catch {
    return json({ error: "Ocurrio un error procesando la solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
