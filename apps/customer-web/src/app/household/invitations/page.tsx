'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChefHat, Users, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Mail, Shield, Trash2, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function InvitationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, memberships, refreshUser } = useAuth();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [validatedInvite, setValidatedInvite] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OWNER invitation management state
  const isOwner = memberships?.some(m => m.role === 'OWNER') || user?.role === 'ADMIN';
  const ownerHouseholdId = user?.householdId || memberships?.[0]?.householdId;

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MEMBER' | 'COOK'>('MEMBER');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<any | null>(null);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialToken) {
      handleValidate(initialToken);
    }
  }, [initialToken]);

  useEffect(() => {
    if (ownerHouseholdId && isOwner) {
      loadPendingInvites();
    }
  }, [ownerHouseholdId, isOwner]);

  const loadPendingInvites = async () => {
    if (!ownerHouseholdId) return;
    try {
      const res = await api.getInvitations(ownerHouseholdId);
      setPendingInvites(res.invitations || []);
    } catch {}
  };

  const handleValidate = async (tokenToTest: string) => {
    if (!tokenToTest.trim()) return;
    setIsValidating(true);
    setError(null);
    try {
      const res = await api.validateInvitation(tokenToTest.trim());
      setValidatedInvite(res);
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Invalid invitation token');
      setValidatedInvite(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAccept = async () => {
    if (!token.trim()) return;
    setIsAccepting(true);
    setError(null);
    try {
      const res = await api.acceptInvitation(token.trim());
      setSuccessMsg(res.message || 'Invitation accepted! You have joined the household.');
      await refreshUser();
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerHouseholdId || !inviteEmail.trim()) return;
    setIsCreatingInvite(true);
    setError(null);
    try {
      const res = await api.createInvitation(ownerHouseholdId, inviteEmail.trim(), inviteRole);
      setCreatedInvite(res.invitation);
      setInviteEmail('');
      await loadPendingInvites();
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to generate invitation');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    if (!ownerHouseholdId) return;
    try {
      await api.revokeInvitation(ownerHouseholdId, invitationId);
      await loadPendingInvites();
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to revoke invitation');
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: ACCEPT INVITATION */}
      <div className="bg-surface py-8 px-6 sm:px-10 rounded-3xl border border-cream-300 shadow-soft">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-terracotta-50 border border-terracotta-200 text-terracotta-600 flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-forest-950">Join a Household</h2>
          <p className="mt-1 text-xs text-stone-600">
            Accept an invitation token to connect your account to a family kitchen
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-4 rounded-2xl bg-forest-50 border border-forest-200 flex items-start gap-3 text-forest-900 text-sm">
            <CheckCircle2 className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
              Invitation Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste invitation token here"
                className="block flex-1 px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => handleValidate(token)}
                disabled={isValidating || !token.trim()}
                className="px-5 py-2.5 rounded-2xl bg-cream-200 text-forest-900 font-bold text-xs hover:bg-cream-300 transition-all disabled:opacity-50"
              >
                {isValidating ? 'Checking...' : 'Inspect'}
              </button>
            </div>
          </div>

          {validatedInvite && (
            <div className="p-4 bg-forest-50 rounded-2xl border border-forest-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest-900">Household:</span>
                <span className="text-xs font-semibold text-forest-950">{validatedInvite.householdName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest-900">Role Granted:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                  {validatedInvite.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest-900">Invited Email:</span>
                <span className="text-xs text-stone-600">{validatedInvite.invitedEmail}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-soft"
                >
                  {isAccepting ? 'Accepting...' : 'Accept Invitation & Join'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: INVITE FAMILY OR COOK (OWNER ONLY) */}
      {isOwner && (
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-3xl border border-cream-300 shadow-soft">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-forest-950">Invite Members or Cook</h2>
            <p className="mt-1 text-xs text-stone-600">
              Generate 7-day single-use invitation tokens for family members or your household Maharaj cook
            </p>
          </div>

          <form onSubmit={handleCreateInvite} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Recipient Email
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="family.member@example.com"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Household Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                >
                  <option value="MEMBER">Family Member</option>
                  <option value="COOK">Domestic Cook (Maharaj)</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isCreatingInvite}
                className="py-2.5 px-6 rounded-2xl bg-forest-700 text-white font-bold text-xs hover:bg-forest-800 transition-all shadow-soft disabled:opacity-50"
              >
                {isCreatingInvite ? 'Generating...' : 'Send Household Invitation'}
              </button>
            </div>
          </form>

          {createdInvite && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 mb-6">
              <p className="text-xs font-bold text-amber-900 mb-1">Invitation Created:</p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] bg-white px-2 py-1 rounded border border-amber-300 text-amber-950 flex-1 truncate font-mono">
                  {createdInvite.token || 'Token created'}
                </code>
                {createdInvite.token && (
                  <button
                    type="button"
                    onClick={() => handleCopy(createdInvite.token)}
                    className="p-1.5 rounded-xl bg-amber-200 text-amber-900 hover:bg-amber-300 transition-colors"
                    title="Copy Token"
                  >
                    {copied ? <Check className="w-4 h-4 text-forest-700" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          )}

          {pendingInvites.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 mb-2">
                Active Pending Invitations ({pendingInvites.length})
              </h3>
              <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="p-3 bg-surface flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-forest-950">{inv.invitedEmail}</p>
                      <p className="text-[10px] text-stone-500">
                        Role: <span className="font-bold text-forest-800">{inv.role}</span> • Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevoke(inv.id)}
                      className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                      title="Revoke Invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HouseholdInvitationsPage() {
  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </div>

        <Suspense fallback={
          <div className="bg-surface py-12 px-6 rounded-3xl border border-cream-300 text-center">
            <p className="text-sm text-stone-600">Loading invitations...</p>
          </div>
        }>
          <InvitationsContent />
        </Suspense>
      </div>
    </div>
  );
}
