'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  TerminalSquare,
  Network,
  Database,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAppStatus } from '@/hooks/useAppStatus';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'API Status', href: '/api-status', icon: Activity },
  { name: 'Tokenizer Lab',href: '/tokenizer',icon: TerminalSquare,badge: 'Phase 2',
  },
  {
    name: 'Prompt Playground',
    href: '#prompt-lab',
    icon: Sparkles,
    disabled: true,
    badge: 'Coming Soon',
  },
  {
    name: 'Embedding Explorer',
    href: '#embeddings',
    icon: Network,
    disabled: true,
    badge: 'Coming Soon',
  },
  {
    name: 'RAG Assistant',
    href: '#rag',
    icon: Database,
    disabled: true,
    badge: 'Coming Soon',
  },
  {
    name: 'Fine-tuning Lab',
    href: '#fine-tune',
    icon: Sliders,
    disabled: true,
    badge: 'Coming Soon',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status } = useAppStatus({ pollingIntervalMs: 15000 });

  const isOllamaConnected = status?.ollama.status === 'available';

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-950 shadow-sm"
        aria-label="Toggle navigation menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen z-40 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out shadow-sm ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Logo & Name */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                  LLM Lab
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    Phase 1
                  </span>
                </span>
                <span className="text-xs text-slate-500">Local AI Learning</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          <div className={`px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? 'Nav' : 'Core Workspace'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 opacity-60 cursor-not-allowed select-none group ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  title={`${item.name} — Coming Soon in future phases`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="shrink-0 text-slate-400" />
                    {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[10px] font-medium tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-500'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Compact Local Model Status Indicator */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div
            className={`p-2.5 rounded-xl border transition flex items-center gap-3 ${
              isOllamaConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              {isOllamaConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isOllamaConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              ></span>
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold leading-none truncate">
                  {isOllamaConnected ? 'Ollama Online' : 'Ollama Offline'}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-1">
                  {isOllamaConnected
                    ? `${status?.models.count || 0} models ready`
                    : 'Check connection'}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
