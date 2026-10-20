'use client';

import React from 'react';
import { Server, Activity, Cpu, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AppStatus } from '@/lib/types';
import Link from 'next/link';

interface StatusCardsProps {
  status: AppStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function StatusCards({ status, loading, onRefresh }: StatusCardsProps) {
  const backendOk = status?.backend.status === 'ok';
  const ollamaOk = status?.ollama.status === 'available';
  const defaultModel = status?.models.defaultModel;
  const modelsCount = status?.models.count ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Backend Status Card */}
      <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Server size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Backend API</h3>
              <p className="text-xs text-slate-500">Node.js + Express</p>
            </div>
          </div>
          {backendOk ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Healthy
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              <XCircle size={13} className="text-rose-600" />
              Unavailable
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Port / Host:</span>
            <span className="font-mono text-slate-800 font-medium">5000 / localhost</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Service:</span>
            <span className="font-mono text-slate-800 font-medium">{status?.backend.service || 'llm-lab-api'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Uptime:</span>
            <span className="font-mono text-slate-800 font-medium">
              {status?.backend.uptimeSeconds !== undefined ? `${status.backend.uptimeSeconds}s` : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Ollama Connection Status Card */}
      <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Ollama Engine</h3>
              <p className="text-xs text-slate-500">Local Inference Service</p>
            </div>
          </div>
          {ollamaOk ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Connected
            </span>
          ) : status?.ollama.status === 'timeout' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <AlertCircle size={13} className="text-amber-600" />
              Timeout
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
              <XCircle size={13} className="text-rose-600" />
              Not Reachable
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Target Endpoint:</span>
            <span className="font-mono text-slate-800 font-medium">{status?.ollama.baseUrl || 'http://127.0.0.1:11434'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Installed Models:</span>
            <span className="font-mono text-slate-800 font-medium">{modelsCount} model(s)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Inference Status:</span>
            <span className={`font-semibold ${ollamaOk ? 'text-emerald-700' : 'text-slate-500'}`}>
              {ollamaOk ? 'Ready for prompts' : 'Service stopped'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Model Configuration Card */}
      <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Active Model</h3>
              <p className="text-xs text-slate-500">Configured weights</p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent transition"
            title="Refresh Status"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-brand-600' : ''} />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Default Model:</span>
            <span className="font-mono text-slate-800 font-medium truncate max-w-[140px]">
              {defaultModel || 'None specified'}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Available:</span>
            <span className="text-slate-700">
              {modelsCount > 0 ? `${modelsCount} available` : '0 local weights'}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Detailed Status:</span>
            <Link
              href="/api-status"
              className="text-brand-600 hover:text-brand-700 font-semibold underline"
            >
              Inspect →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
