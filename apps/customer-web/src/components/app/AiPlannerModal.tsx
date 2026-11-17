'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Check, Loader2, ShieldCheck, Flame, Clock, IndianRupee, Compass, UtensilsCrossed, Users, Minus, Plus } from 'lucide-react';
import { AIPlanGenerationResponse, DietaryPreference, Household } from '@rasoi/shared-types';
import { api } from '@/lib/api';
import { formatInr } from '@/lib/utils';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPlan: (response: AIPlanGenerationResponse) => void;
  household?: Household | null;
}

const SAMPLE_PROMPTS = [
  'Gujarati comfort meals with Jain-friendly options for dinner',
  'High-protein vegetarian meal plan for family of 4',
  'Quick weekday dinners ready in under 30 minutes',
  'Wholesome Indian meals within ₹2,500 weekly budget'
];

const DIETARY_OPTIONS: { id: DietaryPreference; label: string; desc: string }[] = [
  { id: 'VEGETARIAN', label: 'Vegetarian', desc: 'Plant-based & Dairy (Default)' },
  { id: 'NON_VEGETARIAN', label: 'Non-Vegetarian', desc: 'Chicken, Fish, Meat & Veg' },
  { id: 'EGGETARIAN', label: 'Eggetarian', desc: 'Vegetarian + Whole Eggs' },
  { id: 'VEGAN', label: 'Vegan', desc: '100% Plant-based (No Dairy/Honey)' },
  { id: 'JAIN', label: 'Jain', desc: 'No Onion, Garlic or Root Veg' }
];

const CUISINE_OPTIONS = [
  { id: 'ALL_INDIAN', label: 'All Indian Cuisines', desc: 'Pan-Indian Variety (Default)' },
  { id: 'North Indian', label: 'North Indian', desc: 'Punjabi, Awadhi & Mughlai' },
  { id: 'South Indian', label: 'South Indian', desc: 'Tamil, Kerala & Karnataka' },
  { id: 'West Indian', label: 'West Indian', desc: 'Gujarati & Maharashtrian' },
  { id: 'East Indian', label: 'East Indian', desc: 'Bengali & Odia Comforts' },
  { id: 'Central Indian', label: 'Central Indian', desc: 'Malwi & Bundelkhandi' }
];

