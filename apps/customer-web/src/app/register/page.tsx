'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChefHat, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  // Password strength check
  const isLongEnough = password.length >= 12;
  const hasMixedChars = /[a-zA-Z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLongEnough) {
      setError('Password must be at least 12 characters long');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms of Service to create an account');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword,
        acceptTerms
      });

      setSuccess(true);
      if (res?.emailPreviewUrl) {
        setEmailPreviewUrl(res.emailPreviewUrl);
      }
      // Also fetch direct dev link from dev emails endpoint
      fetch(`/api/dev/emails?email=${encodeURIComponent(email.trim().toLowerCase())}`)
        .then(r => r.json())
        .then(data => {
          if (data && data[0]?.link) {
            setEmailPreviewUrl(data[0].link);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Registration failed');
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
          Create your free account
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Join Indian households optimizing meals, nutrition, and groceries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 shadow-soft rounded-3xl border border-cream-300 sm:px-10">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-forest-50 text-forest-700 rounded-full flex items-center justify-center mx-auto border border-forest-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-forest-950">Verification Email Sent</h3>
              <p className="text-sm text-stone-600 max-w-sm mx-auto">
                We sent a secure verification link to <span className="font-bold text-forest-900">{email}</span>. Click the link in your email to activate your account.
              </p>

              {emailPreviewUrl && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left space-y-2">
                  <p className="font-bold text-sm text-forest-950 flex items-center gap-1.5">
                    <span>🛠️ Local Development Mode</span>
                  </p>
                  <p className="text-stone-600">
                    Because this environment operates locally with ₹0 budget, outgoing emails are captured locally instead of sending to real inboxes.
                  </p>
                  <div className="pt-1">
                    <a
                      href={emailPreviewUrl}
                      className="inline-flex items-center gap-1.5 font-bold text-white bg-forest-700 hover:bg-forest-800 px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      <span>Verify Account Instantly</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-soft"
                >
                  Proceed to Login
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
                    {error.toLowerCase().includes('already exists') && (
                      <div className="mt-2">
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-forest-950 underline"
                        >
                          Sign in to your existing account &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Pooja Sharma"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pooja@sharma.in"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Mobile Number <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Password <span className="text-stone-400 font-normal">(min 12 characters)</span>
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-11 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
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
                {password && (
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span className={`font-semibold ${isLongEnough ? 'text-forest-600' : 'text-red-500'}`}>
                      {isLongEnough ? '✓ 12+ chars' : '✗ Need 12+ chars'}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className={`font-semibold ${hasMixedChars ? 'text-forest-600' : 'text-amber-600'}`}>
                      {hasMixedChars ? '✓ Strong' : 'Recommend letters & numbers'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-10 pr-11 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`mt-1 text-[11px] font-semibold ${passwordsMatch ? 'text-forest-600' : 'text-red-500'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded text-forest-700 focus:ring-forest-600"
                />
                <label htmlFor="terms" className="text-xs text-stone-600 leading-snug">
                  I agree to the <span className="font-semibold text-forest-900">Terms of Service</span>, <span className="font-semibold text-forest-900">Privacy Policy</span>, and understand that simulated orders do not incur real financial charges.
                </label>
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
                      <span>Create Household Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-stone-600">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-terracotta-600 hover:text-terracotta-700 underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
