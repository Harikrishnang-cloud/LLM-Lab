import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => {
    const port = parseInt(val, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(`Invalid PORT: ${val}`);
    }
    return port;
  }),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  OLLAMA_BASE_URL: z.string().url().default('http://127.0.0.1:11434'),
  OLLAMA_DEFAULT_MODEL: z.string().optional().default(''),
  OLLAMA_TIMEOUT_MS: z.string().default('60000').transform((val) => {
    const timeout = parseInt(val, 10);
    return isNaN(timeout) || timeout <= 0 ? 60000 : timeout;
  }),
  MAX_PROMPT_LENGTH: z.string().default('10000').transform((val) => {
    const maxLen = parseInt(val, 10);
    return isNaN(maxLen) || maxLen <= 0 ? 10000 : maxLen;
  }),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment configuration error:');
    result.error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
export type EnvConfig = typeof env;
