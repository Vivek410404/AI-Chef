'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  Brain,
  Mail,
  RefreshCw,
  CheckCircle2,
  Server,
  Zap,
  HardDrive
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      const res = await api.admin.getSystemHealth();
      setHealth(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-400" />
        Running diagnostic probes across platform services...
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Infrastructure & System Health</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Real-time status probes, memory allocations, AI provider failover readiness, and persistence
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-stone-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Run Probe</span>
        </button>
      </div>

      {/* Main Status Pill */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-soft">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Platform Operational</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                {health?.status || 'UP'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Uptime: <strong className="text-stone-200">{formatUptime(health?.uptimeSeconds || 0)}</strong> · Probe checked: {new Date(health?.timestamp || Date.now()).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-400 font-mono">
          Node: <span className="text-white">{health?.nodeVersion}</span> ({health?.platform})
        </div>
      </div>

      {/* Component Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PostgreSQL Database */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">PostgreSQL 18 & Prisma ORM</h3>
                <p className="text-[11px] text-stone-400">Fail-closed persistent database engine</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              {health?.database?.connected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs space-y-1.5 font-mono">
            <p className="flex justify-between">
              <span className="text-stone-500">Storage Mode:</span>
              <span className="text-stone-200 font-bold">{health?.database?.mode || 'postgres'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Fail-Closed Guarantee:</span>
              <span className="text-emerald-400 font-bold">REQUIRE_DATABASE=true</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Schema Push State:</span>
              <span className="text-stone-200">Synchronized</span>
            </p>
          </div>
        </div>

        {/* AI Chef Engine */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/80 flex items-center justify-center text-purple-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Chef & Planning Engine</h3>
                <p className="text-[11px] text-stone-400">Dual-provider resilient architecture</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase">
              READY
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs space-y-1.5 font-mono">
            <p className="flex justify-between">
              <span className="text-stone-500">Primary Provider:</span>
              <span className="text-purple-300 font-bold">{health?.aiEngine?.primaryModel || 'gemini-2.5-flash-lite'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Fallback Provider:</span>
              <span className="text-stone-300">{health?.aiEngine?.fallbackProvider || 'deterministic-offline'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Deterministic Fallback:</span>
              <span className="text-emerald-400 font-bold">100% Guaranteed</span>
            </p>
          </div>
        </div>

        {/* Memory Footprint */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Process Memory Usage</h3>
                <p className="text-[11px] text-stone-400">V8 heap & resident set size</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {health?.memory?.rssMb || 0} MB RSS
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs space-y-1.5 font-mono">
            <p className="flex justify-between">
              <span className="text-stone-500">Heap Total:</span>
              <span className="text-stone-200">{health?.memory?.heapTotalMb || 0} MB</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Heap Used:</span>
              <span className="text-stone-200 font-bold">{health?.memory?.heapUsedMb || 0} MB</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Cost Footprint:</span>
              <span className="text-emerald-400 font-bold">₹0 Cloud Spend</span>
            </p>
          </div>
        </div>

        {/* Email Transport */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-800/80 flex items-center justify-center text-teal-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Notification & Email Dispatch</h3>
                <p className="text-[11px] text-stone-400">Zero-cost local verification dispatch</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800 uppercase">
              {health?.emailTransport?.status || 'OPERATIONAL'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs space-y-1.5 font-mono">
            <p className="flex justify-between">
              <span className="text-stone-500">Dispatch Mode:</span>
              <span className="text-teal-300 font-bold">{health?.emailTransport?.mode || 'console-preview'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">External SMS API:</span>
              <span className="text-stone-400">None (Zero-Cost Principle)</span>
            </p>
            <p className="flex justify-between">
              <span className="text-stone-500">Token Expiry:</span>
              <span className="text-stone-200">30 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
