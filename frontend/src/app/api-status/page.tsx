'use client';

import React from 'react';
import { useAppStatus } from '@/hooks/useAppStatus';
import {
  Activity,
  Server,
  Cpu,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { formatTime } from '@/lib/utils';
import Link from 'next/link';

export default function ApiStatusPage() {
  const { status, loading, lastUpdated, refresh } = useAppStatus({
    pollingIntervalMs: 10000,
  });

  const backendHealthy = status?.backend.status === 'ok';
  const ollamaStatus = status?.ollama.status;
  const isOllamaUp = ollamaStatus === 'available';

  return (
    <div className="space-y-8 max-w-8xl mx-auto pb-12">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
            <Activity size={13} className="text-brand-600" />
            <span>Health & Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            API & Engine Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time connectivity, latency monitoring, and model inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Clock size={13} className="text-slate-400" />
            <span>Last checked:</span>
            <span className="font-mono text-slate-700 font-semibold">
              {lastUpdated ? formatTime(lastUpdated.toISOString()) : 'Never'}
            </span>
          </div>

          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition disabled:opacity-50 shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand-600' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Aggregate Health Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          backendHealthy && isOllamaUp
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : backendHealthy
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3.5">
          {backendHealthy && isOllamaUp ? (
            <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700">
              <CheckCircle2 size={24} />
            </div>
          ) : backendHealthy ? (
            <div className="p-2.5 rounded-lg bg-amber-100 border border-amber-300 text-amber-700">
              <AlertTriangle size={24} />
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-700">
              <XCircle size={24} />
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              {backendHealthy && isOllamaUp
                ? 'All Systems Ready & Operational'
                : backendHealthy
                ? 'Degraded State: Backend healthy, Ollama unavailable'
                : 'Service Disconnected: Backend unreachable'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {backendHealthy && isOllamaUp
                ? 'Node.js Express backend and Ollama local server are communicating seamlessly.'
                : backendHealthy
                ? 'The Express backend is alive, but requests to Ollama inference are failing or timing out.'
                : 'Could not connect to http://localhost:5000/api. Please ensure backend is running.'}
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="self-start sm:self-auto text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
        >
          Return to Dashboard →
        </Link>
      </div>

      {/* Detailed Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Express Backend Health */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Server size={18} className="text-brand-600" />
              <h2 className="font-bold text-sm text-slate-900">Express Backend Service</h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                backendHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {backendHealthy ? 'ONLINE (200 OK)' : 'OFFLINE'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Endpoint Base URL</span>
              <span className="font-mono text-slate-800 font-medium">http://localhost:5000/api</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Service Identifier</span>
              <span className="font-mono text-slate-800 font-medium">{status?.backend.service || 'llm-lab-api'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Process Uptime</span>
              <span className="font-mono text-slate-800 font-medium">
                {status?.backend.uptimeSeconds !== undefined ? `${status.backend.uptimeSeconds} seconds` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">CORS Allowed Origin</span>
              <span className="font-mono text-slate-800 font-medium">http://localhost:3000</span>
            </div>
          </div>
        </div>

        {/* Card 2: Ollama Connectivity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Cpu size={18} className="text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900">Ollama Local Inference</h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                isOllamaUp
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : ollamaStatus === 'timeout'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {ollamaStatus || 'UNREACHABLE'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Target Ollama Host</span>
              <span className="font-mono text-slate-800 font-medium">{status?.ollama.baseUrl || 'http://127.0.0.1:11434'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Configured Default Model</span>
              <span className="font-mono text-slate-800 font-medium">{status?.models.defaultModel || 'Automatic fallback'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Installed Local Models</span>
              <span className="font-mono text-slate-800 font-medium">{status?.models.count ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Diagnostics Note</span>
              <span className="text-slate-600 truncate max-w-[200px]">
                {status?.ollama.message || 'Check Ollama server terminal'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Installed Models Inventory Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-brand-600" />
            <h2 className="font-bold text-sm text-slate-900">Discovered Local Models</h2>
          </div>
          <span className="text-xs font-mono bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
            {status?.models.installed.length || 0} discovered
          </span>
        </div>

        <div className="mt-4">
          {(!status || status.models.installed.length === 0) ? (
            <div className="py-8 text-center">
              <Cpu size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">
                {!backendHealthy
                  ? 'Connect backend to discover models'
                  : !isOllamaUp
                  ? 'Ollama is unreachable. No model metadata available.'
                  : 'No models currently installed in Ollama.'}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Run: ollama pull smollm2:135m (fast & low memory)
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {status.models.installed.map((modelName) => (
                <div key={modelName} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-mono font-semibold text-slate-800">{modelName}</span>
                    {modelName === status.models.defaultModel && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 font-mono">Ready for inference</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
