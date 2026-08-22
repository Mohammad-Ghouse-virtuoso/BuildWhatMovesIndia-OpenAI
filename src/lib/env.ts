import "server-only";

import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid Postgres URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid Postgres URL").optional(),
});

const optionalAiEnvSchema = z
  .object({
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).optional(),
  })
  .transform(({ OPENAI_API_KEY, OPENAI_MODEL }) =>
    OPENAI_API_KEY && OPENAI_MODEL
      ? { enabled: true as const, apiKey: OPENAI_API_KEY, model: OPENAI_MODEL }
      : { enabled: false as const },
  );

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type AiEnv = z.infer<typeof optionalAiEnvSchema>;

export function getDatabaseEnv(): DatabaseEnv {
  return databaseEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL || undefined,
  });
}

export function getAiEnv(): AiEnv {
  return optionalAiEnvSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    OPENAI_MODEL: process.env.OPENAI_MODEL || undefined,
  });
}
