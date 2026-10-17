'use client';

import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Terminal } from 'lucide-react';
import { AppStatus } from '@/lib/types';

interface SetupChecklistProps {
  status: AppStatus | null;
  onTestConnection: () => void;
  testing: boolean;
}

export default function SetupChecklist({
  status,
  onTestConnection,
  testing,
}: SetupChecklistProps) {
  const isBackendUp = status?.backend.status === 'ok';
  const isOllamaUp = status?.ollama.status === 'available';
  const hasModels = (status?.models.count ?? 0) > 0;

  const steps = [
    {
      title: 'Backend API Server Running',
      description: 'The Express service is listening on port 5000.',
      completed: isBackendUp,
      actionPrompt: !isBackendUp ? 'Start via `npm run dev` in backend/' : undefined,
    },
    {
      title: 'Ollama Daemon Active',
      description: 'Ollama local inference server responding at http://127.0.0.1:11434.',
      completed: isOllamaUp,
      actionPrompt: !isOllamaUp ? 'Run `ollama serve` or open Ollama application' : undefined,
    },
    {
      title: 'Local LLM Model Installed',
      description: 'At least one model downloaded in Ollama (e.g. smollm2, llama3.2, mistral).',
      completed: hasModels,
      actionPrompt: !hasModels && isOllamaUp ? 'Run: ollama pull smollm2:135m' : undefined,
    },
  ];

  const allCompleted = isBackendUp && isOllamaUp && hasModels;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Setup & Readiness Checklist
            {allCompleted && (
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                All Systems Operational
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 1 prerequisites for local LLM inference experiments
          </p>
        </div>

        <button
          onClick={onTestConnection}
          disabled={testing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-50 shadow-sm"
        >
          {testing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <span>Test Connection</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      <div className="mt-5 space-y-3.5">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 p-4 rounded-xl border transition ${
              step.completed
                ? 'bg-emerald-50/50 border-emerald-200/80'
                : 'bg-slate-50 border-slate-200/70'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {step.completed ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <Circle size={18} className="text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-800">{step.title}</h4>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                    step.completed
                      ? 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {step.completed ? 'Ready' : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{step.description}</p>
              {step.actionPrompt && (
                <div className="mt-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg text-slate-700 border border-slate-200 flex items-center gap-2 shadow-2xs">
                  <Terminal size={13} className="text-slate-500 shrink-0" />
                  <span className="truncate">{step.actionPrompt}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