export function AiPlannerModal({ isOpen, onClose, onApplyPlan, household }: AiPlannerModalProps) {
  const [prompt, setPrompt] = useState('');
  const defaultServings = household?.members?.length || (household as any)?.size || 1;
  const [servings, setServings] = useState<number>(defaultServings);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('VEGETARIAN');
  const [cuisinePreference, setCuisinePreference] = useState<string>('ALL_INDIAN');
  const [proteinFocus, setProteinFocus] = useState<'standard' | 'high-protein' | 'fiber-rich'>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIPlanGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (household) {
      if (household.members?.length) {
        setServings(household.members.length);
      }
      if (household.dietaryPreference) {
        setDietaryPreference(household.dietaryPreference as any);
      }
      if (household.cuisinePreference) {
        setCuisinePreference(household.cuisinePreference);
      }
    }
  }, [household, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt || `Weekly Indian meal plan matching ${dietaryPreference} and ${cuisinePreference} for ${servings} ${servings === 1 ? 'person' : 'people'}`;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.generateAiPlan({
        prompt: textToUse,
        householdId: household?.id,
        daysCount: 7,
        servingsPerMeal: servings,
        dietaryPreference,
        cuisinePreference,
        cuisinePreferences: [cuisinePreference],
        proteinPreference: proteinFocus === 'high-protein' ? 'high-protein' : 'standard',
        targetDailyProteinGrams: proteinFocus === 'high-protein' ? (servings * 20) : (servings * 15)
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate meal plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApplyPlan(result);
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-scrollbar overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar border border-cream-300 shadow-2xl p-6 sm:p-8 space-y-6"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-soft">
              <Sparkles className="w-5 h-5 text-terracotta-200" />
            </div>
            <div>
              <h2 className="text-xl font-black text-forest-900">AI Meal Planning Assistant</h2>
              <p className="text-xs text-stone-500">Google Gemini Free Tier with Deterministic Fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Servings & Household Size Selector */}
        <div className="bg-cream-50/80 p-4 rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-forest-700" />
              <span>Servings Per Meal:</span>
            </label>
            <p className="text-[11px] text-stone-500">
              {household?.members?.length
                ? `Matched to ${household.name || 'your household'} (${household.members.length} member${household.members.length > 1 ? 's' : ''})`
                : 'Plan meals tailored to your exact household size'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-cream-300 shadow-sm">
            <button
              type="button"
              disabled={servings <= 1}
              onClick={() => setServings(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg bg-cream-100 hover:bg-cream-200 text-stone-700 font-bold flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Decrease servings"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-20 text-center text-sm font-extrabold text-forest-950">
              {servings} {servings === 1 ? 'Person' : 'People'}
            </span>
            <button
              type="button"
              disabled={servings >= 12}
              onClick={() => setServings(prev => Math.min(12, prev + 1))}
              className="w-8 h-8 rounded-lg bg-cream-100 hover:bg-cream-200 text-stone-700 font-bold flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Increase servings"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dietary Mode Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-forest-700" />
              <span>Dietary Mode:</span>
            </label>
            <span className="text-[11px] text-stone-500 italic">Vegetarian by default • fully customizable</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDietaryPreference(opt.id)}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  dietaryPreference === opt.id
                    ? 'bg-forest-700 text-white border-forest-800 shadow-sm ring-2 ring-forest-500/20'
                    : 'bg-cream-50 hover:bg-cream-100 text-stone-700 border-cream-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{opt.label}</span>
                  {dietaryPreference === opt.id && <Check className="w-3.5 h-3.5 text-terracotta-300" />}
                </div>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                  dietaryPreference === opt.id ? 'text-cream-200' : 'text-stone-500'
                }`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Regional Cuisine Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Regional Cuisine Preference:</span>
            </label>
            <span className="text-[11px] text-stone-500 italic">All Indian by default • strict regional isolation</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CUISINE_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCuisinePreference(c.id)}
                className={`p-2.5 rounded-2xl text-left border transition-all ${
                  cuisinePreference === c.id
                    ? 'bg-terracotta-600 text-white border-terracotta-700 shadow-sm ring-2 ring-terracotta-500/20'
                    : 'bg-cream-50 hover:bg-cream-100 text-stone-700 border-cream-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{c.label}</span>
                  {cuisinePreference === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                  cuisinePreference === c.id ? 'text-cream-100' : 'text-stone-500'
                }`}>
                  {c.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Active Configuration Summary Badge */}
        <div className="p-3 rounded-2xl bg-cream-100/80 border border-cream-300/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0" />
            <div className="text-xs">
              <span className="text-stone-500">Active Profile: </span>
              <span className="font-extrabold text-forest-900">
                {DIETARY_OPTIONS.find(d => d.id === dietaryPreference)?.label || dietaryPreference}
              </span>
              <span className="text-stone-400 mx-1.5">•</span>
              <span className="font-extrabold text-terracotta-700">
                {CUISINE_OPTIONS.find(c => c.id === cuisinePreference)?.label || cuisinePreference}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-stone-500 bg-white px-2 py-0.5 rounded-md border border-cream-200">
            Strict Filter Guaranteed
          </span>
        </div>

        {/* Protein & Nutritional Preference Pills */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-forest-900 block">
            Protein & Nutritional Focus:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'standard', label: 'Balanced Homestyle' },
              { id: 'high-protein', label: 'High Protein (Paneer, Dal, Chana)' },
              { id: 'fiber-rich', label: 'Fiber & Light' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProteinFocus(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  proteinFocus === p.id
                    ? 'bg-forest-700 text-white shadow-xs'
                    : 'bg-cream-100 hover:bg-cream-200 text-stone-600 border border-cream-200'
                }`}
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-forest-900 block">
            What kind of meals would your family love this week?
          </label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Vegetarian meals with Gujarati touch and high protein..."
              className="w-full px-4 py-3.5 pr-28 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-500 bg-cream-50/50 text-sm font-medium text-forest-900"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-300" />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {SAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  handleGenerate(p);
                }}
                className="text-[11px] font-semibold text-stone-600 bg-cream-100 hover:bg-forest-50 hover:text-forest-800 px-3 py-1.5 rounded-xl border border-cream-200 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        {/* Results Preview */}
        {result && (
          <div className="space-y-5 pt-4 border-t border-cream-200">
            
            {/* Status Banner */}
            <div className="p-4 rounded-2xl bg-forest-50 border border-forest-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-md text-white ${
                    result.source === 'gemini' ? 'bg-forest-700' : 'bg-amber-700'
                  }`}>
                    {result.source === 'gemini'
                      ? `Google Gemini AI (${result.modelUsed || 'gemini-3.5-flash-lite'})`
                      : 'Deterministic Fallback Engine'}
                  </span>
                  <span className="text-xs font-semibold text-forest-800">Plan Ready</span>
                </div>
                <p className="text-xs text-forest-900 mt-1 font-medium">{result.planSummary}</p>
                {result.fallbackReason && (
                  <p className="text-[10px] text-amber-800 mt-0.5 italic">
                    Fallback reason: {result.fallbackReason}
                  </p>
                )}
                {result.diversitySummary && (
                  <p className="text-[10px] text-emerald-700 mt-0.5 font-semibold">
                    ✓ {result.diversitySummary}
                  </p>
                )}
                {result.catalogLimitation && (
                  <p className="text-[10px] text-stone-500 mt-0.5 italic">
                    ℹ️ {result.catalogLimitation}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[11px] text-stone-500 block">Est. Grocery Total</span>
                <span className="text-base font-black text-forest-900">{formatInr(result.estimatedWeeklyBudgetInr)}</span>
              </div>
            </div>

            {/* Nutrition Highlights */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200">
                <span className="text-[10px] text-stone-500 font-semibold block">Avg Calories</span>
                <span className="text-sm font-extrabold text-forest-900">{result.nutritionalHighlights.avgDailyCalories} kcal</span>
              </div>
              <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200">
                <span className="text-[10px] text-stone-500 font-semibold block">Protein Focus</span>
                <span className="text-xs font-bold text-forest-900">{result.nutritionalHighlights.proteinFocus}</span>
              </div>
              <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200">
                <span className="text-[10px] text-stone-500 font-semibold block">Fiber & Gut</span>
                <span className="text-xs font-bold text-emerald-700">{result.nutritionalHighlights.fiberRating}</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-500 italic text-center">
              Gemini AI recommends recipes matching your protein & cuisine preferences. Authoritative nutritional totals are calculated deterministically by RasoiIQ from raw ingredients (IFCT 2017 & USDA).
            </p>

            {/* Meals List Preview */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Suggested Weekly Meals</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.meals.map((meal, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-terracotta-600 block">
                        {meal.dayOfWeek} • {meal.mealCategory}
                      </span>
                      <span className="font-extrabold text-forest-900">{meal.recipeTitle}</span>
                      <p className="text-[10px] text-stone-500 italic mt-0.5">{meal.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-cream-300 text-stone-600 text-xs font-bold hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold flex items-center gap-2 shadow-soft"
              >
                <Check className="w-4 h-4" />
                <span>Apply to 7-Day Meal Plan</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
