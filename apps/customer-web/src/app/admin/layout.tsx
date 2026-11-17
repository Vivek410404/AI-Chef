'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChefHat,
  LayoutDashboard,
  Users,
  Home,
  Store,
  ShoppingBag,
  BookOpen,
  ShieldCheck,
  UserCheck,
  Sliders,
  Activity,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Server,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Admin 2FA Login States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaSessionId, setMfaSessionId] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    // Background health check
    api.admin.getSystemHealth().then(setSystemHealth).catch(() => {});
  }, []);

  // Cooldown timer for 2FA resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const isStaff = user && ADMIN_ROLES.includes(user.role);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/households', label: 'Households', icon: Home },
    { href: '/admin/retailers', label: 'Retailers & Apps', icon: Store },
    { href: '/admin/orders', label: 'Orders & Ops', icon: ShoppingBag },
    { href: '/admin/recipes', label: 'Recipe Catalog', icon: BookOpen },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { href: '/admin/staff', label: 'Staff Management', icon: UserCheck, roles: ['SUPER_ADMIN'] },
    { href: '/admin/settings', label: 'Platform Settings', icon: Sliders, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { href: '/admin/system-health', label: 'System Health', icon: Activity }
  ];

  const handleAdminCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await api.adminLogin(adminEmail, adminPassword);
      if (res?.requiresMfa) {
        setMfaSessionId(res.mfaSessionId);
        setMaskedEmail(res.maskedEmail);
        setResendCooldown(45);
      } else {
        await refreshUser();
        router.refresh();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaSessionId || otpCode.trim().length !== 6) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      await api.adminVerifyOtp(mfaSessionId, otpCode.trim());
      await refreshUser();
      router.refresh();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid or expired verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!mfaSessionId || resendCooldown > 0) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      await api.adminResendOtp(mfaSessionId);
      setResendCooldown(45);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to dispatch new verification code.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-terracotta-400 animate-spin mx-auto mb-4" />
          <p className="text-stone-400 text-sm font-medium">Authenticating RasoiIQ Operations Console...</p>
        </div>
      </div>
    );
  }

  // Logged-in non-staff user (e.g. CUSTOMER)
  if (user && !isStaff) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Restricted Access</h1>
          <p className="text-stone-400 text-sm mb-6 leading-relaxed">
            The RasoiIQ Operations Console is strictly limited to authorized platform operators, administrators, and support personnel.
          </p>

          <div className="mb-6 p-4 rounded-xl bg-stone-950 border border-stone-800 text-left text-xs space-y-1.5">
            <p className="text-stone-400">Current Identity: <span className="text-white font-mono">{user.email}</span></p>
            <p className="text-stone-400">Assigned Role: <span className="text-amber-400 font-mono uppercase">{user.role}</span></p>
            <p className="text-red-400 font-semibold pt-1 border-t border-stone-800">
              Error: Customer accounts are not permitted in the management console.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                await logout();
                router.refresh();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-forest-700 hover:bg-forest-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-soft"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Enter Administrator Credentials</span>
            </button>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              Return to Customer App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: Real Admin Login & Two-Factor Authentication Gate
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl">
          {!mfaSessionId ? (
            /* Stage 1: Administrator Credentials Entry */
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-forest-950/80 border border-forest-700/60 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-soft">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                  RasoiIQ Operations Console
                </h1>
                <p className="text-xs text-stone-400 font-medium">
                  Two-factor verified administrative access only
                </p>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wider">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@rasoiiq.in"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !adminEmail || !adminPassword}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-soft"
                >
                  {authLoading ? (
                    <>
                      <ChefHat className="w-4 h-4 animate-spin text-terracotta-200" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify Identity & Send Access Code</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-stone-800 text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Customer App</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Stage 2: Two-Factor Email OTP Verification */
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-soft">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                  Two-Factor Verification
                </h1>
                <p className="text-xs text-stone-400 font-medium">
                  A 6-digit access code was sent to:
                </p>
                <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 text-xs font-mono text-emerald-400">
                  {maskedEmail}
                </div>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-2 uppercase tracking-wider text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 text-center text-2xl font-mono tracking-[0.5em] text-emerald-300 placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  />
                  <p className="text-[11px] text-stone-500 text-center mt-1.5">
                    Code expires in 10 minutes. Check spam folder if not received.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || otpCode.trim().length !== 6}
                  className="w-full py-3 px-4 rounded-xl bg-forest-700 hover:bg-forest-600 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition shadow-soft"
                >
                  {authLoading ? (
                    <>
                      <ChefHat className="w-4 h-4 animate-spin text-terracotta-200" />
                      <span>Authenticating Access...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Code & Enter Console</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between text-xs border-t border-stone-800 pt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || authLoading}
                  className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-200 disabled:text-stone-600 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${authLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaSessionId(null);
                    setOtpCode('');
                    setAuthError(null);
                  }}
                  className="text-stone-400 hover:text-stone-200 transition"
                >
                  Sign in with another account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-900/60 text-purple-200 border-purple-700',
    ADMIN: 'bg-blue-900/60 text-blue-200 border-blue-700',
    OPERATIONS: 'bg-amber-900/60 text-amber-200 border-amber-700',
    SUPPORT: 'bg-teal-900/60 text-teal-200 border-teal-700'
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 border-r border-stone-800 flex flex-col transition-transform duration-200 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="h-16 px-6 border-b border-stone-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-terracotta-600 flex items-center justify-center text-white shadow-soft">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">Rasoi</span>
              <span className="font-extrabold text-lg text-terracotta-400">IQ</span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-800 text-stone-400 border border-stone-700">
                Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity info card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-stone-950/70 border border-stone-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-300 truncate max-w-[130px]">{user.fullName}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadgeColors[user.role] || 'bg-stone-800 text-stone-300'}`}>
              {user.role}
            </span>
          </div>
          <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems
            .filter(item => !item.roles || item.roles.includes(user.role))
            .map(item => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-terracotta-600/20 text-terracotta-300 border border-terracotta-500/40 font-semibold'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-terracotta-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Bottom links */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <span>Customer Web App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-stone-900/80 backdrop-blur-md border-b border-stone-800 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-stone-400 hover:bg-stone-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
              <span>RasoiIQ Admin</span>
              <ChevronRight className="w-3 h-3 text-stone-600" />
              <span className="text-stone-200 capitalize font-medium">
                {pathname.split('/')[2] || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-stone-300 font-medium hidden sm:inline">PostgreSQL 18</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Online</span>
            </div>

            {/* Verified Admin Role Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                {user.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
