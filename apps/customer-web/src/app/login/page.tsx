'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChefHat, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  useEffect(() => {
    if (searchParams.get('logged_out') === '1') {
      setJustLoggedOut(true);
    }
  }, [searchParams]);

  // If already authenticated, redirect to app
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '';
      router.push(redirect ? `/#${redirect}` : '/');
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuspended(false);
    setUnverifiedEmail(null);
    setResendStatus(null);
    setJustLoggedOut(false);
    setIsLoading(true);

    try {
      await api.login(email.trim(), password);
      await refreshUser();
      const redirect = searchParams.get('redirect') || '';
      router.push(redirect ? `/#${redirect}` : '/');
    } catch (err: any) {
      const rawMsg = err.message || 'Login failed. Please check your credentials.';
      const cleanMsg = rawMsg.replace(/^API \d+:\s*/, '');

      if (cleanMsg.toLowerCase().includes('suspended')) {
        setIsSuspended(true);
        setError('Your account has been suspended by platform administration. Access is restricted.');
      } else if (cleanMsg.toLowerCase().includes('verify') || cleanMsg.toLowerCase().includes('verification')) {
        setUnverifiedEmail(email.trim());
        setError('Email address has not been verified. Please check your inbox or resend the link.');
      } else if (cleanMsg.toLowerCase().includes('credentials') || rawMsg.includes('401')) {
        setError('Invalid email or password. Please verify your credentials and try again.');
      } else {
        setError(cleanMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    try {
      await api.resendVerification(unverifiedEmail);
      setResendStatus('Verification link resent. Please check your email inbox.');
    } catch {
      setResendStatus('Failed to resend verification link. Please try again.');
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
          
          {/* Logout Confirmation Banner */}
          {justLoggedOut && (
            <div className="mb-6 p-4 rounded-2xl bg-forest-50 border border-forest-200 flex items-center gap-3 text-forest-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0" />
              <p className="font-medium">You have been successfully signed out of RasoiIQ.</p>
            </div>
          )}

          {/* Suspended Account Banner */}
          {isSuspended && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Account Suspended</p>
                <p className="text-xs text-red-700 mt-1">
                  This account has been suspended under platform security policies. Active tokens and sessions have been revoked. Contact your pilot supervisor.
                </p>
              </div>
            </div>
          )}

          {/* Unverified Email or General Error */}
          {error && !isSuspended && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {unverifiedEmail && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 underline"
                    >
                      Resend verification email
                    </button>
                  </div>
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
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-forest-600 focus:ring-forest-500 border-cream-300"
                />
                <span className="text-xs text-stone-600 font-medium">Keep me signed in on this device</span>
              </label>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 flex items-center justify-center text-xs text-stone-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
