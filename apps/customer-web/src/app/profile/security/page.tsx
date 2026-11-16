'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  Monitor,
  Globe,
  Trash2,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ProfileSecurityPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Active sessions state
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=profile/security');
    }
  }, [isLoading, isAuthenticated, router]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await api.getSessions();
      setSessions(res.sessions || (Array.isArray(res) ? res : []));
    } catch (err: any) {
      setSessionError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to load active sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const isLongEnough = newPassword.length >= 10;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLongEnough) {
      setPasswordError('New password must be at least 10 characters long');
      return;
    }
    if (!passwordsMatch) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordSuccess(res.message || 'Password changed successfully. All active sessions have been signed out.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await loadSessions();
    } catch (err: any) {
      setPasswordError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setSessionError(null);
    setSessionSuccess(null);
    try {
      await api.revokeSession(sessionId);
      setSessionSuccess('Session revoked successfully.');
      await loadSessions();
      setTimeout(() => setSessionSuccess(null), 3000);
    } catch (err: any) {
      setSessionError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Log out from all authorized devices and browsers? You will need to sign in again.')) return;
    try {
      await api.logoutAll();
      await logout();
    } catch (err: any) {
      setSessionError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to log out all sessions');
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Active now';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Active';
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Profile</span>
          </Link>
          <span className="text-xs font-semibold text-stone-400">Security & Sessions</span>
        </div>

        {/* Page Header */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">Account & Security</h1>
              <p className="text-xs text-stone-600">
                Manage your credentials, rotating refresh sessions, and authorized access.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Change Password Card */}
          <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-forest-950">Change Password</h2>
                <p className="text-[11px] text-stone-500">Update your account passphrase</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 flex items-center gap-2.5 text-forest-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <p className="font-semibold">{passwordSuccess}</p>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="font-semibold">{passwordError}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Current Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-4 pr-11 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  New Password <span className="text-stone-400 font-normal">(min 10 characters)</span>
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-4 pr-11 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Confirm New Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-4 pr-11 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`mt-1 text-[11px] font-semibold ${passwordsMatch ? 'text-forest-600' : 'text-red-500'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-forest-950">Active Sessions</h2>
                  <p className="text-[11px] text-stone-500">Authorized devices & browsers</p>
                </div>
              </div>
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={handleLogoutAll}
                  className="py-1.5 px-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 border border-red-200 transition-colors"
                >
                  Revoke All
                </button>
              )}
            </div>

            {sessionSuccess && (
              <div className="p-3 rounded-2xl bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
                {sessionSuccess}
              </div>
            )}

            {sessionError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                {sessionError}
              </div>
            )}

            {isLoadingSessions ? (
              <div className="py-8 text-center text-xs text-stone-500">Loading active sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-500 bg-cream-50 rounded-2xl border border-cream-200 p-4">
                No persistent background sessions found. Current active session is managed via secure cookie.
              </div>
            ) : (
              <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden text-xs">
                {sessions.map((session) => (
                  <div key={session.id} className="p-3.5 flex items-center justify-between bg-surface hover:bg-cream-50/50 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-forest-950">
                        {session.userAgent?.includes('Mobile') ? (
                          <Smartphone className="w-3.5 h-3.5 text-stone-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-stone-400" />
                        )}
                        <span>{session.deviceName || 'Web Session'}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-1 max-w-[200px]">
                        {session.userAgent || 'Standard Browser'}
                      </p>
                      <p className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last used {formatDate(session.lastUsedAt || session.createdAt)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Revoke session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Guidance Section */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-stone-600 space-y-1.5">
              <p className="font-bold text-forest-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Security Guidelines</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-500">
                <li>RasoiIQ rotates session credentials automatically every 15 minutes.</li>
                <li>Changing your password signs out all active sessions across all devices.</li>
                <li>Tokens are protected by HTTP-only secure cookies and never stored in browser memory.</li>
              </ul>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
