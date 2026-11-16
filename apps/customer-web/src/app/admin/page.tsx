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
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-terracotta-400 animate-spin" />
        <span className="ml-3 text-stone-400 font-medium">Loading platform metrics from PostgreSQL...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-200">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="font-bold text-lg">Error Loading Dashboard</h3>
        </div>
        <p className="text-sm text-red-300 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 border border-red-700 text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { userStats, householdStats, retailerStats, orderStats, recipeStats, recentActivity } = data || {};

  return (
    <div className="space-y-8">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Platform Overview</h1>
          <p className="text-stone-400 text-sm mt-1">
            Real-time multi-household operations, database metrics, and service health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400 hidden sm:inline">
            Updated: {new Date(data?.timestamp || Date.now()).toLocaleTimeString()}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <span className="font-bold uppercase tracking-wider text-amber-300 mr-2">Simulated Order Environment</span>
          All {orderStats?.total || 0} customer transactions in this platform instance are labeled as DEMO / SIMULATED orders. Zero real banking or payment gateways are debited.
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{userStats?.total || 0}</span>
            <span className="text-xs text-emerald-400 font-medium">{userStats?.active || 0} Active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span>Suspended: <strong className="text-stone-300">{userStats?.suspended || 0}</strong></span>
            <span>Unverified: <strong className="text-stone-300">{userStats?.pendingVerification || 0}</strong></span>
          </div>
        </div>

        {/* Households Card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Active Households</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{householdStats?.total || 0}</span>
            <span className="text-xs text-stone-400 font-medium">Families</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span>Vegetarian: <strong className="text-stone-300">{householdStats?.byDietaryPreference?.VEGETARIAN || 0}</strong></span>
            <span>Jain: <strong className="text-stone-300">{householdStats?.byDietaryPreference?.JAIN || 0}</strong></span>
          </div>
        </div>

        {/* Orders Card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Simulated Orders</span>
            <div className="w-8 h-8 rounded-lg bg-terracotta-950 border border-terracotta-800/60 flex items-center justify-center text-terracotta-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{orderStats?.total || 0}</span>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Demo GMV</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span>Total: <strong className="text-white">₹{orderStats?.totalAmountInr?.toLocaleString() || 0}</strong></span>
            <span>AOV: <strong className="text-white">₹{orderStats?.avgOrderValueInr || 0}</strong></span>
          </div>
        </div>

        {/* Recipes Card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Recipe Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{recipeStats?.total || 0}</span>
            <span className="text-xs text-purple-400 font-medium">{recipeStats?.active || 0} Published</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
            <span>Jain Friendly: <strong className="text-stone-300">{recipeStats?.jainFriendly || 0}</strong></span>
            <span>Archived: <strong className="text-stone-300">{recipeStats?.archived || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Applications & Retailers summary bar */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300">
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
            <div className="px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>{retailerStats.pendingApplications} Pending Merchant Application(s)</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-400 text-xs">
              No pending applications
            </div>
          )}
          <Link
            href="/admin/retailers"
            className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <span>Review</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 14-Day Activity Trends Visual */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-terracotta-400" />
              <span>14-Day Platform Growth & Velocity</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Aggregated daily registrations and simulated orders</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-stone-300">Registrations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-terracotta-500" />
              <span className="text-stone-300">Orders</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="h-44 flex items-end gap-2 pt-4 border-b border-stone-800">
          {trends.map((t, idx) => {
            const maxVal = Math.max(10, ...trends.map(x => Math.max(x.registrations, x.orders)));
            const regHeight = Math.max(4, Math.round((t.registrations / maxVal) * 120));
            const ordHeight = Math.max(4, Math.round((t.orders / maxVal) * 120));
            const dateLabel = t.date.slice(5);

            return (
              <div key={t.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 z-20 bg-stone-950 border border-stone-700 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap pointer-events-none transition shadow-lg">
                  <p className="font-bold">{t.date}</p>
                  <p>Users: {t.registrations} | Orders: {t.orders}</p>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-32">
                  <div
                    style={{ height: `${regHeight}px` }}
                    className="w-1/2 bg-blue-500/80 hover:bg-blue-400 rounded-t transition"
                  />
                  <div
                    style={{ height: `${ordHeight}px` }}
                    className="w-1/2 bg-terracotta-500/80 hover:bg-terracotta-400 rounded-t transition"
                  />
                </div>
                <span className="text-[9px] text-stone-500 tracking-tighter truncate w-full text-center">
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
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Audit Stream</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs text-terracotta-400 hover:text-terracotta-300 font-semibold flex items-center gap-1"
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
                  className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start justify-between gap-3 text-xs"
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
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-terracotta-400" />
              <span>Recent Simulated Orders</span>
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-terracotta-400 hover:text-terracotta-300 font-semibold flex items-center gap-1"
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
                  className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{ord.id.slice(0, 14)}...</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-800 text-amber-300 border border-amber-800/40">
                        Demo
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {ord.retailerName} · ₹{ord.totalAmountInr}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
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
