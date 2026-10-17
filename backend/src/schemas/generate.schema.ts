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
});

export type GenerateRequestInput = z.infer<typeof generateRequestSchema>;
