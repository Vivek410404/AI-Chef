'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Users,
  Lock,
  Save,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, updateProfile, refreshUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=profile');
    }
  }, [isLoading, isAuthenticated, router]);

  // Synchronize form fields with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phoneNumber || user.phone || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phone.trim() || undefined
      });
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setSaveError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Recently';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-500 tracking-wide uppercase">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryHousehold = profile?.households?.[0] || profile?.householdMembers?.[0]?.household || null;
  const householdRole = user.householdRole || profile?.householdMembers?.[0]?.role || 'MEMBER';

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full space-y-6">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <span className="text-xs font-semibold text-stone-400">Account Center</span>
        </div>

        {/* Profile Header Banner */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-forest-700 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-soft shrink-0">
                {getInitials(user.fullName)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-forest-950 tracking-tight">{user.fullName}</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Account</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Email Verified</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-cream-200 text-xs text-stone-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </span>
              <Link
                href="/profile/security"
                className="mt-2 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 inline-flex items-center gap-1"
              >
                <span>Security & Sessions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 flex items-center gap-3 text-forest-800 text-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0" />
            <p className="font-semibold">{saveSuccess}</p>
          </div>
        )}

        {saveError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-800 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="font-semibold">{saveError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Edit Form (2 cols) */}
          <div className="md:col-span-2 bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
            <h2 className="text-lg font-bold text-forest-950 mb-1">Personal Details</h2>
            <p className="text-xs text-stone-500 mb-6">Manage your contact information and household profile identity.</p>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Full Name"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={user.email}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-200 bg-cream-100/70 text-stone-600 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-stone-400">
                  Email address is verified. To change your registered email, contact pilot operations.
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1.5">
                  Mobile Number <span className="text-stone-400 font-normal lowercase">(for delivery & Maharaj notifications)</span>
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Household Context & Security Sidebars (1 col) */}
          <div className="space-y-6">
            
            {/* Household Box */}
            <div className="bg-surface p-6 rounded-3xl border border-cream-300 shadow-soft space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-forest-950">Active Household</h3>
                  <p className="text-[11px] text-stone-500">Your domestic dining unit</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream-100/70 border border-cream-200 text-xs space-y-1.5">
                <p className="font-bold text-forest-950 text-sm">
                  {primaryHousehold?.name || 'Sharma Family'}
                </p>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Your Role:</span>
                  <span className="font-bold text-forest-800 uppercase text-[10px] bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
                    {householdRole}
                  </span>
                </div>
                {primaryHousehold?.dietaryType && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Dietary:</span>
                    <span className="font-semibold text-stone-800 capitalize">
                      {primaryHousehold.dietaryType.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/household"
                className="w-full py-2.5 px-3 rounded-xl border border-cream-300 hover:border-forest-600 text-forest-900 text-xs font-bold text-center block transition-colors bg-surface"
              >
                Manage Household & Members
              </Link>
            </div>

            {/* Quick Security Box */}
            <div className="bg-surface p-6 rounded-3xl border border-cream-300 shadow-soft space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-forest-950">Security & Privacy</h3>
                  <p className="text-[11px] text-stone-500">Password and refresh sessions</p>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                Protect your account with password rotation and monitor authorized devices active in your household.
              </p>

              <Link
                href="/profile/security"
                className="w-full py-2.5 px-3 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 text-xs font-bold text-center block transition-colors"
              >
                Account & Security Settings
              </Link>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
