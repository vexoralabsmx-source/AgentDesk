import type { ProviderRequest, ProviderResult } from "@/lib/ai/types";

export async function runGemini(request: ProviderRequest): Promise<ProviderResult> {
  const started = Date.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    request.model
  )}:generateContent?key=${encodeURIComponent(request.apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: request.systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: request.userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Gemini request failed");
  }

  return {
    provider: "gemini",
    model: request.model,
    content: payload.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "",
    latencyMs: Date.now() - started
  };
}
