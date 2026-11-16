'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      setSubmitted(true);
      if (res?.emailPreviewUrl) {
        setEmailPreviewUrl(res.emailPreviewUrl);
      }
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Unable to submit request');
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
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Enter your registered email address to receive password recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 shadow-soft rounded-3xl border border-cream-300 sm:px-10">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto border border-forest-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-forest-950">Instructions Dispatched</h3>
              <p className="text-sm text-stone-600">
                If an account exists for <span className="font-bold text-forest-900">{email}</span>, a secure password reset link has been dispatched.
              </p>

              {emailPreviewUrl && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Development Mode:</span> Inspect token in the{' '}
                  <a
                    href="http://localhost:4000/api/dev/emails"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-forest-800 hover:text-forest-900"
                  >
                    Local Dev Mail Inbox
                  </a>
                </div>
              )}

              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Registered Email Address
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pooja@sharma.in"
                    className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
