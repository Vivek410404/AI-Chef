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
  Server
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

  useEffect(() => {
    // Background health check
    api.admin.getSystemHealth().then(setSystemHealth).catch(() => {});
  }, []);

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

  const handleQuickAdminLogin = async (role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATIONS' | 'SUPPORT') => {
    try {
      await api.getDemoSession(role as any);
      await refreshUser();
      router.refresh();
    } catch (e: any) {
      alert(`Login failed: ${e.message}`);
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

  // Not authorized screen
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Restricted Access</h1>
          <p className="text-stone-400 text-sm mb-6">
            The RasoiIQ Operations Console is strictly limited to authorized platform operators, administrators, and support staff.
          </p>

          {user && (
            <div className="mb-6 p-4 rounded-xl bg-stone-950 border border-stone-800 text-left text-xs space-y-1">
              <p className="text-stone-400">Current Identity: <span className="text-white font-mono">{user.email}</span></p>
              <p className="text-stone-400">Role: <span className="text-amber-400 font-mono">{user.role}</span></p>
              <p className="text-red-400 font-semibold mt-2">Error: Role lacks administrative permissions.</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold flex items-center justify-center gap-2 transition"
            >
              Return to Customer App
            </Link>

            <div className="pt-4 border-t border-stone-800">
              <p className="text-xs text-stone-400 font-semibold mb-3 uppercase tracking-wider">
                Local Demo Authorization
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickAdminLogin('SUPER_ADMIN')}
                  className="py-2 px-3 rounded-lg bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700 text-purple-200 text-xs font-semibold transition"
                >
                  Super Admin
                </button>
                <button
                  onClick={() => handleQuickAdminLogin('ADMIN')}
                  className="py-2 px-3 rounded-lg bg-blue-900/60 hover:bg-blue-800/80 border border-blue-700 text-blue-200 text-xs font-semibold transition"
                >
                  Admin
                </button>
                <button
                  onClick={() => handleQuickAdminLogin('OPERATIONS')}
                  className="py-2 px-3 rounded-lg bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700 text-amber-200 text-xs font-semibold transition"
                >
                  Operations
                </button>
                <button
                  onClick={() => handleQuickAdminLogin('SUPPORT')}
                  className="py-2 px-3 rounded-lg bg-teal-900/60 hover:bg-teal-800/80 border border-teal-700 text-teal-200 text-xs font-semibold transition"
                >
                  Support
                </button>
              </div>
            </div>
          </div>
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

            {/* Role Switcher Pill for Local Demo Validation */}
            <div className="hidden lg:flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-500 px-2">Role:</span>
              {(['SUPER_ADMIN', 'ADMIN', 'OPERATIONS', 'SUPPORT'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => handleQuickAdminLogin(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    user.role === r
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
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
