import "server-only";

import type { Provider } from "@/lib/ai/types";

export function getEnvApiKeys(): Partial<Record<Provider, string>> {
  return {
    openai: process.env.PRO_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY,
    gemini: process.env.PRO_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY
  };
}

export function getMissingProviderMessage(provider: Provider) {
  const envName = provider === "openai" ? "PRO_OPENAI_API_KEY" : "PRO_GEMINI_API_KEY";
  return `Falta configurar ${envName} en el servidor.`;
}
