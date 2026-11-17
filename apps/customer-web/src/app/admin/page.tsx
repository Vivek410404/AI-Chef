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
        <div className="glass-admin-card px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl">
          <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
          <span className="text-stone-300 text-sm font-medium">Loading platform metrics from PostgreSQL...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 backdrop-blur-xl text-red-200 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="font-bold text-lg text-white">Error Loading Dashboard</h3>
        </div>
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 border border-red-500/40 text-xs font-semibold text-white shadow-soft transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { userStats, householdStats, retailerStats, orderStats, recipeStats, recentActivity } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Platform Overview</h1>
          <p className="text-stone-400 text-sm mt-1">
            Real-time multi-household operations, database metrics, and service health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 hidden sm:inline font-mono">
            Updated: {new Date(data?.timestamp || Date.now()).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-admin-card glass-admin-card-hover text-stone-200 text-xs font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="p-4 rounded-2xl glass-admin-card bg-amber-500/[0.06] border-amber-500/20 flex items-start gap-3 backdrop-blur-xl">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-amber-300 mr-2">Simulated Order Environment</span>
          All {orderStats?.total || 0} customer transactions in this platform instance are labeled as DEMO / SIMULATED orders. Zero real banking or payment gateways are debited.
        </div>
      </div>

      {/* 4 Glass Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Users</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{userStats?.total || 0}</span>
            <span className="text-xs text-emerald-400 font-bold">{userStats?.active || 0} Active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-stone-400">
            <span>Suspended: <strong className="text-stone-200">{userStats?.suspended || 0}</strong></span>
            <span>Unverified: <strong className="text-stone-200">{userStats?.pendingVerification || 0}</strong></span>
          </div>
        </div>

        {/* Households Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Active Kitchens</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{householdStats?.total || 0}</span>
            <span className="text-xs text-stone-400 font-medium">Households</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-stone-400">
            <span>Vegetarian: <strong className="text-stone-200">{householdStats?.byDietaryPreference?.VEGETARIAN || 0}</strong></span>
            <span>Jain: <strong className="text-stone-200">{householdStats?.byDietaryPreference?.JAIN || 0}</strong></span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Simulated Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{orderStats?.total || 0}</span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Demo GMV</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-stone-400">
            <span>Total: <strong className="text-white">₹{orderStats?.totalAmountInr?.toLocaleString() || 0}</strong></span>
            <span>AOV: <strong className="text-white">₹{orderStats?.avgOrderValueInr || 0}</strong></span>
          </div>
        </div>

        {/* Recipes Card */}
        <div className="glass-admin-card glass-admin-card-hover rounded-3xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Recipe Catalog</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{recipeStats?.total || 0}</span>
            <span className="text-xs text-purple-400 font-bold">{recipeStats?.active || 0} Ready</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-stone-400">
            <span>Jain Friendly: <strong className="text-stone-200">{recipeStats?.jainFriendly || 0}</strong></span>
            <span>Archived: <strong className="text-stone-200">{recipeStats?.archived || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Applications & Retailers summary bar */}
      <div className="p-5 rounded-3xl glass-admin-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-emerald-400 shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Retail Partners & Onboarding Pipeline</h4>
            <p className="text-xs text-stone-400">
              {retailerStats?.total || 0} active merchants (Blinkit, Zepto, DMart Ready, BigBasket)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {retailerStats?.pendingApplications > 0 ? (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{retailerStats.pendingApplications} Pending Merchant Application(s)</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-stone-400 text-xs">
              No pending applications
            </div>
          )}
          <Link
            href="/admin/retailers"
            className="px-4 py-2 rounded-xl glass-admin-card glass-admin-card-hover text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <span>Review</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </Link>
        </div>
      </div>

      {/* 14-Day Activity Trends Visual */}
      <div className="p-6 rounded-3xl glass-admin-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>14-Day Platform Growth & Velocity</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Aggregated daily registrations and simulated orders</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              <span className="text-stone-300">Registrations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span className="text-stone-300">Orders</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-44 flex items-end gap-2 pt-4 border-b border-white/[0.08]">
          {trends.map((t, idx) => {
            const maxVal = Math.max(10, ...trends.map(x => Math.max(x.registrations, x.orders)));
            const regHeight = Math.max(4, Math.round((t.registrations / maxVal) * 120));
            const ordHeight = Math.max(4, Math.round((t.orders / maxVal) * 120));
            const dateLabel = t.date.slice(5);

            return (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 z-20 glass-admin-card px-2.5 py-1 rounded-xl text-[10px] text-white whitespace-nowrap pointer-events-none transition shadow-xl border border-white/20">
                  <p className="font-bold">{t.date}</p>
                  <p>Users: {t.registrations} | Orders: {t.orders}</p>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-32">
                  <div
                    style={{ height: `${regHeight}px` }}
                    className="w-1/2 bg-blue-500/70 hover:bg-blue-400 rounded-t transition shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                  />
                  <div
                    style={{ height: `${ordHeight}px` }}
                    className="w-1/2 bg-emerald-500/70 hover:bg-emerald-400 rounded-t transition shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  />
                </div>
                <span className="text-[9px] text-stone-500 font-mono tracking-tighter truncate w-full text-center">
                  {idx % 2 === 0 ? dateLabel : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security & Audit Events */}
        <div className="p-6 rounded-3xl glass-admin-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Audit Stream</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80">
            {recentActivity?.auditLogs?.length > 0 ? (
              recentActivity.auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-start justify-between gap-3 text-xs transition"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-stone-200">{log.action}</span>
                    <p className="text-[11px] text-stone-400">
                      Entity: <span className="text-stone-300">{log.entityType || 'General'}</span> {log.entityId ? `(#${log.entityId.slice(-6)})` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 py-8 text-center">No audit logs recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Simulated Orders */}
        <div className="p-6 rounded-3xl glass-admin-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Recent Simulated Orders</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
            >
              <span>Manage Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80">
            {recentActivity?.orders?.length > 0 ? (
              recentActivity.orders.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between gap-3 text-xs transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{ord.id.slice(0, 14)}...</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Demo
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {ord.retailerName} · ₹{ord.totalAmountInr}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {ord.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 py-8 text-center">No orders placed yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
