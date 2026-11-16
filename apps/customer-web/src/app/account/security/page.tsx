'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Shield, Lock, CheckCircle2, AlertCircle, ArrowLeft, LogOut, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function AccountSecurityPage() {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLongEnough = newPassword.length >= 12;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLongEnough) {
      setError('New password must be at least 12 characters long');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      setSuccess(res.message || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to log out of all active devices and browser sessions?')) return;
    try {
      await api.logoutAll();
      await logout();
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to log out of all sessions');
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </div>

        {/* Account Overview Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-forest-950">{user?.fullName || 'Account Security'}</h2>
              <p className="text-xs text-stone-600">{user?.email || 'Logged in user'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cream-200 text-xs">
            <div>
              <span className="text-stone-500">Role:</span>
              <p className="font-bold text-forest-900">{user?.role || 'CUSTOMER'}</p>
            </div>
            <div>
              <span className="text-stone-500">Email Status:</span>
              <p className="font-bold text-forest-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="w-5 h-5 text-forest-700" />
            <h3 className="text-lg font-bold text-forest-950">Change Password</h3>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-2xl bg-forest-50 border border-forest-200 flex items-start gap-2.5 text-forest-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                New Password <span className="text-stone-400 font-normal">(min 12 characters)</span>
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface"
              />
              {newPassword && (
                <p className={`mt-1 text-[11px] font-semibold ${isLongEnough ? 'text-forest-600' : 'text-red-500'}`}>
                  {isLongEnough ? '✓ 12+ characters met' : '✗ Must be at least 12 characters'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface"
              />
              {confirmPassword && (
                <p className={`mt-1 text-[11px] font-semibold ${passwordsMatch ? 'text-forest-600' : 'text-red-500'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-6 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-soft disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Sessions & Device Management Links */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-forest-950">Active Devices & Sessions</h3>
              <p className="text-xs text-stone-600">Inspect signed-in browsers and revoke individual sessions</p>
            </div>
            <Link
              href="/account/sessions"
              className="py-2 px-4 rounded-xl bg-cream-200 text-forest-900 text-xs font-bold hover:bg-cream-300 transition-colors"
            >
              View Sessions
            </Link>
          </div>

          <div className="pt-4 border-t border-cream-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-red-900">Sign Out All Devices</h4>
              <p className="text-[11px] text-stone-500">Revoke all active refresh sessions across all browsers</p>
            </div>
            <button
              type="button"
              onClick={handleLogoutAll}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 border border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out Everywhere</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
