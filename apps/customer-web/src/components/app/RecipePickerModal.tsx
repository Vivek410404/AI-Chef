'use client';

import React, { useState } from 'react';
import { Recipe, DayOfWeek, MealCategory } from '@rasoi/shared-types';
import { X, Search, Clock, Flame, Plus, Check } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';

interface RecipePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  targetDay: DayOfWeek | null;
  targetMeal: MealCategory | null;
  onSelectRecipe: (recipe: Recipe, day: DayOfWeek, meal: MealCategory, servings: number) => void;
  onViewRecipeDetails: (recipe: Recipe) => void;
}

const CUISINES = ['All', 'North Indian', 'Gujarati', 'Punjabi', 'South Indian', 'Maharashtrian'];

export function RecipePickerModal({
  isOpen,
  onClose,
  recipes,
  targetDay,
  targetMeal,
  onSelectRecipe,
  onViewRecipeDetails
}: RecipePickerModalProps) {
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [servings, setServings] = useState(4);

  if (!isOpen || !targetDay || !targetMeal) return null;

  const dayLabel = targetDay.charAt(0).toUpperCase() + targetDay.slice(1);
  const mealLabel = targetMeal.charAt(0).toUpperCase() + targetMeal.slice(1);

  const filtered = recipes.filter((r) => {
    if (selectedCuisine !== 'All' && r.cuisine !== selectedCuisine) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-cream-300 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full border border-forest-200">
                {dayLabel} • {mealLabel}
              </span>
              <span className="text-xs font-semibold text-stone-500">Pick a Dish</span>
            </div>
            <h2 className="text-xl font-black text-forest-900">Add to Meal Plan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-cream-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Search + Servings */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Indian recipes (e.g. paneer, dal, poha)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-cream-300 bg-cream-50/50 text-xs font-medium text-forest-900 focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-cream-100 px-3 py-1.5 rounded-2xl border border-cream-200 shrink-0">
            <span className="text-xs font-bold text-stone-600">Servings:</span>
            <button
              onClick={() => setServings(Math.max(1, servings - 1))}
              className="text-stone-600 hover:text-forest-900 font-bold px-1.5"
            >
              -
            </button>
            <span className="font-extrabold text-xs text-forest-900 min-w-4 text-center">{servings}</span>
            <button
              onClick={() => setServings(servings + 1)}
              className="text-stone-600 hover:text-forest-900 font-bold px-1.5"
            >
              +
            </button>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedCuisine === c
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {filtered.map((recipe) => (
            <div
              key={recipe.id}
              className="p-3.5 rounded-2xl bg-cream-50/60 border border-cream-200 hover:border-forest-500 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="flex gap-3">
                <ImageWithFallback
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fallbackTitle={recipe.title}
                  fallbackCuisine={recipe.cuisine}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wide">
                      {recipe.cuisine}
                    </span>
                    {recipe.isJainFriendly && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                        Jain
                      </span>
                    )}
                    {recipe.proteinGrams >= 14 && (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-200">
                        High Protein
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-extrabold text-forest-900 line-clamp-2 leading-snug">
                    {recipe.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                    </span>
                    <span>•</span>
                    <span className="font-bold text-terracotta-600">{recipe.proteinGrams}g Protein</span>
                    <span>•</span>
                    <span>{recipe.caloriesPerServing} kcal</span>
                    <span>•</span>
                    <span>~{formatInr(recipe.estimatedCostInr)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                <button
                  onClick={() => onViewRecipeDetails(recipe)}
                  className="text-[11px] font-bold text-stone-500 hover:text-forest-700 underline"
                >
                  View Details
                </button>

                <button
                  onClick={() => {
                    onSelectRecipe(recipe, targetDay, targetMeal, servings);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-soft"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to {mealLabel}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
