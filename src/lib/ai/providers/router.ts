import "server-only";

import { runGemini } from "@/lib/ai/geminiAdapter";
import { runOpenAI } from "@/lib/ai/openaiAdapter";
import type { Provider, ProviderRequest, ProviderResult } from "@/lib/ai/types";
import { getMissingProviderMessage } from "@/lib/ai/providers/env";

export async function callProvider(
  provider: Provider,
  request: Omit<ProviderRequest, "apiKey">,
  apiKeys: Partial<Record<Provider, string>>
): Promise<ProviderResult> {
  const apiKey = apiKeys[provider];

  if (!apiKey) {
    throw new Error(getMissingProviderMessage(provider));
  }

  const fullRequest = { ...request, apiKey };

  if (provider === "openai") return runOpenAI(fullRequest);
  return runGemini(fullRequest);
}
