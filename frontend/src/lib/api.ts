import {
  ApiResponse,
  BackendHealth,
  OllamaHealth,
  OllamaModelsResponse,
  AppStatus,
  GeneratePromptRequest,
  GeneratePromptResponse,
  TokenizeRequest,
  TokenizeResponse,
  SupportedTokenizer,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { 'Content-Type': 'application/json', ...options.headers, };
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.error?.message ||
          `Request failed with status code ${response.status}`;
        const error = new Error(errorMsg);
        (error as any).code = data.error?.code || 'API_ERROR';
        (error as any).status = response.status;
        (error as any).details = data.error?.details;
        throw error;
      }

      return data.data as T;
    } catch (err: unknown) {
      if (err instanceof Error && 'code' in err) {
        throw err;
      }
      if (err instanceof Error && err.name === 'AbortError') {
        const abortErr = new Error('Request was aborted or cancelled');
        (abortErr as any).code = 'ABORTED';
        throw abortErr;
      }
      // Connection failure (e.g. backend down)
      const networkErr = new Error(
        `Unable to connect to backend API at ${this.baseUrl}. Please verify the server is running.`
      );
      (networkErr as any).code = 'BACKEND_UNAVAILABLE';
      throw networkErr;
    }
  }

  public async getBackendHealth(): Promise<BackendHealth> {
    return this.request<BackendHealth>('/health');
  }

  public async getOllamaHealth(): Promise<OllamaHealth> {
    return this.request<OllamaHealth>('/ollama/health');
  }

  public async getOllamaModels(): Promise<OllamaModelsResponse> {
    return this.request<OllamaModelsResponse>('/ollama/models');
  }

  public async getAppStatus(): Promise<AppStatus> {
    return this.request<AppStatus>('/status');
  }

  public async generatePrompt(
    payload: GeneratePromptRequest,
    signal?: AbortSignal
  ): Promise<GeneratePromptResponse> {
    return this.request<GeneratePromptResponse>('/ollama/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal,
    });
  }

  public async tokenizeText(
    payload: TokenizeRequest,
    signal?: AbortSignal
  ): Promise<TokenizeResponse> {
    return this.request<TokenizeResponse>('/tokenizer/encode', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal,
    });
  }

  public async getSupportedTokenizers(): Promise<SupportedTokenizer[]> {
    return this.request<SupportedTokenizer[]>('/tokenizer/supported');
  }
}

export const api = new ApiClient(API_BASE_URL);
