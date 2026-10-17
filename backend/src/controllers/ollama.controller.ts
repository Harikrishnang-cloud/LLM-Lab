import { Request, Response, NextFunction } from 'express';
import { ollamaService } from '../services/ollama.service.js';
import { generateRequestSchema } from '../schemas/generate.schema.js';
import { AppError } from '../middleware/error.middleware.js';
import { ApiResponse, OllamaHealthData, OllamaModelsData, GenerateResultData } from '../types/index.js';

export const getOllamaHealth = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const healthData: OllamaHealthData = await ollamaService.checkHealth();

  const response: ApiResponse<OllamaHealthData> = {
    success: true,
    data: healthData,
  };

  res.status(200).json(response);
};

export const getOllamaModels = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const models = await ollamaService.listModels();
    const response: ApiResponse<OllamaModelsData> = {
      success: true,
      data: {
        models,
        count: models.length,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const generatePromptResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Zod Validation
    const validationResult = generateRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0];
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        firstIssue ? firstIssue.message : 'Invalid request payload',
        validationResult.error.flatten()
      );
    }

    const { prompt, model } = validationResult.data;

    // Handle client disconnect cancellation
    const controller = new AbortController();
    req.on('close', () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    // 2. Call Ollama Service
    const result = await ollamaService.generateText(prompt, model, controller.signal);

    const response: ApiResponse<GenerateResultData> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
