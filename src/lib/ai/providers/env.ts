import "server-only";

import type { Provider } from "@/lib/ai/types";

export function getEnvApiKeys(): Partial<Record<Provider, string>> {
  return {
    openai: process.env.OPENAI_API_KEY,
    claude: process.env.ANTHROPIC_API_KEY,
    gemini: process.env.GEMINI_API_KEY
  };
}

export function getMissingProviderMessage(provider: Provider) {
  const envName = provider === "openai" ? "OPENAI_API_KEY" : provider === "claude" ? "ANTHROPIC_API_KEY" : "GEMINI_API_KEY";
  return `Falta configurar ${envName} en el servidor.`;
}
