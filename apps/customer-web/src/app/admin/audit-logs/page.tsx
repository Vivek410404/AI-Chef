'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Terminal,
  FileCode
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.admin.getAuditLogs({
        page,
        limit: 25,
        q: q || undefined,
        action: action || undefined
      });
      setLogs(res.auditLogs || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 });
    } catch (err: any) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [action]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getActionColor = (act: string) => {
    if (act.includes('SUSPEND') || act.includes('REJECT') || act.includes('REVOKE') || act.includes('FAILURE')) {
      return 'bg-red-950 text-red-300 border-red-800';
    }
    if (act.includes('APPROVE') || act.includes('CREATE') || act.includes('SUCCESS') || act.includes('VERIFIED')) {
      return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
    if (act.includes('MODIFY') || act.includes('UPDATE') || act.includes('CHANGED') || act.includes('RESET')) {
      return 'bg-amber-950 text-amber-300 border-amber-800';
    }
    return 'bg-stone-800 text-stone-300 border-stone-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Immutable Platform Audit Stream</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Complete append-only security logs of administrative actions, identity lifecycle, and role changes
          </p>
        </div>
        <div className="text-xs text-stone-400">
          Total Recorded Events: <strong className="text-white">{pagination.total}</strong>
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
            placeholder="Search by action, entity type, actor email, or entity ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-terracotta-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="">All Actions</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="USER_REACTIVATED">USER_REACTIVATED</option>
            <option value="SESSIONS_REVOKED">SESSIONS_REVOKED</option>
            <option value="RETAILER_APPROVED">RETAILER_APPROVED</option>
            <option value="RETAILER_REJECTED">RETAILER_REJECTED</option>
            <option value="ORDER_STATUS_CHANGED">ORDER_STATUS_CHANGED</option>
            <option value="RECIPE_CREATED">RECIPE_CREATED</option>
            <option value="RECIPE_MODIFIED">RECIPE_MODIFIED</option>
            <option value="RECIPE_ARCHIVED">RECIPE_ARCHIVED</option>
            <option value="STAFF_CREATED">STAFF_CREATED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
          </select>

          <button
            onClick={() => fetchLogs(1)}
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
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-sans">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3 px-4 text-stone-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-200">
                      {log.user?.email || log.userId || 'system'}
                    </td>
                    <td className="py-3 px-4 text-stone-300">
                      {log.entityType ? `${log.entityType} (${log.entityId ? log.entityId.slice(0, 10) + '...' : ''})` : '—'}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs transition"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Metadata</span>
                      </button>
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
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Audit Event: {selectedLog.action}</span>
                </h3>
                <p className="text-xs text-stone-400 font-mono mt-0.5">ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-stone-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-stone-400">
                <p>Actor: <span className="text-white font-mono">{selectedLog.user?.email || selectedLog.userId}</span></p>
                <p>IP Address: <span className="text-white font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span></p>
                <p>Entity: <span className="text-white font-mono">{selectedLog.entityType || 'N/A'}</span></p>
                <p>Target ID: <span className="text-white font-mono">{selectedLog.entityId || 'N/A'}</span></p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  Structured Payload / Metadata:
                </label>
                <pre className="p-3 rounded-xl bg-stone-950 border border-stone-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold text-stone-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
