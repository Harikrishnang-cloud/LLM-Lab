'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TerminalSquare,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  AlertCircle,
  Hash,
  FileText,
  Layers,
  Copy,
  Check,
  Cpu,
  BookOpen,
  ArrowRight,
  Split,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { api } from '@/lib/api';
import { TokenChunk, TokenizeResponse } from '@/lib/types';

// Curated sample inputs covering common tokenization edge cases
const SAMPLE_INPUTS = [
  {
    label: 'Standard English',
    text: 'Large language models process text by converting characters into numerical tokens.',
    category: 'General',
  },
  {
    label: 'Code & Indentation',
    text: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)',
    category: 'Code',
  },
  {
    label: 'Punctuation & Contractions',
    text: "Don't, wouldn't, can't! What's the model's vocabulary behavior?",
    category: 'Grammar',
  },
  {
    label: 'Subword & Multi-language',
    text: 'Tokenization 🤖 宇宙 (Cosmos) uncharacteristically extraordinariness',
    category: 'Subwords & Unicode',
  },
  {
    label: 'Whitespace & Numbers',
    text: '1234567890 3.1415926535    multiple    spaces',
    category: 'Numbers',
  },
];

// Rich token chip palette with high visual contrast
const CHIP_PALETTES = [
  {
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    badge: 'bg-emerald-200 text-emerald-800',
  },
  {
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    border: 'border-indigo-300',
    text: 'text-indigo-900',
    badge: 'bg-indigo-200 text-indigo-800',
  },
  {
    bg: 'bg-amber-50 hover:bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-900',
    badge: 'bg-amber-200 text-amber-800',
  },
  {
    bg: 'bg-rose-50 hover:bg-rose-100',
    border: 'border-rose-300',
    text: 'text-rose-900',
    badge: 'bg-rose-200 text-rose-800',
  },
  {
    bg: 'bg-cyan-50 hover:bg-cyan-100',
    border: 'border-cyan-300',
    text: 'text-cyan-900',
    badge: 'bg-cyan-200 text-cyan-800',
  },
  {
    bg: 'bg-purple-50 hover:bg-purple-100',
    border: 'border-purple-300',
    text: 'text-purple-900',
    badge: 'bg-purple-200 text-purple-800',
  },
  {
    bg: 'bg-blue-50 hover:bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-900',
    badge: 'bg-blue-200 text-blue-800',
  },
  {
    bg: 'bg-orange-50 hover:bg-orange-100',
    border: 'border-orange-300',
    text: 'text-orange-900',
    badge: 'bg-orange-200 text-orange-800',
  },
];

