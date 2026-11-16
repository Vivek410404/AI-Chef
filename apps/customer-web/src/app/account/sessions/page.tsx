'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChefHat, Smartphone, Monitor, Globe, Trash2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AccountSessionsPage() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSessions();
      setSessions(res.sessions || []);
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    try {
      await api.revokeSession(sessionId);
      await loadSessions();
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Log out from all devices? You will need to sign in again.')) return;
    try {
      await api.logoutAll();
      await logout();
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to log out all sessions');
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/account/security"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to security</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-forest-950">Active Refresh Sessions</h2>
              <p className="mt-1 text-xs text-stone-600">
                Devices authorized to access your RasoiIQ account with rotating tokens
              </p>
            </div>
            {sessions.length > 0 && (
              <button
                type="button"
                onClick={handleRevokeAll}
                className="py-2 px-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 border border-red-200 transition-colors"
              >
                Revoke All
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-stone-500">Loading active sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No persistent refresh sessions found (running in development mode or active session stored in session cookie).
            </div>
          ) : (
            <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden">
              {sessions.map((s) => {
                const isMobile = s.deviceName?.toLowerCase().includes('mobile') || s.userAgent?.toLowerCase().includes('mobile');
                return (
                  <div key={s.id} className="p-4 bg-surface flex items-center justify-between text-xs hover:bg-cream-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cream-200 text-forest-800 flex items-center justify-center shrink-0 mt-0.5">
                        {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-forest-950">{s.deviceName || 'Web Browser'}</p>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-forest-100 text-forest-800">
                            Active
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 max-w-xs truncate font-mono mt-0.5">
                          {s.userAgent || 'Chrome/Safari Browser'}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Signed in: {new Date(s.createdAt).toLocaleString()} • IP: {s.ipAddress || '127.0.0.1'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevoke(s.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Revoke session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
