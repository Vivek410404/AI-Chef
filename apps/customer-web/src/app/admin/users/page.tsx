'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Shield,
  Ban,
  CheckCircle,
  KeyRound,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  // Modals state
  const [suspendModalUser, setSuspendModalUser] = useState<any | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.admin.getUsers({
        page,
        limit: 20,
        q: q || undefined,
        role: role || undefined,
        status: status || undefined
      });
      setUsers(res.users || []);
      setPagination(res.pagination || { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [role, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleStatus = async () => {
    if (!suspendModalUser) return;
    const newStatus = suspendModalUser.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';

    if (newStatus === 'SUSPENDED' && !suspensionReason.trim()) {
      alert('A suspension reason is mandatory for compliance.');
      return;
    }

    try {
      setActionLoading(true);
      await api.admin.updateUserStatus(suspendModalUser.id, newStatus, suspensionReason);
      setActionMessage({
        type: 'success',
        text: `User ${suspendModalUser.email} has been ${newStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'}.`
      });
      setSuspendModalUser(null);
      setSuspensionReason('');
      fetchUsers(pagination.page);
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSessions = async (userId: string, email: string) => {
    if (!confirm(`Revoke all active sessions and refresh tokens for ${email}?`)) return;
    try {
      const res = await api.admin.revokeUserSessions(userId, 'Administrative security reset');
      setActionMessage({ type: 'success', text: res.message || 'Sessions revoked successfully.' });
      fetchUsers(pagination.page);
    } catch (err: any) {
      alert(`Failed to revoke sessions: ${err.message}`);
    }
  };

  const handleResendVerification = async (userId: string, email: string) => {
    try {
      const res = await api.admin.resendUserVerification(userId);
      setActionMessage({ type: 'success', text: res.message || `Verification link sent to ${email}` });
    } catch (err: any) {
      alert(`Failed to resend verification: ${err.message}`);
    }
  };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-900/60 text-purple-200 border-purple-700',
    ADMIN: 'bg-blue-900/60 text-blue-200 border-blue-700',
    OPERATIONS: 'bg-amber-900/60 text-amber-200 border-amber-700',
    SUPPORT: 'bg-teal-900/60 text-teal-200 border-teal-700',
    RETAILER: 'bg-orange-900/60 text-orange-200 border-orange-700',
    CUSTOMER: 'bg-stone-800 text-stone-300 border-stone-700'
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-950 text-emerald-300 border-emerald-800/60',
    SUSPENDED: 'bg-red-950 text-red-300 border-red-800/60',
    PENDING_VERIFICATION: 'bg-amber-950 text-amber-300 border-amber-800/60'
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-terracotta-400" />
            <span>User Directory & Accounts</span>
          </h1>
          <p className="text-stone-400 text-xs mt-1">
            Search, inspect, suspend, and manage credentials across all platform identities
          </p>
        </div>
        <div className="text-xs text-stone-400">
          Total Users: <strong className="text-white">{pagination.total}</strong>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200' : 'bg-red-950/60 border border-red-800 text-red-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by full name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-terracotta-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="RETAILER">Retailer</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="OPERATIONS">Operations</option>
            <option value="SUPPORT">Support</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>

          <button
            onClick={() => fetchUsers(1)}
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
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Households</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-terracotta-400" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleColors[u.role] || 'bg-stone-800 text-stone-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[u.status] || 'bg-stone-800 text-stone-300'}`}>
                        {u.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      {u._count?.households || 0}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-medium">
                      {u._count?.orders || 0}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setSuspendModalUser(u);
                            setSuspensionReason(u.suspensionReason || '');
                          }}
                          className={`p-1.5 rounded-lg transition ${
                            u.status === 'SUSPENDED'
                              ? 'bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300'
                              : 'bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300'
                          }`}
                          title={u.status === 'SUSPENDED' ? 'Reactivate Account' : 'Suspend Account'}
                        >
                          {u.status === 'SUSPENDED' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRevokeSessions(u.id, u.email)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 transition"
                          title="Revoke Sessions"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {u.status === 'PENDING_VERIFICATION' && (
                          <button
                            onClick={() => handleResendVerification(u.id, u.email)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-blue-300 hover:text-blue-200 transition"
                            title="Resend Verification Link"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suspend / Reactivate Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                suspendModalUser.status === 'SUSPENDED' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
              }`}>
                {suspendModalUser.status === 'SUSPENDED' ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {suspendModalUser.status === 'SUSPENDED' ? 'Reactivate User Account' : 'Suspend User Account'}
                </h3>
                <p className="text-xs text-stone-400 font-mono">{suspendModalUser.email}</p>
              </div>
            </div>

            {suspendModalUser.status !== 'SUSPENDED' ? (
              <div className="space-y-3">
                <p className="text-xs text-stone-300">
                  Suspending this user will immediately invalidate all active JWT refresh tokens and sessions, blocking login across all devices.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                    Mandatory Reason for Suspension:
                  </label>
                  <textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder="E.g., Suspected fraudulent order generation, terms breach..."
                    rows={3}
                    className="w-full p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-300">
                Reactivating this account will restore standard login capabilities and household access.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSuspendModalUser(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${
                  suspendModalUser.status === 'SUSPENDED'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {actionLoading ? 'Processing...' : suspendModalUser.status === 'SUSPENDED' ? 'Confirm Reactivation' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