export default function TokenizerPlayground() {
  const [inputText, setInputText] = useState<string>(SAMPLE_INPUTS[0].text);
  const [includeSpecialTokens, setIncludeSpecialTokens] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TokenizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'chips' | 'table' | 'json'>('chips');

  const abortControllerRef = useRef<AbortController | null>(null);

  // Automatically tokenize default sample on initial render
  useEffect(() => {
    handleTokenize(SAMPLE_INPUTS[0].text, includeSpecialTokens);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleTokenize = async (textToTokenize = inputText, withSpecial = includeSpecialTokens) => {
    if (!textToTokenize.trim() || loading) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await api.tokenizeText(
        {
          text: textToTokenize,
          model: 'llama3.2:1b',
          includeSpecialTokens: withSpecial,
        },
        controller.signal
      );
      setResult(data);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ABORTED') return;
      setError(
        err.message || 'Failed to tokenize text. Ensure the backend service is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setHoveredTokenIndex(null);
  };

  const handleSampleClick = (sampleText: string) => {
    setInputText(sampleText);
    handleTokenize(sampleText, includeSpecialTokens);
  };

  const handleCopyTokenIds = async () => {
    if (!result?.tokenIds) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.tokenIds));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback if clipboard permission is restricted
    }
  };

  const activeToken =
    hoveredTokenIndex !== null && result?.tokens
      ? result.tokens[hoveredTokenIndex]
      : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-2">
            <TerminalSquare size={13} className="text-purple-600" />
            <span>Phase 2 — Tokenizer Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Byte-Pair Encoding Tokenizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Observe how raw strings are segmented into subword tokens and mapped to discrete vocabulary IDs.
          </p>
        </div>

        {/* Active Verified Tokenizer Badge */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-left">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Exact Tokenizer
            </div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>Meta Llama 3 / 3.2</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-normal">
                128k Vocab
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <Info size={19} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900 space-y-1">
          <div className="font-semibold text-amber-950 flex items-center gap-2">
            <span>Model-Accurate Vocabulary Mapping</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Different model families (e.g. <strong>Llama 3</strong>, <strong>GPT-4o</strong>, <strong>Mistral</strong>, or <strong>BERT</strong>) use distinct BPE vocabularies and regex pre-tokenization rules. Token IDs and split boundaries shown here are computed using the <strong>exact native Llama 3 tokenizer</strong> powering your local <code className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold">llama3.2:1b</code> engine.
          </p>
        </div>
      </div>

      {/* Sample Inputs Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400">
            Quick Preset Prompts
          </span>
          <span>Click to test tokenization behaviors</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_INPUTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(sample.text)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 hover:text-purple-900 transition flex items-center gap-1.5 shadow-xs"
            >
              <span className="font-medium">{sample.label}</span>
              <span className="text-[10px] text-slate-400">({sample.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Playground Box */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Input Text Editor</span>
            <span className="text-[11px] text-slate-400">
              ({inputText.length} chars, {inputText.trim().length === 0 ? 0 : inputText.trim().split(/\s+/).length} words)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSpecialTokens}
                onChange={(e) => {
                  setIncludeSpecialTokens(e.target.checked);
                  if (inputText.trim()) {
                    handleTokenize(inputText, e.target.checked);
                  }
                }}
                className="w-3.5 h-3.5 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
              <span>Include Special Tokens (BOS / EOS)</span>
            </label>

            <button
              onClick={handleClear}
              disabled={loading || (!inputText && !result)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-40"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-5">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text here to see real-time token segmentation..."
            rows={4}
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden font-mono text-xs sm:text-sm text-slate-800 resize-y transition bg-slate-50/30"
          />

          <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
            <div className="text-xs text-slate-400">
              Press <strong>Tokenize</strong> to recompute token boundaries and inspect token IDs.
            </div>

            <button
              onClick={() => handleTokenize(inputText, includeSpecialTokens)}
              disabled={loading || !inputText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Play size={14} className={loading ? 'animate-spin' : 'fill-white'} />
              <span>{loading ? 'Tokenizing...' : 'Tokenize Text'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-900">Tokenization Error</div>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Tokens</span>
                <Hash size={15} className="text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {result.tokenCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {result.tokenCount > 0
                  ? `~${(result.characterCount / result.tokenCount).toFixed(2)} chars / token`
                  : '0'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Characters</span>
                <FileText size={15} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {result.characterCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Raw string length</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Words</span>
                <Layers size={15} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {result.wordCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Whitespace-split count</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Vocab Size</span>
                <BookOpen size={15} className="text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {result.vocabularySize.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Total possible IDs</div>
            </div>
          </div>

          {/* Interactive Token Inspection Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* View Mode Header */}
            <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 gap-3">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Token Visualizer</span>
                <span className="text-[11px] text-slate-400">
                  Hover over any chip to inspect its exact token ID and text representation
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg text-xs font-medium text-slate-600">
                  <button
                    onClick={() => setViewMode('chips')}
                    className={`px-3 py-1 rounded-md transition ${
                      viewMode === 'chips'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Chips View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-md transition ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1 rounded-md transition ${
                      viewMode === 'json'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    Raw IDs JSON
                  </button>
                </div>

                <button
                  onClick={handleCopyTokenIds}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs transition"
                >
                  {copiedId ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy IDs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Token Inspector Strip */}
            {activeToken ? (
              <div className="bg-purple-50/80 border-b border-purple-100 px-5 py-2.5 flex items-center justify-between text-xs text-purple-950 font-mono">
                <div className="flex items-center gap-3">
                  <span>
                    Token Index: <strong>#{activeToken.index + 1}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Token ID: <strong>{activeToken.id}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Raw Representation:{' '}
                    <code className="bg-white px-2 py-0.5 rounded border border-purple-200 font-bold">
                      {JSON.stringify(activeToken.text)}
                    </code>
                  </span>
                </div>
                <div className="text-[11px] text-purple-700">
                  {activeToken.text.startsWith(' ') ? 'Includes leading space' : 'No leading space'}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/40 border-b border-slate-100 px-5 py-2.5 text-xs text-slate-400 italic">
                Hover over a token below to inspect its detailed token ID and metadata
              </div>
            )}

            {/* View Content */}
            <div className="p-6">
              {viewMode === 'chips' && (
                <div className="flex flex-wrap gap-2 leading-relaxed">
                  {result.tokens.map((token, index) => {
                    const palette = CHIP_PALETTES[index % CHIP_PALETTES.length];
                    const isHovered = hoveredTokenIndex === index;

                    // Display friendly representation of spaces and newlines
                    const displayToken = token.text
                      .replace(/ /g, '␣')
                      .replace(/\n/g, '↵\n')
                      .replace(/\t/g, '⇥');

                    return (
                      <div
                        key={index}
                        onMouseEnter={() => setHoveredTokenIndex(index)}
                        onMouseLeave={() => setHoveredTokenIndex(null)}
                        className={`group relative inline-flex items-center border rounded-xl px-2.5 py-1.5 transition-all cursor-pointer font-mono text-xs sm:text-sm select-none ${
                          palette.bg
                        } ${palette.border} ${palette.text} ${
                          isHovered ? 'ring-2 ring-purple-400 scale-105 z-10 shadow-sm' : ''
                        }`}
                      >
                        <span className="whitespace-pre">{displayToken}</span>
                        <span
                          className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold opacity-75 group-hover:opacity-100 ${palette.badge}`}
                        >
                          {token.id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                        <th className="pb-2 font-semibold">#</th>
                        <th className="pb-2 font-semibold">Token ID</th>
                        <th className="pb-2 font-semibold">Text Segment</th>
                        <th className="pb-2 font-semibold">Length</th>
                        <th className="pb-2 font-semibold">JSON Escaped</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.tokens.map((tok, i) => (
                        <tr
                          key={i}
                          onMouseEnter={() => setHoveredTokenIndex(i)}
                          onMouseLeave={() => setHoveredTokenIndex(null)}
                          className={`hover:bg-purple-50/50 transition ${
                            hoveredTokenIndex === i ? 'bg-purple-50/70 font-bold' : ''
                          }`}
                        >
                          <td className="py-2.5 text-slate-400">{i + 1}</td>
                          <td className="py-2.5 font-bold text-purple-700">{tok.id}</td>
                          <td className="py-2.5 text-slate-900 whitespace-pre">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {tok.text.replace(/ /g, '␣').replace(/\n/g, '↵\n')}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500">{tok.text.length} char(s)</td>
                          <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                            {JSON.stringify(tok.text)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {viewMode === 'json' && (
                <div className="space-y-4">
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96">
                    {JSON.stringify(
                      {
                        model: result.model,
                        tokenizerName: result.tokenizerName,
                        tokenCount: result.tokenCount,
                        tokenIds: result.tokenIds,
                        tokens: result.tokens,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            {/* Tokenizer Footer Insights */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-slate-400" />
                <span>
                  Configured engine: <strong className="text-slate-700">{result.model}</strong>
                </span>
                <span>•</span>
                <span>{result.notes}</span>
              </div>
              <div className="text-slate-400 font-mono">
                Symbol <code className="bg-slate-100 px-1 rounded text-slate-600">␣</code> denotes whitespace
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <TerminalSquare size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Text Tokenized Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Enter a prompt in the input editor above or pick a sample preset to visually inspect how the Llama 3 BPE tokenizer breaks it down.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">
            Segmenting text with authentic Llama 3 BPE tokenizer...
          </p>
        </div>
      )}
    </div>
  );
}
