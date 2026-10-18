'use client';

import React, { useState, useEffect, useRef } from 'react';
import {Send,Square,Sparkles,Clock,Cpu,Trash2,AlertTriangle,RefreshCw,Terminal,} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDuration } from '@/lib/utils';

interface PromptPlaygroundProps {
  isOllamaAvailable: boolean;
  models: string[];
  defaultModel: string | null;
  onRefreshModels: () => void;
}

export default function PromptPlayground({
  isOllamaAvailable,
  models,
  defaultModel,
  onRefreshModels,
}: PromptPlaygroundProps) {
  const [prompt, setPrompt] = useState<string>('Explain how Large Language Models generate tokens in simple terms.');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      if (defaultModel && models.includes(defaultModel)) {
        setSelectedModel(defaultModel);
      } else {
        setSelectedModel(models[0]);
      }
    }
  }, [models, defaultModel, selectedModel]);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setDurationMs(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await api.generatePrompt(
        {
          prompt: prompt.trim(),
          model: selectedModel || undefined,
        },
        controller.signal
      );

      setResponse(result.response);
      setDurationMs(result.durationMs);
      setUsedModel(result.model);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ABORTED') {
        setError('Prompt generation cancelled by user.');
      } else {
        setError(err.message || 'Failed to generate response from Ollama.');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleClearAll = () => {
    setPrompt('');
    setResponse(null);
    setError(null);
    setDurationMs(null);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Try Your First Prompt
            </h2>
            <p className="text-sm text-slate-500">
              Basic local inference testing playground with configurable parameters
            </p>
          </div>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Cpu size={14} className="text-slate-500 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loading || models.length === 0}
              className="bg-transparent text-slate-800 font-semibold outline-none cursor-pointer disabled:opacity-50 text-xs font-mono"
            >
              {models.length === 0 ? (
                <option value="">No models installed</option>
              ) : (
                models.map((m) => (
                  <option key={m} value={m} className="bg-white text-slate-900">
                    {m}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={onRefreshModels}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
            title="Refresh local models"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Notice if Ollama or models unavailable */}
      {!isOllamaAvailable && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertTriangle size={16} className="shrink-0 text-rose-600" />
          <span>
            <strong>Ollama service is not reachable:</strong> Make sure Ollama is installed and running locally on port 11434.
          </span>
        </div>
      )}

      {isOllamaAvailable && models.length === 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <span>
            <strong>No local models installed:</strong> Download one in your terminal, e.g. <code className="bg-white px-1.5 py-0.5 rounded text-amber-900 border border-amber-200">ollama run smollm2:135m</code> or <code className="bg-white px-1.5 py-0.5 rounded text-amber-900 border border-amber-200">ollama pull llama3.2:1b</code>.
          </span>
        </div>
      )}

      {/* Prompt Textarea */}
      <div className="mt-5 space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={4}
            placeholder="Type your prompt here... (Shift+Enter for newline, Enter to submit)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition resize-y font-sans leading-relaxed"
          />
          <div className="absolute right-3 bottom-3 text-[11px] font-mono text-slate-400 select-none">
            {prompt.length} chars
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              disabled={loading || (!prompt && !response && !error)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition disabled:opacity-40"
            >
              <Trash2 size={13} />
              Clear
            </button>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">Enter</kbd> to submit
            </span>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-xs"
              >
                <Square size={13} className="fill-current" />
                Cancel Request
              </button>
            ) : (
              <button
                onClick={handleSendPrompt}
                disabled={!prompt.trim() || !isOllamaAvailable || models.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send size={13} />
                Send Prompt
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Response or Error Output */}
      {(response !== null || error !== null || loading) && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Terminal size={14} className="text-brand-600" />
              Inference Result
            </span>
            {durationMs !== null && (
              <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <Clock size={12} className="text-brand-600" />
                  {formatDuration(durationMs)}
                </span>
                {usedModel && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                    {usedModel}
                  </span>
                )}
              </div>
            )}
          </div>

          {loading && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-600 animate-pulse">
                Generating local LLM completion...
              </span>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-600" />
                Inference Error
              </div>
              <p className="font-mono text-rose-900 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {response !== null && !loading && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap selection:bg-brand-500/20">
              {response}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
