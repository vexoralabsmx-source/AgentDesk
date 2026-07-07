import type { ProviderRequest, ProviderResult } from "@/lib/ai/types";

export async function runClaude(request: ProviderRequest): Promise<ProviderResult> {
  const started = Date.now();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": request.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: request.model,
      system: request.systemPrompt,
      max_tokens: 1800,
      messages: [{ role: "user", content: request.userPrompt }],
      temperature: 0.7
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Claude request failed");
  }

  return {
    provider: "claude",
    model: request.model,
    content: payload.content?.map((item: { text?: string }) => item.text ?? "").join("") ?? "",
    latencyMs: Date.now() - started
  };
}
