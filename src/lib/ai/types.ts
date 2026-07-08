export type Provider = "openai" | "gemini";
export type TaskMode = "single" | "parallel" | "debate" | "router";

export type ProviderRequest = {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
};

export type ProviderResult = {
  provider: Provider;
  model: string;
  content: string;
  latencyMs: number;
  error?: string;
};

export const providers: Provider[] = ["openai", "gemini"];

export const defaultModels: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-1.5-flash"
};

export const modelOptions: Record<Provider, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "o4-mini", "o3-mini"],
  gemini: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash", "gemini-2.5-pro"]
};
