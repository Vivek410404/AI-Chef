'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Home,
  ArrowLeft,
  Users,
  UtensilsCrossed,
  Flame,
  Wallet,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminHouseholdDetailPage() {
  const params = useParams();
  const householdId = params?.id as string;

  const [household, setHousehold] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!householdId) return;
    api.admin.getHouseholdById(householdId)
      .then(setHousehold)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [householdId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-stone-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-terracotta-400" />
        Loading household details...
      </div>
    );
  }

  if (error || !household) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800 text-red-200">
        <h3 className="font-bold text-lg mb-2">Household Not Found</h3>
        <p className="text-sm mb-4">{error || 'Household could not be located in database.'}</p>
        <Link href="/admin/households" className="px-4 py-2 rounded-xl bg-stone-800 text-xs font-semibold">
          Back to Households
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/households"
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Households</span>
      </Link>

      {/* Household Overview Header */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{household.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {household.dietaryPreference}
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <span>{household.locality ? `${household.locality}, ` : ''}{household.city}, {household.state}</span>
            </p>
          </div>

          <div className="text-xs text-stone-400">
            <p>ID: <span className="font-mono text-stone-300">{household.id}</span></p>
            <p>Owner: <span className="text-white font-medium">{household.user?.fullName} ({household.user?.email})</span></p>
          </div>
        </div>

        {/* Profile Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Family Members</span>
            <p className="text-xl font-black text-white mt-1">{household.members?.length || household.size}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Weekly Budget</span>
            <p className="text-xl font-black text-white mt-1">₹{household.weeklyBudgetInr?.toLocaleString() || 3000}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Spice Calibration</span>
            <p className="text-sm font-bold text-amber-400 mt-2">{household.spiceTolerance || 'MEDIUM'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80">
            <span className="text-[11px] text-stone-500 font-semibold uppercase">Pantry Inventory</span>
            <p className="text-xl font-black text-white mt-1">{household._count?.pantryItems || 0} Items</p>
          </div>
        </div>
      </div>

      {/* Family Members Roster */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Family Members & Dietary Profiles</span>
        </h3>

        {household.members && household.members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {household.members.map((m: any) => (
              <div key={m.id} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{m.name}</h4>
                  <span className="text-xs text-stone-400 font-medium capitalize">{m.relationship || 'Member'} · Age: {m.age || '—'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {m.dietaryOverrides && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {m.dietaryOverrides}
                    </span>
                  )}
                  {Array.isArray(m.allergies) && m.allergies.map((allg: string) => (
                    <span key={allg} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800">
                      Allergy: {allg}
                    </span>
                  ))}
                  {Array.isArray(m.dislikes) && m.dislikes.map((dis: string) => (
                    <span key={dis} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300">
                      Dislikes: {dis}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-4 text-center">No specific member profiles recorded.</p>
        )}
      </div>
    </div>
  );
}
