'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChefHat, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing email verification token in link.');
      return;
    }

    let isMounted = true;
    const verify = async () => {
      try {
        const res = await api.verifyEmail(token);
        if (isMounted) {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully! Your account is active.');
          await refreshUser();
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message?.replace(/^API \d+:\s*/, '') || 'Email verification token is invalid or has expired.');
        }
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="bg-surface py-8 px-6 shadow-soft rounded-3xl border border-cream-300 sm:px-10 text-center">
      {status === 'verifying' && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-10 h-10 text-forest-700 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-forest-950">Verifying Email</h3>
          <p className="text-sm text-stone-600">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8 space-y-4">
          <div className="w-16 h-16 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto border border-forest-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-forest-950">Account Verified!</h3>
          <p className="text-sm text-stone-600 max-w-sm mx-auto">{message}</p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-soft"
            >
              <span>Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8 space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-forest-950">Verification Failed</h3>
          <p className="text-sm text-stone-600 max-w-sm mx-auto">{message}</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center py-2.5 px-5 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-soft group-hover:bg-forest-800 transition-all">
            <ChefHat className="w-7 h-7 text-terracotta-200" />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-3xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-3xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={
          <div className="bg-surface py-12 px-6 rounded-3xl border border-cream-300 text-center">
            <Loader2 className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-stone-600">Loading verification...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
