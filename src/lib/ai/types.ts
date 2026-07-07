export type Provider = "openai" | "gemini" | "claude";
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

export const providers: Provider[] = ["openai", "gemini", "claude"];

export const defaultModels: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-1.5-flash",
  claude: "claude-3-5-haiku-latest"
};
