import { z } from "zod";

export const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OpenRouter API key is required"),
  SITE: z.string().url().optional(),
});

export type EnvSchema = z.infer<typeof envSchema>;

export function validateEnv(): EnvSchema {
  const parsed = envSchema.safeParse(import.meta.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}
