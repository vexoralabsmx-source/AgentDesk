export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const dailyTaskLimit = Number(process.env.DEFAULT_DAILY_TASK_LIMIT ?? 25);
