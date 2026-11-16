'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChefHat, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLongEnough = newPassword.length >= 12;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing reset token. Please request a new link.');
      return;
    }
    if (!isLongEnough) {
      setError('Password must be at least 12 characters long');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.resetPassword(token, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-forest-950">Missing Reset Token</h3>
        <p className="text-sm text-stone-600">The password reset link is invalid or incomplete.</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition-all"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto border border-forest-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-forest-950">Password Reset Complete</h3>
        <p className="text-sm text-stone-600">
          Your password has been securely updated. You can now log in with your new credentials.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-soft"
          >
            <span>Sign In Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
          New Password <span className="text-stone-400 font-normal">(min 12 characters)</span>
        </label>
        <div className="relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
          />
        </div>
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
        <div className="relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
          />
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
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Save New Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-soft group-hover:bg-forest-800 transition-all">
            <ChefHat className="w-7 h-7 text-terracotta-200" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-3xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-3xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-forest-950">
          Create a new password
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Choose a secure passphrase of at least 12 characters
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 shadow-soft rounded-3xl border border-cream-300 sm:px-10">
          <Suspense fallback={
            <div className="py-8 text-center">
              <Loader2 className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
