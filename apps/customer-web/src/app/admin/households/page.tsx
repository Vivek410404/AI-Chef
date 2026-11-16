'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  Search,
  Filter,
  Users,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Flame,
  UtensilsCrossed
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminHouseholdsPage() {
  const [households, setHouseholds] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [dietary, setDietary] = useState('');

  const fetchHouseholds = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.admin.getHouseholds({
        page,
        limit: 20,
        q: q || undefined,
        dietaryPreference: dietary || undefined
      });
      setHouseholds(res.households || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: any) {
      console.error('Failed to fetch households:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds(1);
  }, [dietary]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHouseholds(1);
  };

  const dietaryColors: Record<string, string> = {
    VEGETARIAN: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
    JAIN: 'bg-amber-950 text-amber-300 border-amber-800/60',
    VEGAN: 'bg-teal-950 text-teal-300 border-teal-800/60',
    EGGETARIAN: 'bg-yellow-950 text-yellow-300 border-yellow-800/60',
    NON_VEGETARIAN: 'bg-red-950 text-red-300 border-red-800/60'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-400" />
            <span>Household Directory</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Family profiles, dietary preferences, spice calibration, and pantry inventory statistics
          </p>
        </div>
        <div className="text-xs text-stone-400">
          Total Households: <strong className="text-white">{pagination.total}</strong>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by household name, city, or owner email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-terracotta-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="">All Dietary Types</option>
            <option value="VEGETARIAN">Vegetarian</option>
            <option value="JAIN">Jain</option>
            <option value="VEGAN">Vegan</option>
            <option value="EGGETARIAN">Eggetarian</option>
            <option value="NON_VEGETARIAN">Non-Vegetarian</option>
          </select>

          <button
            onClick={() => fetchHouseholds(1)}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-white transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/70 border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Household</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Dietary Preference</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Pantry Items</th>
                <th className="py-3 px-4">Budget / Wk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-terracotta-400" />
                    Loading households...
                  </td>
                </tr>
              ) : households.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No households found.
                  </td>
                </tr>
              ) : (
                households.map((hh) => (
                  <tr key={hh.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{hh.name}</div>
                      <div className="text-[11px] text-stone-400">{hh.city}, {hh.state || 'India'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-300 font-medium">{hh.user?.fullName || 'Demo Owner'}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{hh.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${dietaryColors[hh.dietaryPreference] || 'bg-stone-800 text-stone-300'}`}>
                        {hh.dietaryPreference}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      {hh._count?.members || hh.size || 4}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      {hh._count?.pantryItems || 0}
                    </td>
                    <td className="py-3.5 px-4 text-white font-mono">
                      ₹{hh.weeklyBudgetInr?.toLocaleString() || 3000}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/households/${hh.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchHouseholds(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchHouseholds(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
