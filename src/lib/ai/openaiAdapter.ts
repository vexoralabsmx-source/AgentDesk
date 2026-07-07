import type { ProviderRequest, ProviderResult } from "@/lib/ai/types";

export async function runOpenAI(request: ProviderRequest): Promise<ProviderResult> {
  const started = Date.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${request.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userPrompt }
      ],
      temperature: 0.7
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "OpenAI request failed");
  }

  return {
    provider: "openai",
    model: request.model,
    content: payload.choices?.[0]?.message?.content ?? "",
    latencyMs: Date.now() - started
  };
}
