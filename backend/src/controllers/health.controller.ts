import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { ollamaService } from '../services/ollama.service.js';
import { ApiResponse, BackendHealthData, AppStatusData } from '../types/index.js';

const startTime = Date.now();

export const getHealth = (_req: Request, res: Response, _next: NextFunction): void => {
  const data: BackendHealthData = {
    status: 'ok',
    service: 'llm-lab-api',
    timestamp: new Date().toISOString(),
  };

  const response: ApiResponse<BackendHealthData> = {
    success: true,
    data,
  };

  res.status(200).json(response);
};

export const getReady = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  // Backend readiness: express is listening and node process is ready.
  // Ollama is marked as an optional external runtime dependency as per requirements.
  const ollamaHealth = await ollamaService.checkHealth(2000);

  res.status(200).json({
    success: true,
    data: {
      status: 'ready',
      service: 'llm-lab-api',
      dependencies: {
        ollama: {
          available: ollamaHealth.status === 'available',
          status: ollamaHealth.status,
        },
      },
      timestamp: new Date().toISOString(),
    },
  });
};

export const getAggregatedStatus = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const ollamaHealth = await ollamaService.checkHealth(3000);
  let installedModels: string[] = [];

  if (ollamaHealth.status === 'available') {
    try {
      const models = await ollamaService.listModels(3000);
      installedModels = models.map((m) => m.name);
    } catch {
      // Degraded model fetch, handle gracefully
    }
  }

  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const statusData: AppStatusData = {
    backend: {
      status: 'ok',
      service: 'llm-lab-api',
      uptimeSeconds,
    },
    ollama: {
      status: ollamaHealth.status,
      baseUrl: ollamaHealth.baseUrl,
      message: ollamaHealth.message,
    },
    models: {
      installed: installedModels,
      count: installedModels.length,
      defaultModel: env.OLLAMA_DEFAULT_MODEL || (installedModels.length > 0 ? installedModels[0] : null),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: statusData,
  });
};
