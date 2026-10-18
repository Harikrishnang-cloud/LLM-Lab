'use client';

import React, { useState } from 'react';
import { useAppStatus } from '@/hooks/useAppStatus';
import StatusCards from '@/components/dashboard/StatusCards';
import SetupChecklist from '@/components/dashboard/SetupChecklist';
import PromptPlayground from '@/components/dashboard/PromptPlayground';
import { Sparkles, Terminal } from 'lucide-react';

export default function DashboardPage() {
  const { status, loading, refresh } = useAppStatus({
    pollingIntervalMs: 15000,
  });
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    await refresh();
    setTimeout(() => {
      setTesting(false);
    }, 400);
  };

  const isOllamaAvailable = status?.ollama.status === 'available';
  const models = status?.models.installed || [];
  const defaultModel = status?.models.defaultModel || null;

  return (
    <div className="space-y-8 max-w-8xl mx-auto pb-12">
      {/* Welcome Heading Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
            
            <span>Interactive AI Engineering Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome to LLM Lab
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Understand LLMs by experimenting.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 shadow-xs flex items-center gap-2">
            <Terminal size={14} className="text-brand-600" />
            <span>Phase 1 — Core Foundation</span>
          </div>
        </div>
      </div>

      <section aria-label="First Prompt Playground">
        <PromptPlayground
          isOllamaAvailable={isOllamaAvailable}
          models={models}
          defaultModel={defaultModel}
          onRefreshModels={refresh}
        />
      </section>
      {/* Real-time Status Cards */}
      <section aria-label="System Status Overview">
        <StatusCards
          status={status}
          loading={loading || testing}
          onRefresh={handleTestConnection}
        />
      </section>

      {/* Setup Checklist */}
      <section aria-label="Setup Checklist">
        <SetupChecklist
          status={status}
          onTestConnection={handleTestConnection}
          testing={testing || loading}
        />
      </section>
    </div>
  );
}
