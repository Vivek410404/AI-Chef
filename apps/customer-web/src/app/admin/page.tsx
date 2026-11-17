'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Home,
  Store,
  ShoppingBag,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [overviewRes, trendsRes] = await Promise.all([
        api.admin.getOverview(),
        api.admin.getTrends(14)
      ]);
      setData(overviewRes);
      setTrends(trendsRes.trends || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch platform metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="glass-admin-card px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl">
          <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
          <span className="text-slate-300 text-xs font-mono">Querying telemetry from PostgreSQL...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 backdrop-blur-xl text-red-200 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="font-bold text-base text-white">Database Telemetry Offline</h3>
        </div>
        <p className="text-xs text-red-300 mb-4 font-mono">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 border border-red-500/40 text-xs font-semibold text-white shadow-soft transition"
        >
          Reconnect
        </button>
      </div>
    );
  }

  const { userStats, householdStats, retailerStats, orderStats, recipeStats, recentActivity } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Platform Operations</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real-time multi-household telemetry, database metrics, and service health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
            SYNCED: {new Date(data?.timestamp || Date.now()).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-admin-card glass-admin-card-hover text-slate-200 text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-3.5 rounded-xl glass-admin-card bg-sky-500/[0.03] border-white/[0.08] flex items-center gap-3 backdrop-blur-xl">
        <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-mono font-bold uppercase tracking-wider text-sky-300 mr-2 text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">Simulated Orders</span>
          All {orderStats?.total || 0} customer orders in this sandbox are non-billing mock transactions across Blinkit, Zepto, DMart Ready, and BigBasket.
        </div>
      </div>

      {/* 4 Professional Obsidian Glass Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Total Identities</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-500/30 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{userStats?.total || 0}</span>
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">{userStats?.active || 0} Active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Suspended: <strong className="text-slate-200">{userStats?.suspended || 0}</strong></span>
            <span>Unverified: <strong className="text-slate-200">{userStats?.pendingVerification || 0}</strong></span>
          </div>
        </div>

        {/* Households Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Kitchen Units</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-500/30 transition">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{householdStats?.total || 0}</span>
            <span className="text-xs text-slate-400 font-mono">Households</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Veg: <strong className="text-slate-200">{householdStats?.byDietaryPreference?.VEGETARIAN || 0}</strong></span>
            <span>Jain: <strong className="text-slate-200">{householdStats?.byDietaryPreference?.JAIN || 0}</strong></span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Simulated GMV</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-500/30 transition">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{orderStats?.total || 0}</span>
            <span className="text-[10px] text-sky-400 font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">₹{orderStats?.totalAmountInr?.toLocaleString() || 0}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>AOV: <strong className="text-white">₹{orderStats?.avgOrderValueInr || 0}</strong></span>
            <span>Status: <strong className="text-emerald-400">Simulated</strong></span>
          </div>
        </div>

        {/* Recipes Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Recipe Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 group-hover:text-sky-400 group-hover:border-sky-500/30 transition">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">{recipeStats?.total || 0}</span>
            <span className="text-xs text-sky-400 font-mono font-semibold">{recipeStats?.active || 0} Active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Jain Friendly: <strong className="text-slate-200">{recipeStats?.jainFriendly || 0}</strong></span>
            <span>Archived: <strong className="text-slate-200">{recipeStats?.archived || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Applications & Retailers summary bar */}
      <div className="p-4 rounded-2xl glass-admin-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sky-400 shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Merchant Integrations & Gateway Roster</h4>
            <p className="text-xs text-slate-400 font-mono">
              {retailerStats?.total || 0} active merchants (Blinkit, Zepto, DMart Ready, BigBasket)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {retailerStats?.pendingApplications > 0 ? (
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs font-mono font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{retailerStats.pendingApplications} Pending Review</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-slate-400 font-mono text-xs">
              All Integrations Active
            </div>
          )}
          <Link
            href="/admin/retailers"
            className="px-3.5 py-1.5 rounded-xl glass-admin-card glass-admin-card-hover text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>Review</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
          </Link>
        </div>
      </div>

      {/* 14-Day Activity Trends Visual */}
      <div className="p-5 rounded-2xl glass-admin-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>14-Day Platform Growth & Activity Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Daily user onboarding and order throughput</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              <span className="text-slate-300">Registrations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
              <span className="text-slate-300">Orders</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-40 flex items-end gap-2 pt-4 border-b border-white/[0.06]">
          {trends.map((t, idx) => {
            const maxVal = Math.max(10, ...trends.map(x => Math.max(x.registrations, x.orders)));
            const regHeight = Math.max(4, Math.round((t.registrations / maxVal) * 110));
            const ordHeight = Math.max(4, Math.round((t.orders / maxVal) * 110));
            const dateLabel = t.date.slice(5);

            return (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 z-20 glass-admin-card px-2.5 py-1 rounded-lg text-[10px] text-white whitespace-nowrap pointer-events-none transition shadow-xl border border-white/20 font-mono">
                  <p className="font-bold">{t.date}</p>
                  <p>Users: {t.registrations} | Orders: {t.orders}</p>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-28">
                  <div
                    style={{ height: `${regHeight}px` }}
                    className="w-1/2 bg-sky-500/80 hover:bg-sky-400 rounded-t transition shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                  />
                  <div
                    style={{ height: `${ordHeight}px` }}
                    className="w-1/2 bg-indigo-500/80 hover:bg-indigo-400 rounded-t transition shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                  />
                </div>
                <span className="text-[9px] text-slate-500 font-mono tracking-tighter truncate w-full text-center">
                  {idx % 2 === 0 ? dateLabel : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Security & Audit Events */}
        <div className="p-5 rounded-2xl glass-admin-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Immutable Audit Trail</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-72">
            {recentActivity?.auditLogs?.length > 0 ? (
              recentActivity.auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] flex items-start justify-between gap-3 text-xs transition"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-semibold text-slate-200">{log.action}</span>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Entity: <span className="text-slate-300">{log.entityType || 'General'}</span> {log.entityId ? `(#${log.entityId.slice(-6)})` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center font-mono">No audit logs recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Simulated Orders */}
        <div className="p-5 rounded-2xl glass-admin-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-300" />
              <span>Simulated Orders Stream</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition"
            >
              <span>Manage Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-72">
            {recentActivity?.orders?.length > 0 ? (
              recentActivity.orders.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] flex items-center justify-between gap-3 text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white">{ord.id.slice(0, 14)}...</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                        Demo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {ord.retailerName} · ₹{ord.totalAmountInr}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    {ord.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center font-mono">No orders placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
