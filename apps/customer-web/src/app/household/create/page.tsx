'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChefHat, Home, MapPin, Users, Utensils, IndianRupee, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function CreateHouseholdPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [locality, setLocality] = useState('');
  const [size, setSize] = useState(4);
  const [dietaryPreference, setDietaryPreference] = useState('VEGETARIAN');
  const [cuisinePreference, setCuisinePreference] = useState('ALL_INDIAN');
  const [weeklyBudgetInr, setWeeklyBudgetInr] = useState(3500);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a household name (e.g. "Joshi Family Kitchen")');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.createHousehold({
        name: name.trim(),
        city: city.trim(),
        locality: locality.trim() || undefined,
        size: Number(size),
        dietaryPreference,
        cuisinePreference,
        weeklyBudgetInr: Number(weeklyBudgetInr)
      });
      await refreshUser();
      router.push('/');
    } catch (err: any) {
      setError(err.message?.replace(/^API \d+:\s*/, '') || 'Failed to create household');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-forest-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to onboarding</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-extrabold text-xl tracking-tight text-forest-900">Rasoi</span>
            <span className="font-extrabold text-xl tracking-tight text-terracotta-500">IQ</span>
          </div>
        </div>

        <div className="bg-surface py-8 px-6 sm:px-10 rounded-3xl border border-cream-300 shadow-soft">
          <div className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center mb-3">
              <Home className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-forest-950">Set Up Your Household</h2>
            <p className="mt-1 text-xs text-stone-600">
              Configure your family kitchen parameters. You will be assigned as the household Owner.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                Household / Family Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Joshi Family Kitchen"
                className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  City
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ahmedabad"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Locality / Area
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="Bodakdev"
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Household Members
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Weekly Budget (₹)
                </label>
                <div className="relative rounded-2xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={weeklyBudgetInr}
                    onChange={(e) => setWeeklyBudgetInr(Number(e.target.value))}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Primary Dietary Mode
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                >
                  <option value="VEGETARIAN">Vegetarian (Lacto)</option>
                  <option value="JAIN">Strict Jain (No Roots/Alliums)</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="VEGAN">100% Plant-Based Vegan</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900 mb-1">
                  Regional Cuisine Style
                </label>
                <select
                  value={cuisinePreference}
                  onChange={(e) => setCuisinePreference(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-surface text-sm transition-all"
                >
                  <option value="ALL_INDIAN">All Indian (Diverse)</option>
                  <option value="GUJARATI">Gujarati & Kathiyawadi</option>
                  <option value="NORTH_INDIAN">North Indian (Punjabi)</option>
                  <option value="SOUTH_INDIAN">South Indian</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-2xl shadow-soft text-sm font-bold text-white bg-forest-700 hover:bg-forest-800 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Household & Enter Kitchen</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
