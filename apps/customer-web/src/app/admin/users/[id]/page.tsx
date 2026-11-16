'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Shield,
  Home,
  ShoppingBag,
  KeyRound,
  Ban,
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  AlertTriangle,
  RefreshCw,
  Store
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getUserById(userId);
      setUser(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  const handleRevoke = async () => {
    if (!confirm('Revoke all sessions and refresh tokens for this user?')) return;
    try {
      const res = await api.admin.revokeUserSessions(userId, 'Administrative security reset');
      setActionMessage(res.message);
      fetchUser();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const reason = newStatus === 'SUSPENDED' ? prompt('Enter reason for suspension:') : undefined;
    if (newStatus === 'SUSPENDED' && !reason) return;

    try {
      await api.admin.updateUserStatus(userId, newStatus, reason || undefined);
      setActionMessage(`User account status updated to ${newStatus}`);
      fetchUser();
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-terracotta-400" />
        Loading user profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-200">
        <h3 className="font-bold text-lg mb-2">User Not Found</h3>
        <p className="text-sm mb-4">{error || 'The requested user could not be located in PostgreSQL.'}</p>
        <Link href="/admin/users" className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold">
          Return to Users Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              user.status === 'SUSPENDED'
                ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800'
            }`}
          >
            {user.status === 'SUSPENDED' ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
            <span>{user.status === 'SUSPENDED' ? 'Reactivate Account' : 'Suspend Account'}</span>
          </button>

          <button
            onClick={handleRevoke}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Revoke Sessions</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)}>×</button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-900/60 text-purple-200 border border-purple-700">
                {user.role}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-red-950 text-red-300 border-red-800'
              }`}>
                {user.status}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-mono mt-1">{user.email}</p>
          </div>

          <div className="text-xs text-stone-400 space-y-1 text-right sm:text-left">
            <p>ID: <span className="font-mono text-stone-300">{user.id}</span></p>
            <p>Joined: <span className="text-stone-300">{new Date(user.createdAt).toLocaleDateString()}</span></p>
          </div>
        </div>

        {/* Suspension Banner if Suspended */}
        {user.status === 'SUSPENDED' && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-300">Account Suspended</span>
              <p className="text-red-200 mt-0.5">Reason: {user.suspensionReason || 'Administrative suspension'}</p>
              <p className="text-stone-400 mt-1">
                Suspended on {new Date(user.suspendedAt).toLocaleString()} by {user.suspendedBy || 'Admin'}
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Households</span>
            <p className="text-xl font-black text-white mt-1">{user.households?.length || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Simulated Orders</span>
            <p className="text-xl font-black text-white mt-1">{user._count?.orders || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Active Sessions</span>
            <p className="text-xl font-black text-white mt-1">{user._count?.sessions || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Email Verified</span>
            <p className="text-xs font-semibold mt-2 text-emerald-400">
              {user.emailVerifiedAt ? 'Verified' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Associated Households */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Home className="w-4 h-4 text-emerald-400" />
          <span>Associated Households</span>
        </h3>

        {user.households && user.households.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.households.map((hh: any) => (
              <div key={hh.id} className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{hh.name}</h4>
                  <p className="text-xs text-stone-400">{hh.city} · {hh.dietaryPreference} · Size: {hh.size}</p>
                </div>
                <Link
                  href={`/admin/households/${hh.id}`}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-4 text-center">No owned households for this user.</p>
        )}
      </div>

      {/* Merchant Applications */}
      {user.retailerApps && user.retailerApps.length > 0 && (
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Merchant Onboarding Applications</span>
          </h3>
          <div className="space-y-2">
            {user.retailerApps.map((app: any) => (
              <div key={app.id} className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{app.businessName}</h4>
                  <p className="text-xs text-stone-400">
                    Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                  app.applicationStatus === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {app.applicationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
