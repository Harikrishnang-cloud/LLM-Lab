import { z } from 'zod';
import { env } from '../config/env.js';

export const generateRequestSchema = z.object({
  prompt: z
    .string({
      required_error: 'Prompt is required',
      invalid_type_error: 'Prompt must be a string',
    })
    .trim()
    .min(1, 'Prompt cannot be empty or whitespace only')
    .max(
      env.MAX_PROMPT_LENGTH,
      `Prompt exceeds maximum allowed length of ${env.MAX_PROMPT_LENGTH} characters`
    ),
  model: z
    .string()
    .trim()
    .min(1, 'Model name cannot be empty')
    .optional(),
  system: z
    .string()
    .trim()
    .max(env.MAX_PROMPT_LENGTH, `System prompt exceeds maximum allowed length of ${env.MAX_PROMPT_LENGTH} characters`)
    .optional(),
  temperature: z
    .number()
    .min(0, 'Temperature must be between 0.0 and 2.0')
    .max(2, 'Temperature must be between 0.0 and 2.0')
    .optional(),
  topP: z
    .number()
    .min(0, 'Top P must be between 0.0 and 1.0')
    .max(1, 'Top P must be between 0.0 and 1.0')
    .optional(),
  maxTokens: z
    .number()
    .int('Max tokens must be an integer')
    .positive('Max tokens must be greater than 0')
    .max(32768, 'Max tokens cannot exceed 32768')
    .optional(),
  seed: z
    .number()
    .int('Seed must be an integer')
    .optional(),
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
