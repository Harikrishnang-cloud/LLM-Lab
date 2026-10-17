import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { ollamaService } from '../src/services/ollama.service.js';
import { AppError } from '../src/middleware/error.middleware.js';

describe('LLM Lab API Backend Tests', () => {
  const app = createApp();

  // Helper function to simulate HTTP requests against Express app without listening on open port
  const request = async (
    method: 'GET' | 'POST',
    path: string,
    body?: unknown
  ): Promise<{ status: number; body: any }> => {
    return new Promise((resolve) => {
      // Create local ephemeral server for the test
      const server = app.listen(0, async () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          server.close();
          throw new Error('Failed to start test server');
        }
        const port = address.port;
        const url = `http://localhost:${port}${path}`;

        try {
          const res = await fetch(url, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
          });
          const json = await res.json();
          server.close(() => resolve({ status: res.status, body: json }));
        } catch (err) {
          server.close(() => {
            throw err;
          });
        }
      });
    });
  };

  it('GET /api/health returns 200 with service information', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
    assert.equal(res.body.data.service, 'llm-lab-api');
    assert.ok(res.body.data.timestamp);
  });

  it('GET /api/health/ready returns 200 with readiness details', async () => {
    const res = await request('GET', '/api/health/ready');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ready');
    assert.ok(res.body.data.dependencies.ollama);
  });

  it('POST /api/ollama/generate rejects empty or whitespace-only prompts', async () => {
    const res = await request('POST', '/api/ollama/generate', { prompt: '   ' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.match(res.body.error.message, /Prompt cannot be empty/);
  });

  it('POST /api/ollama/generate rejects missing prompt property', async () => {
    const res = await request('POST', '/api/ollama/generate', {});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/ollama/generate handles missing/uninstalled model', async () => {
    // Mock listModels to return a specific list
    const originalListModels = ollamaService.listModels;
    ollamaService.listModels = async () => [
      {
        name: 'llama3:latest',
        model: 'llama3:latest',
        size: 4700000000,
        digest: 'sha256:abc',
        modified_at: new Date().toISOString(),
      },
    ];

    try {
      const res = await request('POST', '/api/ollama/generate', {
        prompt: 'Hello world',
        model: 'non-existent-model',
      });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'MODEL_NOT_FOUND');
    } finally {
      ollamaService.listModels = originalListModels;
    }
  });

  it('POST /api/ollama/generate handles Ollama unavailable scenario gracefully', async () => {
    const originalListModels = ollamaService.listModels;
    ollamaService.listModels = async () => {
      throw new AppError(
        503,
        'OLLAMA_UNAVAILABLE',
        'Cannot connect to Ollama service. Ensure Ollama is installed and running.'
      );
    };

    try {
      const res = await request('POST', '/api/ollama/generate', {
        prompt: 'Hello world',
      });
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'OLLAMA_UNAVAILABLE');
    } finally {
      ollamaService.listModels = originalListModels;
    }
  });

  it('POST /api/ollama/generate generates response with mocked Ollama service', async () => {
    const originalGenerate = ollamaService.generateText;
    ollamaService.generateText = async (prompt, model) => {
      return {
        model: model || 'llama3:latest',
        response: 'Mocked educational response about LLMs',
        durationMs: 342,
        totalTokens: 24,
      };
    };

    try {
      const res = await request('POST', '/api/ollama/generate', {
        prompt: 'Explain what an LLM is',
        model: 'llama3:latest',
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.model, 'llama3:latest');
      assert.equal(res.body.data.response, 'Mocked educational response about LLMs');
      assert.equal(res.body.data.durationMs, 342);
    } finally {
      ollamaService.generateText = originalGenerate;
    }
  });
});
