'use client';

import React from 'react';
import { Server, Terminal, ShieldCheck } from 'lucide-react';
import { useAppStatus } from '@/hooks/useAppStatus';

export default function Header() {
  const { status, loading } = useAppStatus({ pollingIntervalMs: 20000 });
  const backendOnline = status?.backend.status === 'ok';

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <span className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
          <Terminal size={14} className="text-brand-600" />
          <span>Local Engine</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Connectivity Status Pill */}
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          <Server size={14} className={backendOnline ? 'text-emerald-600' : 'text-rose-600'} />
          <span className="text-slate-600">API Server:</span>
          {loading && !status ? (
            <span className="text-slate-400">checking...</span>
          ) : backendOnline ? (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              Active
            </span>
          ) : (
            <span className="text-rose-700 font-semibold">Offline</span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
          <ShieldCheck size={14} className="text-brand-600" />
          <span>Isolated Local Host</span>
        </div>
      </div>
    </header>
  );
}
