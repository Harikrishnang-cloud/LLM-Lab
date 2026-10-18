import { z } from 'zod';
import { env } from '../config/env.js';

export const tokenizeRequestSchema = z.object({
  text: z
    .string({
      required_error: 'Text is required',
      invalid_type_error: 'Text must be a string',
    })
    .refine((val) => val.trim().length > 0, {
      message: 'Text cannot be empty or whitespace only',
    })
    .refine((val) => val.length <= env.MAX_PROMPT_LENGTH, {
      message: `Text exceeds maximum allowed length of ${env.MAX_PROMPT_LENGTH} characters`,
    }),
  model: z
    .string()
    .trim()
    .min(1, 'Model name cannot be empty')
    .optional(),
  includeSpecialTokens: z.boolean().optional().default(false),
});

export type TokenizeRequestInput = z.infer<typeof tokenizeRequestSchema>;
