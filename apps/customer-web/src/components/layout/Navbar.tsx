'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  ShoppingBag,
  UtensilsCrossed,
  Package,
  Users,
  ChefHat,
  LayoutDashboard,
  ShieldCheck,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldAlert,
  Store
} from 'lucide-react';
import { Household } from '@rasoi/shared-types';
import { useAuth } from '@/lib/auth-context';

interface NavbarProps {
  activeTab?: 'landing' | 'dashboard' | 'planner' | 'recipes' | 'basket' | 'pantry' | 'retailer-admin' | 'shop';
  setActiveTab?: (tab: 'landing' | 'dashboard' | 'planner' | 'recipes' | 'basket' | 'pantry' | 'retailer-admin' | 'shop') => void;
  onOpenAiPlanner?: () => void;
  onOpenHousehold?: () => void;
  onSwitchHousehold?: (householdId: string) => void;
  basketCount?: number;
  household?: Household | null;
}

export function Navbar({
  activeTab = 'dashboard',
  setActiveTab,
  onOpenAiPlanner,
  onOpenHousehold,
  onSwitchHousehold,
  basketCount = 0,
  household
}: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHouseholdMenuOpen, setIsHouseholdMenuOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);
  const householdRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
      if (householdRef.current && !householdRef.current.contains(event.target as Node)) {
        setIsHouseholdMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility: Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountOpen(false);
        setIsMobileMenuOpen(false);
        setIsHouseholdMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (tab: 'landing' | 'dashboard' | 'planner' | 'recipes' | 'basket' | 'pantry' | 'retailer-admin' | 'shop') => {
    if (!isAuthenticated && tab !== 'landing' && tab !== 'recipes' && tab !== 'shop') {
      router.push(`/login?redirect=${tab}`);
      return;
    }
    if (setActiveTab) {
      setActiveTab(tab);
    } else {
      router.push(`/#${tab}`);
    }
    setIsMobileMenuOpen(false);
  };

  // Helper: Extract user initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isStaffRole = user && ['ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'].includes(user.role);
  const isRetailer = user?.role === 'RETAILER';

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Return to Home"
        >
          <div className="w-11 h-11 rounded-2xl bg-forest-700 flex items-center justify-center text-white shadow-soft group-hover:bg-forest-800 transition-all duration-300">
            <ChefHat className="w-6 h-6 text-terracotta-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-2xl tracking-tight text-forest-900">Rasoi</span>
              <span className="font-extrabold text-2xl tracking-tight text-terracotta-500">IQ</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full border border-forest-200 ml-1">
                India
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">AI Meal Planning & Groceries</p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex mx-2 items-center gap-1 bg-cream-200/80 p-1.5 rounded-2xl border border-cream-300">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'dashboard'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 text-forest-700" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavClick('shop')}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'shop'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Shop</span>
              </button>

              <button
                onClick={() => handleNavClick('planner')}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'planner'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <Calendar className="w-4 h-4 text-forest-500" />
                <span>Planner</span>
              </button>

              <button
                onClick={() => handleNavClick('recipes')}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'recipes'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <UtensilsCrossed className="w-4 h-4 text-terracotta-500" />
                <span>Discover</span>
              </button>

              <button
                onClick={() => handleNavClick('basket')}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 relative ${activeTab === 'basket'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Smart Basket</span>
                {basketCount > 0 && (
                  <span className="ml-0.5 bg-terracotta-500 text-white text-[11px] px-1.5 py-0.5 font-bold rounded-full min-w-5 text-center">
                    {basketCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('pantry')}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'pantry'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span>My Pantry</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick('landing')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'landing'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <span>Home</span>
              </button>
              <button
                onClick={() => handleNavClick('shop')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'shop'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Shop</span>
              </button>
              <button
                onClick={() => handleNavClick('recipes')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'recipes'
                  ? 'bg-surface text-forest-900 shadow-sm'
                  : 'text-stone-600 hover:text-forest-900 hover:bg-surface/50'
                  }`}
              >
                <UtensilsCrossed className="w-4 h-4 text-terracotta-500" />
                <span>Explore Recipes</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Ask AI Chef (Logged In) */}
          {isAuthenticated && onOpenAiPlanner && (
            <button
              onClick={onOpenAiPlanner}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-forest-700 via-forest-500 to-emerald-600 hover:opacity-95 shadow-soft hover:shadow-elevated transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-saffron-500 animate-pulse" />
              <span className="hidden sm:inline">Ask AI Chef</span>
              <span className="sm:hidden">AI Chef</span>
            </button>
          )}

          {/* Household Context / Quick Switcher */}
          {isAuthenticated && (
            <div className="relative" ref={householdRef}>
              <button
                onClick={() => {
                  if (onOpenHousehold) onOpenHousehold();
                  else router.push('/household');
                }}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-surface border border-cream-300 text-stone-700 hover:border-forest-500 transition-colors"
                title="Household Settings & Preferences"
              >
                <Users className="w-4 h-4 text-forest-700" />
                <span className="text-xs font-semibold hidden xl:inline">
                  {household?.name || user?.fullName?.split(' ')[0] + "'s Kitchen"}
                </span>
                {user?.householdRole && (
                  <span className="hidden lg:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                    {user.householdRole}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Role-Specific Shortcuts */}
          {isStaffRole && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors"
              title="Platform Operations & Admin Console"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Console</span>
            </Link>
          )}

          {isRetailer && (
            <button
              onClick={() => handleNavClick('retailer-admin')}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeTab === 'retailer-admin'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'border-cream-300 text-stone-600 hover:text-stone-900 hover:bg-cream-100'
                }`}
              title="Retailer Partner Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-terracotta-500" />
              <span className="hidden sm:inline">Partner View</span>
            </button>
          )}

          {/* Authentication State: Logged Out vs Logged In */}
          {isLoading ? (
            <div className="w-9 h-9 rounded-2xl bg-cream-200 animate-pulse" />
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-forest-800 hover:text-forest-950 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 shadow-soft transition-all"
              >
                Create Account
              </Link>
            </div>
          ) : (
            /* Logged-In User Profile Avatar & Dropdown */
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setIsAccountOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl bg-surface border border-cream-300 hover:border-forest-600 transition-all focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-sm"
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
                aria-label="User Account Menu"
              >
                <div className="w-8 h-8 rounded-xl bg-forest-700 text-white font-extrabold text-xs flex items-center justify-center shadow-soft">
                  {getInitials(user?.fullName)}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-forest-950 line-clamp-1 leading-tight">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-medium capitalize">
                    {user?.role?.toLowerCase() || 'Customer'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Account Dropdown Menu (Items 1-6) */}
              {isAccountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-2xl shadow-elevated border border-cream-300 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {/* User Overview Header */}
                  <div className="px-4 py-3 border-b border-cream-200">
                    <p className="text-xs font-bold text-forest-950 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {user?.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-200">
                        {user?.role}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {user?.status}
                      </span>
                    </div>
                  </div>

                  {/* 1. My Profile */}
                  <Link
                    href="/profile"
                    onClick={() => setIsAccountOpen(false)}
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <User className="w-4 h-4 text-forest-700" />
                    <span>My Profile</span>
                  </Link>

                  {/* 2. My Household */}
                  <Link
                    href="/household"
                    onClick={() => setIsAccountOpen(false)}
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Users className="w-4 h-4 text-forest-700" />
                    <span>My Household</span>
                  </Link>

                  {/* 3. Account & Security */}
                  <Link
                    href="/profile/security"
                    onClick={() => setIsAccountOpen(false)}
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-forest-700" />
                    <span>Account & Security</span>
                  </Link>

                  {/* 4. My Orders */}
                  <Link
                    href="/orders"
                    onClick={() => setIsAccountOpen(false)}
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-forest-700" />
                    <span>My Orders</span>
                  </Link>

                  {/* 5. Settings */}
                  <Link
                    href="/household"
                    onClick={() => setIsAccountOpen(false)}
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-forest-700" />
                    <span>Preferences & Settings</span>
                  </Link>

                  {/* Staff Console Link (if admin) */}
                  {isStaffRole && (
                    <Link
                      href="/admin"
                      onClick={() => setIsAccountOpen(false)}
                      role="menuitem"
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-purple-800 hover:bg-purple-50 flex items-center gap-2.5 transition-colors border-t border-cream-200"
                    >
                      <ShieldAlert className="w-4 h-4 text-purple-700" />
                      <span>Admin Operations Panel</span>
                    </Link>
                  )}

                  {/* 6. Logout */}
                  <div className="pt-1 mt-1 border-t border-cream-200">
                    <button
                      type="button"
                      onClick={async () => {
                        setIsAccountOpen(false);
                        await logout();
                      }}
                      role="menuitem"
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:text-forest-900 hover:bg-cream-200/50"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-cream-300 bg-surface px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-forest-950 hover:bg-cream-100 flex items-center gap-2.5"
              >
                <LayoutDashboard className="w-4 h-4 text-forest-700" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavClick('shop')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-forest-950 hover:bg-cream-100 flex items-center gap-2.5"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>Shop</span>
              </button>
              <button
                onClick={() => handleNavClick('planner')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-forest-950 hover:bg-cream-100 flex items-center gap-2.5"
              >
                <Calendar className="w-4 h-4 text-forest-500" />
                <span>7-Day Planner</span>
              </button>
              <button
                onClick={() => handleNavClick('recipes')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-forest-950 hover:bg-cream-100 flex items-center gap-2.5"
              >
                <UtensilsCrossed className="w-4 h-4 text-terracotta-500" />
                <span>Discover Recipes</span>
              </button>
              <button
                onClick={() => handleNavClick('basket')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-forest-950 hover:bg-cream-100 flex items-center gap-2.5"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Smart Basket ({basketCount})</span>
              </button>
              <button
                onClick={() => handleNavClick('pantry')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-forest-950 hover:bg-cream-100 flex items-center gap-2.5"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span>My Pantry</span>
              </button>

              <div className="pt-2 border-t border-cream-200">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-cream-100"
                >
                  My Profile
                </Link>
                <Link
                  href="/household"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-cream-100"
                >
                  My Household
                </Link>
                <Link
                  href="/profile/security"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-cream-100"
                >
                  Account & Security
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-cream-100"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 mt-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold rounded-xl border border-cream-300 text-forest-900 bg-surface"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold rounded-xl bg-forest-700 text-white shadow-soft"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
