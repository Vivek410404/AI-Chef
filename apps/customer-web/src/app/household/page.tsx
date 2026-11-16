'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Shield,
  ChefHat,
  UserPlus,
  Mail,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings,
  Flame,
  IndianRupee,
  Utensils,
  ShieldCheck,
  Send,
  Clock
} from 'lucide-react';
import { Household, HouseholdMember, DietaryPreference } from '@rasoi/shared-types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function HouseholdManagementPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  const [household, setHousehold] = useState<Household | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoadingHousehold, setIsLoadingHousehold] = useState(true);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'COOK'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [emailPreviewUrl, setEmailPreviewUrl] = useState<string | null>(null);

  // Preferences update state
  const [name, setName] = useState('');
  const [dietaryType, setDietaryType] = useState<string>('VEGETARIAN');
  const [spiceLevel, setSpiceLevel] = useState<string>('Medium');
  const [weeklyBudget, setWeeklyBudget] = useState(3500);
  const [locality, setLocality] = useState('');
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=household');
    }
  }, [isLoading, isAuthenticated, router]);

  const loadHouseholdData = async () => {
    setIsLoadingHousehold(true);
    try {
      const hh = await api.getHousehold();
      setHousehold(hh);
      setName(hh.name || '');
      setDietaryType((hh.dietaryPreference as any) || 'VEGETARIAN');
      setSpiceLevel(((hh as any).spiceTolerance || (hh as any).spiceLevel || 'Medium') as any);
      setWeeklyBudget(hh.weeklyBudgetInr || 3500);
      setLocality((hh as any).locality || '');

      if (hh.id) {
        try {
          const invRes = await api.getInvitations(hh.id);
          setInvitations(invRes.invitations || (Array.isArray(invRes) ? invRes : []));
        } catch {
          setInvitations([]);
        }
      }
    } catch (err: any) {
      console.warn('Household load error:', err);
    } finally {
      setIsLoadingHousehold(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHouseholdData();
    }
  }, [isAuthenticated]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household?.id) return;
    setIsInviting(true);
    setInviteSuccess(null);
    setInviteError(null);
    setEmailPreviewUrl(null);

    try {
      const res = await api.createInvitation(household.id, inviteEmail.trim(), inviteRole);
      setInviteSuccess(`Invitation sent to ${inviteEmail}!`);
      if (res?.emailPreviewUrl) {
        setEmailPreviewUrl(res.emailPreviewUrl);
      }
      setInviteEmail('');
      const invRes = await api.getInvitations(household.id);
      setInvitations(invRes.invitations || (Array.isArray(invRes) ? invRes : []));
      setTimeout(() => setInviteSuccess(null), 5000);
    } catch (err: any) {
      setInviteError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!household?.id) return;
    try {
      await api.revokeInvitation(household.id, invitationId);
      const invRes = await api.getInvitations(household.id);
      setInvitations(invRes.invitations || (Array.isArray(invRes) ? invRes : []));
    } catch (err: any) {
      alert(err.message || 'Failed to revoke invitation');
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setPrefSuccess(null);
    setPrefError(null);

    try {
      const updated = await api.updateHousehold({
        name: name.trim(),
        dietaryPreference: dietaryType as any,
        spiceTolerance: spiceLevel as any,
        weeklyBudgetInr: Number(weeklyBudget),
        locality: locality.trim() || undefined
      } as any);
      setHousehold(updated);
      setPrefSuccess('Household preferences saved successfully!');
      setTimeout(() => setPrefSuccess(null), 4000);
    } catch (err: any) {
      setPrefError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to update preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const currentRole = user?.householdRole || 'OWNER';
  const isCook = currentRole === 'COOK' || currentRole === 'CHEF';
  const canManage = !isCook;

  if (isLoading || isLoadingHousehold) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-forest-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-500 tracking-wide uppercase">Loading household details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col justify-between">
      <Navbar household={household} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 w-full space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/household/invitations"
              className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700"
            >
              Have an invitation token?
            </Link>
          </div>
        </div>

        {/* Household Overview Header */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-forest-700 text-terracotta-200 flex items-center justify-center shadow-soft shrink-0">
                <ChefHat className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-forest-950 tracking-tight">
                    {household?.name || 'Household Kitchen'}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200">
                    {currentRole}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {(household as any)?.locality ? `${(household as any).locality}, ` : ''}{(household as any)?.city || 'Delhi NCR'} • {(household as any)?.size || household?.members?.length || 4} Family Members
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  <span className="font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-md border border-forest-200">
                    {household?.dietaryPreference || 'Vegetarian'}
                  </span>
                  <span className="font-semibold text-stone-700 bg-cream-100 px-2 py-0.5 rounded-md border border-cream-200">
                    Spice: {(household as any)?.spiceTolerance || (household as any)?.spiceLevel || 'Medium'}
                  </span>
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Budget: ₹{household?.weeklyBudgetInr || 3500}/wk
                  </span>
                </div>
              </div>
            </div>

            {isCook && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 max-w-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <ChefHat className="w-4 h-4 text-amber-700" />
                  <span>Cook Portal Access</span>
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  You have kitchen cook privileges to view recipes and daily prep lists. Household ownership settings are managed by the family administrator.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Member Management Section */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-forest-950">Authorized Household Members</h2>
                <p className="text-[11px] text-stone-500">Family members and household cook with verified access</p>
              </div>
            </div>
            <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-xl border border-forest-200">
              {household?.members?.length || 1} Members Active
            </span>
          </div>

          <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden text-xs">
            {(household?.members || []).map((m: any, idx: number) => {
              const roleDisplay = m.role || (idx === 0 ? 'OWNER' : 'MEMBER');
              const isCookMember = roleDisplay === 'COOK' || roleDisplay === 'CHEF';
              return (
                <div key={m.id || idx} className="p-4 flex items-center justify-between bg-surface hover:bg-cream-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-forest-700 text-white font-extrabold text-xs flex items-center justify-center">
                      {isCookMember ? <ChefHat className="w-4 h-4 text-terracotta-200" /> : (m.name?.[0] || 'M')}
                    </div>
                    <div>
                      <p className="font-bold text-forest-950 text-sm">
                        {m.name || (idx === 0 ? user?.fullName || 'Primary Member' : `Family Member ${idx + 1}`)}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {m.dietaryNotes || (isCookMember ? 'Household Maharaj / Cook' : 'Family Resident')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                      roleDisplay === 'OWNER'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : isCookMember
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-forest-50 text-forest-800 border border-forest-200'
                    }`}>
                      {roleDisplay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Invitation Box (Only for OWNER/ADMIN) */}
          {canManage && (
            <div className="p-5 rounded-2xl bg-cream-50 border border-cream-200 space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-forest-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                  Invite Member or Household Cook
                </h3>
              </div>

              {inviteSuccess && (
                <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                  <span>{inviteSuccess}</span>
                </div>
              )}

              {inviteError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              {emailPreviewUrl && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Development Mode:</span> View generated invitation email at{' '}
                  <a href={emailPreviewUrl} target="_blank" rel="noreferrer" className="underline font-bold text-forest-800">
                    Local Email Preview
                  </a>
                </div>
              )}

              <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family.member@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-surface text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <select
                    value={inviteRole}
                    onChange={(e: any) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-300 bg-surface text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600 text-xs font-medium"
                  >
                    <option value="MEMBER">Family Member</option>
                    <option value="COOK">Cook / Maharaj</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="w-full py-2.5 px-3 rounded-xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isInviting ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Invite</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pending Invitations Table */}
          {invitations.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                Pending Invitations ({invitations.length})
              </h3>
              <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden text-xs">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3.5 flex items-center justify-between bg-surface">
                    <div className="space-y-0.5">
                      <p className="font-bold text-forest-950">{inv.invitedEmail}</p>
                      <p className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Role: {inv.role} • Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleRevokeInvitation(inv.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Revoke invitation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Household Preferences Section */}
        {canManage && (
          <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-soft space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-forest-950">Dietary Rules & Kitchen Settings</h2>
                <p className="text-[11px] text-stone-500">Configure regional dietary baseline and spice parameters</p>
              </div>
            </div>

            {prefSuccess && (
              <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 flex items-center gap-2.5 text-forest-800 text-xs">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <p className="font-semibold">{prefSuccess}</p>
              </div>
            )}

            {prefError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="font-semibold">{prefError}</p>
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                    Household Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                    Locality / Area
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Indirapuram, Sector 62"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                    Dietary Baseline
                  </label>
                  <select
                    value={dietaryType}
                    onChange={(e: any) => setDietaryType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                  >
                    <option value="VEGETARIAN">Vegetarian (Lacto-Veg)</option>
                    <option value="JAIN">Strict Jain (Zero Root Vegetables)</option>
                    <option value="EGGETARIAN">Eggetarian (Eggs Allowed)</option>
                    <option value="VEGAN">Strict Vegan (Plant-Based)</option>
                    <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                    Spice Tolerance Level
                  </label>
                  <select
                    value={spiceLevel}
                    onChange={(e: any) => setSpiceLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
                  >
                    <option value="MILD">Mild (Low Chili)</option>
                    <option value="MEDIUM">Medium (Homestyle Balanced)</option>
                    <option value="SPICY">Spicy (Hot Masala)</option>
                    <option value="DESI_TEEKHA">Desi Teekha (Extra Fiery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                    Weekly Grocery Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={weeklyBudget}
                    onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPrefs}
                  className="py-3 px-6 rounded-2xl bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-soft disabled:opacity-50"
                >
                  {isSavingPrefs ? 'Saving Preferences...' : 'Save Kitchen Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
