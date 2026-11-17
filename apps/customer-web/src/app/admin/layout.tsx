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
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimedOut(true);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const isStaff = user && ADMIN_ROLES.includes(user.role);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    // Only run health check if user is verified staff
    if (isStaff) {
      api.admin.getSystemHealth().then(setSystemHealth).catch(() => {});
    }
  }, [isStaff]);

  // Cooldown timer for 2FA resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="min-h-screen glass-admin-bg text-slate-100 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#08090D', minHeight: '100vh' }}>
        <div className="glass-admin-card rounded-2xl p-8 text-center relative z-10 shadow-2xl border border-white/[0.1] max-w-sm w-full mx-4 backdrop-blur-2xl">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <ChefHat className="w-6 h-6 text-sky-400 animate-spin" />
          </div>
          <p className="text-white text-sm font-semibold tracking-wide">RasoiIQ Operations Console</p>
          <p className="text-slate-400 text-xs mt-1 font-mono">Authenticating secure administrative session...</p>
        </div>
      </div>
    );
  }

  // Logged-in non-staff user (e.g. CUSTOMER)
  if (user && !isStaff) {
    return (
      <div className="min-h-screen glass-admin-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#08090D', minHeight: '100vh' }}>
        <div className="max-w-md w-full glass-admin-card rounded-2xl p-8 sm:p-10 text-center shadow-2xl relative z-10 border border-white/[0.1] overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.2)]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Restricted Access</h1>
          <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
            The RasoiIQ Operations Console is strictly limited to authorized platform operators, administrators, and support personnel.
          </p>

          <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/[0.08] backdrop-blur-md text-left text-xs space-y-2">
            <p className="text-slate-400">Current Identity: <span className="text-white font-mono">{user.email}</span></p>
            <p className="text-slate-400">Assigned Role: <span className="text-amber-400 font-mono uppercase font-bold">{user.role}</span></p>
            <p className="text-red-400 font-semibold pt-1.5 border-t border-white/[0.08] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Customer accounts are not permitted in the management console.</span>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                await logout();
                router.refresh();
              }}
              className="w-full glass-admin-btn-primary py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Enter Administrator Credentials</span>
            </button>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              Return to Customer App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated: Real Admin Login & Two-Factor Authentication Gate (Obsidian Titanium Glass UI)
  if (!isStaff) {
    return (
      <div className="min-h-screen glass-admin-bg text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#08090D', minHeight: '100vh' }}>
        <div className="max-w-md w-full glass-admin-card rounded-2xl p-8 sm:p-9 shadow-2xl relative z-10 border border-white/[0.12] overflow-hidden backdrop-blur-2xl">
          {/* Top specular reflection accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

          {!mfaSessionId ? (
            /* Stage 1: Administrator Credentials Entry */
            <div>
              <div className="text-center mb-7">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 backdrop-blur-xl flex items-center justify-center mx-auto mb-3.5 text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.25)]">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                  RasoiIQ Operations
                </h1>
                <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
                  Two-factor verified console access
                </p>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 backdrop-blur-md text-xs text-red-200 flex items-start gap-2.5 shadow-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="admin@rasoiiq.in"
                      className="w-full glass-admin-input rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full glass-admin-input rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !adminEmail || !adminPassword}
                  className="w-full mt-2 glass-admin-btn-primary py-3 px-4 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <ChefHat className="w-4 h-4 animate-spin text-sky-200" />
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

              <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
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
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 backdrop-blur-xl flex items-center justify-center mx-auto mb-3.5 text-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.25)]">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                  Two-Factor Verification
                </h1>
                <p className="text-xs text-slate-400 mb-2.5">
                  A 6-digit access code was dispatched to:
                </p>
                <div className="inline-block px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-xs font-mono font-bold text-sky-300 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                  {maskedEmail}
                </div>
              </div>

              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 backdrop-blur-md text-xs text-red-200 flex items-start gap-2.5 shadow-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{authError}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold text-slate-300 mb-2 uppercase tracking-wider text-center">
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
                    className="w-full glass-admin-input rounded-xl py-3 text-center text-3xl font-mono tracking-[0.45em] text-sky-300 placeholder-slate-600 font-bold"
                  />
                  <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                    Code expires in 10 minutes. Check your spam folder if not received.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || otpCode.trim().length !== 6}
                  className="w-full glass-admin-btn-primary py-3 px-4 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <ChefHat className="w-4 h-4 animate-spin text-sky-200" />
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

              <div className="mt-5 flex items-center justify-between text-xs border-t border-white/[0.08] pt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || authLoading}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white disabled:text-slate-600 transition font-medium"
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
                  className="text-slate-400 hover:text-white transition font-medium"
                >
                  Switch Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const roleBadgeColors: Record<string, string> = {
    SUPER_ADMIN: 'bg-sky-500/10 text-sky-300 border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]',
    ADMIN: 'bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
    OPERATIONS: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    SUPPORT: 'bg-teal-500/10 text-teal-300 border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.2)]'
  };

  return (
    <div className="min-h-screen glass-admin-bg text-slate-100 flex flex-col md:flex-row relative selection:bg-sky-500/30 selection:text-sky-200" style={{ backgroundColor: '#08090D', minHeight: '100vh' }}>
      {/* Refined ambient overhead lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-[140px]" />
      </div>

      {/* Sidebar Navigation (Glass) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-admin-sidebar flex flex-col transition-transform duration-200 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="h-16 px-6 border-b border-white/[0.08] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(14,165,233,0.35)] border border-white/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white">Rasoi</span>
              <span className="font-extrabold text-lg text-sky-400">IQ</span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.05] text-sky-300 border border-white/[0.1]">
                Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity info card (Glass) */}
        <div className="p-3 mx-3 my-3 rounded-xl glass-admin-card border border-white/[0.08]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-white truncate max-w-[130px]">{user.fullName}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border backdrop-blur-md ${roleBadgeColors[user.role] || 'bg-slate-800 text-slate-300'}`}>
              {user.role}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono truncate">{user.email}</p>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-white/[0.06] text-white border-l-2 border-sky-400 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Bottom links */}
        <div className="p-4 border-t border-white/[0.08] space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/[0.04] hover:text-white transition"
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
      <div className="flex-1 flex flex-col md:pl-64 relative z-10">
        {/* Top bar (Glass) */}
        <header className="h-16 glass-admin-header sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-white/[0.05] hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-400">RasoiIQ Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-white capitalize font-semibold">
                {pathname.split('/')[2] || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Indicator (Glass pill) */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">PostgreSQL 18</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Online</span>
            </div>

            {/* Verified Admin Role Badge (Glass) */}
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 backdrop-blur-md text-xs shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-300">
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
