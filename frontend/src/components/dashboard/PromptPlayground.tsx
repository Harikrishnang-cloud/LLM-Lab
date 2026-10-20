'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Cpu,
  Clock,
  Zap,
  Sliders,
  Settings2,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Bookmark,
  ChevronDown,
  Info,
  Square,
  Hash,
  Eye,
  SlidersHorizontal,
  Flame,
  Shuffle,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import { useAppStatus } from '@/hooks/useAppStatus';
import { GeneratePromptResponse } from '@/lib/types';

// Curated preset templates to demonstrate different prompt styles & hyperparameter effects
const PROMPT_PRESETS = [
  {
    name: 'Concept Explainer',
    category: 'Reasoning',
    system:
      'You are an expert AI researcher who explains advanced concepts using simple, intuitive analogies, clean bullet points, and zero fluff.',
    prompt:
      'Explain how Temperature and Top-P sampling mathematically influence the probability distribution of predicted next tokens in LLMs.',
    temperature: 0.4,
    topP: 0.9,
    maxTokens: 512,
  },
  {
    name: 'Creative Storyteller',
    category: 'Creative',
    system:
      'You are a whimsical cyberpunk novelist. Write vivid, atmospheric, sensory prose with rich vocabulary.',
    prompt:
      'Describe a neon-lit rain-slicked bazaar in Neo-Kyoto where an eccentric roboticist sells antique quantum memory cores.',
    temperature: 1.1,
    topP: 0.95,
    maxTokens: 600,
  },
  {
    name: 'Strict Code Generator',
    category: 'Coding',
    system:
      'You are a senior software engineer. Provide strictly concise, production-ready TypeScript code with type definitions and zero unnecessary commentary.',
    prompt:
      'Implement an in-memory Least-Recently-Used (LRU) Cache in TypeScript with O(1) get and put operations using a doubly linked list and Map.',
    temperature: 0.1,
    topP: 0.8,
    maxTokens: 750,
  },
  {
    name: 'Structured JSON Extractor',
    category: 'Extraction',
    system:
      'You are a data extraction pipeline. You must ONLY output a valid JSON array of objects. Never include markdown code blocks or explanatory text.',
    prompt:
      'Extract all entities (name, role, sentiment) from this review:\n"Dr. Elena Vance was brilliant in leading the reactor defense, but Commander Briggs was overly cautious and pessimistic about the anomaly."',
    temperature: 0.0,
    topP: 0.5,
    maxTokens: 350,
  },
  {
    name: 'Adversarial Jailbreak Test',
    category: 'Safety & Guardrails',
    system:
      'You are a responsible, harmless AI assistant. Strictly refuse unethical or hazardous requests, but politely answer safe educational or defensive inquiries.',
    prompt:
      'Can you explain the mechanics behind prompt injection attacks and how modern LLM pipelines sanitize untrusted user inputs?',
    temperature: 0.3,
    topP: 0.85,
    maxTokens: 450,
  },
];

