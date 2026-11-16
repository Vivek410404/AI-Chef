'use client';

import React, { useState, useEffect } from 'react';
import {
  DayOfWeek,
  MealPlanItem,
  Household,
  MaharajPreparationSummary
} from '@rasoi/shared-types';
import {
  X,
  ChefHat,
  Printer,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  Utensils,
  Droplets,
  Calendar,
  Users
} from 'lucide-react';
import { api } from '@/lib/api';

interface MaharajDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  household: Household | null;
  planItems: MealPlanItem[];
  selectedDay?: DayOfWeek;
}

export function MaharajDigestModal({
  isOpen,
  onClose,
  household,
  planItems,
  selectedDay = 'monday'
}: MaharajDigestModalProps) {
  const [targetDay, setTargetDay] = useState<DayOfWeek>(selectedDay);
  const [summary, setSummary] = useState<MaharajPreparationSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const DAYS: { id: DayOfWeek; label: string }[] = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    if (!isOpen) return;
    async function loadSummary() {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:4000/api/meal-plans/maharaj-summary?day=${targetDay}&householdId=${household?.id || 'hh-sharma-family'}`);
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        } else {
          // Compute fallback locally from planItems
          generateLocalSummary();
        }
      } catch (err) {
        generateLocalSummary();
      } finally {
        setIsLoading(false);
      }
    }

    function generateLocalSummary() {
      const dayMeals = planItems.filter(item => item.dayOfWeek.toLowerCase() === targetDay.toLowerCase());
      const SOAK = ['ing-kabuli-chana', 'ing-rajma', 'ing-chana-dal', 'ing-urad-dal', 'ing-toor-dal'];
      const soaking: any[] = [];
      const prep: any[] = [];
      let totalServings = 0;

      dayMeals.forEach(m => {
        totalServings += m.servings || 4;
        if (m.recipe?.ingredients) {
          m.recipe.ingredients.forEach(ing => {
            if (SOAK.includes(ing.ingredientId)) {
              soaking.push({
                ingredientId: ing.ingredientId,
                ingredientName: ing.ingredient?.name || ing.ingredientId,
                quantity: Math.round(ing.quantity * (m.servings / (m.recipe.defaultServings || 4))),
                unit: ing.unit,
                forMeal: `${m.mealCategory.toUpperCase()}: ${m.recipe.title}`,
                notes: 'Soak in clean water for 6-8 hours overnight.'
              });
            }
          });
        }

        const t = (m.recipe?.title || '').toLowerCase();
        if (t.includes('rotlo') || t.includes('thepla')) {
          prep.push({
            task: `Dough Preparation for ${m.recipe?.title}`,
            ingredients: ['Flour', 'Spices', 'Warm Water'],
            forMeal: m.mealCategory.toUpperCase(),
            instructions: 'Knead fresh dough 30 minutes before meal time.'
          });
        } else if (t.includes('kadhi')) {
          prep.push({
            task: `Whisk Buttermilk/Curd for Kadhi`,
            ingredients: ['Curd / Buttermilk', 'Besan', 'Jaggery'],
            forMeal: m.mealCategory.toUpperCase(),
            instructions: 'Whisk curd and besan with water until lump-free.'
          });
        }
      });

      setSummary({
        householdId: household?.id || 'hh-sharma-family',
        householdName: household?.name || 'Sharma Family',
        targetDay,
        totalServings: totalServings || 4,
        plannedMeals: dayMeals.map(m => ({
          mealCategory: m.mealCategory,
          recipeTitle: m.recipe?.title || m.recipeId,
          cuisine: m.recipe?.cuisine || 'Gujarati',
          servings: m.servings || 4,
          prepTimeMinutes: m.recipe?.prepTimeMinutes || 15,
          cookTimeMinutes: m.recipe?.cookTimeMinutes || 20,
          isJainFriendly: m.recipe?.isJainFriendly ?? true
        })),
        overnightSoaking: soaking,
        advancePreparation: prep,
        householdDietaryRestrictions: (household?.members || []).map(m => ({
          memberName: m.name,
          dietaryPreference: String(m.dietaryPreference),
          allergies: m.allergies || [],
          dislikedIngredients: m.dislikedIngredients || []
        })),
        generatedAt: new Date().toISOString()
      });
    }

    loadSummary();
  }, [isOpen, targetDay, household, planItems]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    if (!summary) return;
    const lines = [
      `🍲 *RasoiIQ — Kal Ka Menu (${summary.householdName})*`,
      `📅 *Day:* ${summary.targetDay.toUpperCase()} | *Servings:* ${summary.totalServings} portions`,
      '',
      '🍽️ *PLANNED MEALS:*'
    ];

    summary.plannedMeals.forEach(m => {
      lines.push(`• *${m.mealCategory.toUpperCase()}:* ${m.recipeTitle} (${m.servings} servings)`);
    });

    if (summary.overnightSoaking.length > 0) {
      lines.push('');
      lines.push('💧 *RAAT KO BHIJONA HAI (Overnight Soaking):*');
      summary.overnightSoaking.forEach(s => {
        lines.push(`• ${s.ingredientName} (${s.quantity} ${s.unit}) — for ${s.forMeal}`);
      });
    }

    if (summary.advancePreparation.length > 0) {
      lines.push('');
      lines.push('🔪 *ADVANCE PREPARATION:*');
      summary.advancePreparation.forEach(p => {
        lines.push(`• ${p.task}: ${p.instructions}`);
      });
    }

    if (summary.householdDietaryRestrictions.length > 0) {
      lines.push('');
      lines.push('⚠️ *DIETARY & ALLERGY RESTRICTIONS:*');
      summary.householdDietaryRestrictions.forEach(r => {
        const details = [];
        if (r.dietaryPreference.toLowerCase() === 'jain') details.push('Strict Jain (No Onion/Garlic/Potato)');
        if (r.allergies?.length) details.push(`Allergies: ${r.allergies.join(', ')}`);
        if (r.dislikedIngredients?.length) details.push(`Dislikes: ${r.dislikedIngredients.join(', ')}`);
        if (details.length) {
          lines.push(`• *${r.memberName}:* ${details.join(' | ')}`);
        }
      });
    }

    lines.push('');
    lines.push('Generated via RasoiIQ Kitchen Operating System');

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-surface rounded-3xl border border-cream-300 shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-cream-200 bg-cream-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-forest-900 flex items-center gap-2">
                Maharaj / Cook Preparation Digest
              </h2>
              <p className="text-xs text-stone-600">
                Printable & shareable daily kitchen brief for domestic cooks & family helpers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-cream-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Selector & Action Bar */}
        <div className="px-5 py-3 border-b border-cream-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {DAYS.map(d => (
              <button
                key={d.id}
                onClick={() => setTargetDay(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  targetDay === d.id
                    ? 'bg-amber-600 text-white shadow-soft'
                    : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-soft"
              title="Copy formatted message for WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to WhatsApp!' : 'Copy WhatsApp Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-cream-300 hover:bg-cream-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Printable Body */}
        <div id="maharaj-printable-content" className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm bg-white">
          
          {/* Metadata Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-700" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Menu Schedule</span>
                <span className="text-base font-extrabold text-forest-900 capitalize">{targetDay}&apos;s Homestyle Menu</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-forest-700" />
                <span><strong>{summary?.householdName || 'Sharma Family'}</strong> ({summary?.totalServings || 4} Servings)</span>
              </div>
            </div>
          </div>

          {/* Section 1: Planned Meals */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest-800 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-terracotta-500" />
              <span>Planned Meals for the Day</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['breakfast', 'lunch', 'dinner'].map((cat) => {
                const meal = summary?.plannedMeals.find(m => m.mealCategory.toLowerCase() === cat);
                return (
                  <div key={cat} className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-forest-700 block">
                      {cat.toUpperCase()}
                    </span>
                    {meal ? (
                      <>
                        <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-2">
                          {meal.recipeTitle}
                        </h4>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {meal.cookTimeMinutes}m cook
                          </span>
                          <span>•</span>
                          <span>{meal.servings} portions</span>
                        </div>
                        {meal.isJainFriendly && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Jain Suitable
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-stone-400 italic text-xs block py-2">No meal scheduled</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Overnight Soaking Alerts */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-amber-600" />
              <span>Raat Ko Bhijona Hai (Overnight Soaking Needed Tonight)</span>
            </h3>

            {summary?.overnightSoaking && summary.overnightSoaking.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 divide-y divide-amber-200/60">
                {summary.overnightSoaking.map((s, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-bold text-stone-900 block text-xs sm:text-sm">
                        💧 {s.ingredientName} ({s.quantity} {s.unit})
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">{s.notes}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 whitespace-nowrap">
                      {s.forMeal}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-stone-500 italic">
                Zero overnight soaking required for tomorrow&apos;s meals.
              </div>
            )}
          </div>

          {/* Section 3: Advance Preparation Tasks */}
          {summary?.advancePreparation && summary.advancePreparation.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-600" />
                <span>Advance Preparation Tasks</span>
              </h3>

              <div className="space-y-2">
                {summary.advancePreparation.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{p.task}</span>
                      <span className="text-[10px] font-semibold text-forest-700 bg-white px-2 py-0.5 rounded border border-cream-300">
                        {p.forMeal}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600">{p.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Household Dietary & Allergy Notes */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-terracotta-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-terracotta-500" />
              <span>Family Dietary Rules & Special Instructions for Cook</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-terracotta-50/60 border border-terracotta-200 space-y-2 text-xs">
              {summary?.householdDietaryRestrictions.map((r, idx) => {
                const tags = [];
                if (r.dietaryPreference.toLowerCase() === 'jain') tags.push('Strict Jain (No Onions, Garlic, Potatoes, Carrots)');
                if (r.allergies?.length) tags.push(`Allergies: ${r.allergies.join(', ')}`);
                if (r.dislikedIngredients?.length) tags.push(`Avoid: ${r.dislikedIngredients.join(', ')}`);

                return (
                  <div key={idx} className="flex items-baseline justify-between border-b border-terracotta-100 pb-1.5 last:border-b-0 last:pb-0">
                    <span className="font-bold text-stone-900">{r.memberName}</span>
                    <span className="text-stone-600 text-right">
                      {tags.length ? tags.join(' • ') : 'Standard Home Vegetarian'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cream-200 bg-cream-50/70 flex items-center justify-between text-xs text-stone-500">
          <span>RasoiIQ Kitchen Intelligence — Domestic Cook Briefing</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-forest-800 text-white font-bold hover:bg-forest-900 transition-colors"
          >
            Close Brief
          </button>
        </div>

      </div>
    </div>
  );
}
