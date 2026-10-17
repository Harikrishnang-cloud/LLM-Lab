import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import { OllamaHealthData, OllamaModelInfo, GenerateResultData } from '../types/index.js';

interface OllamaTagResponse {
  models?: Array<{
    name: string;
    model: string;
    size: number;
    digest: string;
    details?: {
      parent_model?: string;
      format?: string;
      family?: string;
      families?: string[];
      parameter_size?: string;
      quantization_level?: string;
    };
    modified_at: string;
  }>;
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaService {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;

  constructor(baseUrl = env.OLLAMA_BASE_URL, defaultTimeout = env.OLLAMA_TIMEOUT_MS) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.defaultTimeout = defaultTimeout;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async checkHealth(timeoutMs = 5000): Promise<OllamaHealthData> {
    const timestamp = new Date().toISOString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Ollama returns 200 on / or /api/tags
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok || response.status === 200) {
        return {
          status: 'available',
          baseUrl: this.baseUrl,
          timestamp,
          message: 'Ollama is running and reachable',
        };
      }

      return {
        status: 'unavailable',
        baseUrl: this.baseUrl,
        timestamp,
        message: `Ollama returned unexpected status ${response.status}`,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          status: 'timeout',
          baseUrl: this.baseUrl,
          timestamp,
          message: `Connection to Ollama timed out after ${timeoutMs}ms`,
        };
      }

      return {
        status: 'unavailable',
        baseUrl: this.baseUrl,
        timestamp,
        message: 'Ollama service is unreachable or not running on configured port',
      };
    }
  }

  public async listModels(timeoutMs = 5000): Promise<OllamaModelInfo[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new AppError(
          503,
          'OLLAMA_SERVICE_ERROR',
          `Ollama service returned status code ${response.status}`
        );
      }

      const data = (await response.json()) as OllamaTagResponse;
      return data.models || [];
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof AppError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError(
          504,
          'OLLAMA_TIMEOUT',
          `Request to fetch Ollama models timed out after ${timeoutMs}ms`
        );
      }
      throw new AppError(
        503,
        'OLLAMA_UNAVAILABLE',
        'Cannot connect to Ollama service. Ensure Ollama is installed and running.'
      );
    }
  }

  public async generateText(
    prompt: string,
    modelOverride?: string,
    signal?: AbortSignal
  ): Promise<GenerateResultData> {
    // 1. Fetch available models first to validate
    const models = await this.listModels();

    if (!models || models.length === 0) {
      throw new AppError(
        400,
        'NO_MODELS_INSTALLED',
        'No Ollama models found locally. Please pull a model first (e.g. `ollama run llama3.2` or `ollama pull smollm2`).'
      );
    }

    // Determine target model
    let targetModel = modelOverride?.trim() || env.OLLAMA_DEFAULT_MODEL?.trim();

    if (!targetModel) {
      // Pick the first available model if no default configured
      targetModel = models[0].name;
    }

    // Verify target model is actually installed
    const modelExists = models.some(
      (m) =>
        m.name.toLowerCase() === targetModel.toLowerCase() ||
        m.name.toLowerCase().startsWith(targetModel.toLowerCase() + ':') ||
        (targetModel.includes(':') && m.name.toLowerCase() === targetModel.toLowerCase())
    );

    if (!modelExists) {
      const installedNames = models.map((m) => m.name).join(', ');
      throw new AppError(
        404,
        'MODEL_NOT_FOUND',
        `Requested model "${targetModel}" is not installed. Installed models: [${installedNames}].`
      );
    }

    // Prepare request with timeout and caller signal cancellation support
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.defaultTimeout);

    // If external abort signal provided (e.g. client disconnect), forward it
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;

      if (!response.ok) {
        let errorMsg = `Ollama generation failed with HTTP ${response.status}`;
        try {
          const errData = (await response.json()) as { error?: string };
          if (errData.error) {
            errorMsg = errData.error;
          }
        } catch {
          // ignore json parse error
        }
        throw new AppError(502, 'OLLAMA_GENERATION_FAILED', errorMsg);
      }

      const data = (await response.json()) as OllamaGenerateResponse;

      return {
        model: data.model || targetModel,
        response: data.response || '',
        durationMs,
        totalTokens: data.eval_count,
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof AppError) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        if (signal?.aborted) {
          throw new AppError(499, 'REQUEST_CANCELLED', 'Inference request was cancelled by client');
        }
        throw new AppError(
          504,
          'OLLAMA_TIMEOUT',
          `Generation request timed out after ${this.defaultTimeout}ms`
        );
      }
      throw new AppError(
        503,
        'OLLAMA_UNAVAILABLE',
        'Failed to communicate with Ollama during text generation'
      );
    }
  }
}

export const ollamaService = new OllamaService();
