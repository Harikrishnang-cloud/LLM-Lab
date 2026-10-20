import { Request, Response, NextFunction } from 'express';
import { tokenizerService } from '../services/tokenizer.service.js';
import { tokenizeRequestSchema } from '../schemas/tokenizer.schema.js';
import { AppError } from '../middleware/error.middleware.js';
import { ApiResponse, TokenizeResultData } from '../types/index.js';

export const encodeText = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
  try {
    // 1. Zod Validation
    const validationResult = tokenizeRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      throw new AppError(400,'VALIDATION_ERROR',
        firstIssue ? firstIssue.message : 'Invalid request payload',
        validationResult.error.flatten()
      );
    }

    const { text, model, includeSpecialTokens } = validationResult.data;

    // 2. Tokenize using verified model tokenizer
    const result: TokenizeResultData = tokenizerService.tokenize(
      text, model, includeSpecialTokens);

    const response: ApiResponse<TokenizeResultData> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getSupportedTokenizers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const list = tokenizerService.getSupportedTokenizers();
    const response: ApiResponse<typeof list> = {
      success: true,
      data: list,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
