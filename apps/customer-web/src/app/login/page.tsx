'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChefHat, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setResendStatus(null);
    setIsLoading(true);

    try {
      await api.login(email.trim(), password);
      await refreshUser();
      router.push('/');
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      if (msg.includes('403') && msg.toLowerCase().includes('verify')) {
        setUnverifiedEmail(email.trim());
      }
      setError(msg.replace(/^API \d+:\s*/, ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    try {
      await api.resendVerification(unverifiedEmail);
      setResendStatus('Verification link resent. Check your inbox or dev preview.');
    } catch {
      setResendStatus('Failed to resend verification link.');
    }
  };

  const handleQuickDemo = async (role: 'CUSTOMER' | 'RETAILER' | 'ADMIN', householdId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.getDemoSession(role, householdId ? { householdId } : undefined);
      await refreshUser();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Demo session initialization failed');
    } finally {
      setIsLoading(false);
    }
  };

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
          Sign in to your household
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Manage your AI meal plans, pantry inventory and multi-grocer cart
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 shadow-soft rounded-3xl border border-cream-300 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="mt-2 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 underline"
                  >
                    Resend verification email
                  </button>
                )}
                {resendStatus && (
                  <p className="mt-1 text-xs text-forest-700 font-semibold">{resendStatus}</p>
                )}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                Email Address
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pooja@sharma.in"
                  className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-2xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-11 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-600 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to RasoiIQ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cream-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-3 text-stone-500 font-medium">Or quick demo access</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER', 'hh-sharma-family')}
                className="py-2 px-2 text-xs font-semibold rounded-xl bg-forest-50 text-forest-800 hover:bg-forest-100 border border-forest-200 transition-all text-center"
              >
                Sharma (Veg)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER', 'hh-patel-family')}
                className="py-2 px-2 text-xs font-semibold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all text-center"
              >
                Patel (Jain)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER', 'hh-mehta-family')}
                className="py-2 px-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all text-center"
              >
                Mehta (Kathiyawadi)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-stone-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-terracotta-600 hover:text-terracotta-700 underline">
              Create a free account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