export default function AdvancedPlayground() {
  const { status, refresh } = useAppStatus({ pollingIntervalMs: 15000 });
  const models = status?.models.installed || [];
  const defaultModel = status?.models.defaultModel || null;
  const isOllamaAvailable = status?.ollama.status === 'available';

  // Core Prompt State
  const [prompt, setPrompt] = useState<string>(PROMPT_PRESETS[0].prompt);
  const [systemPrompt, setSystemPrompt] = useState<string>(PROMPT_PRESETS[0].system);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Hyperparameters
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [maxTokens, setMaxTokens] = useState<number>(512);
  const [seed, setSeed] = useState<string>('');
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(true);

  // Execution & Response State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratePromptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Abort controller ref
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-select initial model
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      if (defaultModel && models.includes(defaultModel)) {
        setSelectedModel(defaultModel);
      } else {
        setSelectedModel(models[0]);
      }
    }
  }, [models, defaultModel, selectedModel]);

  const handleApplyPreset = (preset: (typeof PROMPT_PRESETS)[0]) => {
    setPrompt(preset.prompt);
    setSystemPrompt(preset.system);
    setTemperature(preset.temperature);
    setTopP(preset.topP);
    setMaxTokens(preset.maxTokens);
    setShowSystemPrompt(true);
    setResult(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const parsedSeed = seed.trim() !== '' ? parseInt(seed, 10) : undefined;

      const res = await api.generatePrompt(
        {
          prompt: prompt.trim(),
          model: selectedModel || undefined,
          system: systemPrompt.trim() ? systemPrompt.trim() : undefined,
          temperature,
          topP,
          maxTokens: maxTokens > 0 ? maxTokens : undefined,
          seed: Number.isNaN(parsedSeed) ? undefined : parsedSeed,
        },
        controller.signal
      );

      setResult(res);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ABORTED') {
        setError('Generation was cancelled.');
      } else {
        setError(err.message || 'Failed to generate model response.');
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

  const handleClear = () => {
    setPrompt('');
    setResult(null);
    setError(null);
  };

  const handleResetDefaults = () => {
    setTemperature(0.7);
    setTopP(0.9);
    setMaxTokens(512);
    setSeed('');
  };

  const handleCopyResponse = async () => {
    if (!result?.response) return;
    try {
      await navigator.clipboard.writeText(result.response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
           
            <span>3. Prompt Engineering Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Prompt Playground
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Experiment with system prompts, sampling temperature, top-p nucleus cuts, and max token limits on local LLMs.
          </p>
        </div>

        {/* Model Selector Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-xs">
            <Cpu size={16} className="text-purple-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Inference Engine
              </span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading || models.length === 0}
                className="bg-transparent text-slate-900 font-semibold text-xs font-mono outline-none cursor-pointer disabled:opacity-50"
              >
                {models.length === 0 ? (
                  <option value="">No models installed</option>
                ) : (
                  models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button
            onClick={() => refresh()}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 transition shadow-xs"
            title="Refresh local models"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Ollama Offline Alert */}
      {!isOllamaAvailable && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
          <AlertTriangle size={18} className="shrink-0 text-rose-600" />
          <span>
            <strong>Ollama service is unreachable:</strong> Make sure Ollama is running locally on port 11434 (<code className="bg-white px-1.5 py-0.5 rounded border border-rose-200">ollama serve</code>).
          </span>
        </div>
      )}

      {/* Preset Templates Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1.5">
            <Bookmark size={13} className="text-purple-600" />
            Prompt Templates & Behavioral Presets
          </span>
          <span className="text-[11px]">Click preset to populate system context & tuned parameters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-purple-900 transition flex items-center gap-1.5 shadow-xs"
            >
              <span className="font-medium">{preset.name}</span>
              <span className="text-[10px] text-slate-400">({preset.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor & Output (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Input Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* System Prompt Toggle Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
              <button
                type="button"
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-purple-700 transition"
              >
                <ShieldCheck size={15} className="text-purple-600" />
                <span>System Instructions (Persona / Role)</span>
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-200/60 text-slate-600">
                  {showSystemPrompt ? 'Visible' : 'Hidden'}
                </span>
              </button>

              <span className="text-[11px] text-slate-400">
                Sets foundational model behavior
              </span>
            </div>

            {/* System Prompt Input */}
            {showSystemPrompt && (
              <div className="p-4 border-b border-slate-100 bg-purple-50/20">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={2}
                  disabled={loading}
                  placeholder="You are a helpful, factual AI assistant..."
                  className="w-full bg-white border border-purple-200/70 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 font-sans transition resize-y"
                />
              </div>
            )}

            {/* User Prompt Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-700">User Prompt</span>
                <span className="text-[11px] text-slate-400">({prompt.length} chars)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  disabled={loading || (!prompt && !result && !error)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-40"
                >
                  <RotateCcw size={12} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* User Prompt Textarea */}
            <div className="p-5">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={6}
                placeholder="Enter prompt here... (Ctrl+Enter to run inference)"
                className="w-full bg-slate-50/40 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 font-sans leading-relaxed transition resize-y"
              />

              {/* Bottom Actions Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-slate-400">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-[10px]">Ctrl+Enter</kbd> to submit
                </span>

                <div className="flex items-center gap-2">
                  {loading ? (
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shadow-xs"
                    >
                      <Square size={13} className="fill-current" />
                      <span>Cancel Generation</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || !isOllamaAvailable || models.length === 0}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Play size={14} className="fill-white" />
                      <span>Run Inference</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
              <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-900">Inference Error</div>
                <p className="font-mono text-rose-800 whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State Skeleton */}
          {loading && (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-800">
                  Sampling tokens with {selectedModel || 'model'}...
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  temperature={temperature} • top_p={topP} • max_tokens={maxTokens}
                </p>
              </div>
            </div>
          )}

          {/* Output Card */}
          {result && !loading && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              {/* Output Header */}
              <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-purple-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Model Response
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResponse}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metrics Telemetry Strip */}
              <div className="bg-purple-50/40 border-b border-purple-100/60 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-600">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-700">
                    <Clock size={12} className="text-purple-600" />
                    <strong>{formatDuration(result.durationMs)}</strong>
                  </span>
                  {result.totalTokens !== undefined && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Hash size={12} className="text-purple-600" />
                      <strong>{result.totalTokens}</strong> eval tokens
                    </span>
                  )}
                  {result.promptTokens !== undefined && (
                    <span className="text-slate-500">
                      ({result.promptTokens} prompt tokens)
                    </span>
                  )}
                  {result.tokensPerSecond !== undefined && (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
                      <Zap size={11} className="text-emerald-600" />
                      {result.tokensPerSecond} tok/s
                    </span>
                  )}
                </div>

                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold text-[11px]">
                  {result.model}
                </span>
              </div>

              {/* Response Text */}
              <div className="p-6 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed whitespace-pre-wrap selection:bg-purple-500/20 bg-slate-50/20">
                {result.response}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Hyperparameter Controls Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Inference Hyperparameters
                </h2>
              </div>
              <button
                onClick={handleResetDefaults}
                className="text-[11px] font-semibold text-slate-400 hover:text-purple-600 transition"
                title="Reset to defaults"
              >
                Reset
              </button>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame size={13} className="text-amber-500" />
                  <span>Temperature</span>
                </label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  {temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0 (Deterministic)</span>
                <span>1.0 (Balanced)</span>
                <span>2.0 (High Chaos)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Flattens or sharpens token logits before softmax. Lower values yield focused, reproducible answers; higher values increase variety and creativity.
              </p>
            </div>

            {/* Top-P Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-blue-500" />
                  <span>Top-P (Nucleus Sampling)</span>
                </label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  {topP.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.1 (Strict Nucleus)</span>
                <span>0.9 (Standard)</span>
                <span>1.0 (Full Vocab)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Samples only from the smallest set of tokens whose cumulative probability exceeds <code className="bg-slate-100 px-1 rounded">p</code>, cutting off the long tail of improbable tokens.
              </p>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Hash size={13} className="text-emerald-500" />
                  <span>Max Tokens (num_predict)</span>
                </label>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  {maxTokens}
                </span>
              </div>
              <input
                type="range"
                min="64"
                max="2048"
                step="64"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>64 tokens</span>
                <span>1024</span>
                <span>2048 tokens</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Upper bound on generation length. Generation terminates earlier if the model emits an End-of-Sequence (EOS) token.
              </p>
            </div>

            {/* Seed */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Shuffle size={13} className="text-purple-500" />
                  <span>Random Seed (Optional)</span>
                </label>
                {seed && (
                  <button
                    onClick={() => setSeed('')}
                    className="text-[10px] text-slate-400 hover:text-rose-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="e.g. 42 (leave empty for random)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-500 transition"
              />
              <p className="text-[11px] text-slate-500 leading-snug">
                Fixing an integer seed with <code className="bg-slate-100 px-1 rounded">temperature &gt; 0</code> enables deterministic reproducibility across repeated runs.
              </p>
            </div>
          </div>

          {/* Educational Quick Tips Card */}
          <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
              <Info size={15} className="text-purple-600" />
              <span>Prompt Engineering Tips</span>
            </div>
            <ul className="text-xs text-purple-900 space-y-2 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Factual tasks (code, JSON, math)</strong>: Set temperature between <code className="font-mono bg-purple-100 px-1 rounded">0.0 - 0.2</code> and top-p around <code className="font-mono bg-purple-100 px-1 rounded">0.7 - 0.9</code>.
              </li>
              <li>
                <strong>Creative writing & brainstorms</strong>: Set temperature between <code className="font-mono bg-purple-100 px-1 rounded">0.8 - 1.2</code> for unexpected metaphors and varied diction.
              </li>
              <li>
                <strong>System Prompt</strong> acts as a strong steering prior. State roles, constraints, and format requirements explicitly at the beginning.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
