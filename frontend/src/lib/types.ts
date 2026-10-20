export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface BackendHealth {
  status: 'ok';
  service: string;
  timestamp: string;
}

export interface OllamaHealth {
  status: 'available' | 'unavailable' | 'timeout';
  baseUrl: string;
  timestamp: string;
  message?: string;
}

export interface OllamaModelInfo {
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
}

export interface OllamaModelsResponse {
  models: OllamaModelInfo[];
  count: number;
}

export interface AppStatus {
  backend: {
    status: 'ok';
    service: string;
    uptimeSeconds: number;
  };
  ollama: {
    status: 'available' | 'unavailable' | 'timeout';
    baseUrl: string;
    message?: string;
  };
  models: {
    installed: string[];
    count: number;
    defaultModel: string | null;
  };
  timestamp: string;
}

export interface GeneratePromptRequest {
  prompt: string;
  model?: string;
  system?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  seed?: number;
}

export interface GeneratePromptResponse {
  model: string;
  response: string;
  durationMs: number;
  totalTokens?: number;
  promptTokens?: number;
  tokensPerSecond?: number;
}

export interface TokenChunk {
  id: number;
  text: string;
  index: number;
}

export interface TokenizeRequest {
  text: string;
  model?: string;
  includeSpecialTokens?: boolean;
}

export interface TokenizeResponse {
  model: string;
  tokenizerName: string;
  vocabularySize: number;
  tokenCount: number;
  characterCount: number;
  wordCount: number;
  tokens: TokenChunk[];
  tokenIds: number[];
  specialTokensIncluded: boolean;
  notes?: string;
}

export interface SupportedTokenizer {
  model: string;
  tokenizerName: string;
  vocabularySize: number;
  description: string;
}
