'use client';

import React, { useState } from 'react';
import { Recipe, IndianCuisine, DietaryTag } from '@rasoi/shared-types';
import { Search, Clock, Flame, ChefHat, Dumbbell } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';

interface RecipeDiscoveryViewProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

const CUISINES: (IndianCuisine | 'All')[] = [
  'All',
  'North Indian',
  'Gujarati',
  'Punjabi',
  'South Indian',
  'Maharashtrian'
];

const DIETARY_TAGS: (DietaryTag | 'All')[] = [
  'All',
  'Pure Vegetarian',
  'Jain Friendly',
  'High-Protein',
  'Eggetarian'
];

export function RecipeDiscoveryView({ recipes, onSelectRecipe }: RecipeDiscoveryViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<IndianCuisine | 'All'>('All');
  const [selectedDiet, setSelectedDiet] = useState<DietaryTag | 'All'>('All');

  const filteredRecipes = recipes.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.ingredient?.name.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedCuisine !== 'All' && r.cuisine !== selectedCuisine) {
      return false;
    }

    if (selectedDiet !== 'All') {
      if (selectedDiet === 'Jain Friendly' && !r.isJainFriendly) return false;
      if (!r.dietaryTags.includes(selectedDiet)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Search and Filters Header */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-900 tracking-tight">
            Discover Authentic Indian Recipes
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Curated regional dishes with step-by-step cooking steps and automatic grocery basket mappings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by recipe name, cuisine, or ingredients (e.g. paneer, toor dal, thepla)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-forest-500 bg-cream-50/50 text-sm font-medium text-forest-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="space-y-3 pt-2">
          {/* Cuisines */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">Cuisine:</span>
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCuisine === c
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">Diet:</span>
            {DIETARY_TAGS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDiet(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDiet === d
                    ? 'bg-terracotta-500 text-white shadow-sm'
                    : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            className="bg-surface rounded-3xl overflow-hidden border border-cream-300 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between cursor-pointer group"
          >
            {/* Image Banner with Fallback */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-cream-200">
              <ImageWithFallback
                src={recipe.imageUrl}
                alt={recipe.title}
                fallbackTitle={recipe.title}
                fallbackCuisine={recipe.cuisine}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-surface/90 text-forest-900 backdrop-blur shadow-sm">
                  {recipe.cuisine}
                </span>
                {recipe.isJainFriendly && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-sm">
                    Jain Friendly
                  </span>
                )}
                {recipe.proteinGrams >= 14 && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    High Protein
                  </span>
                )}
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl text-xs font-bold bg-black/60 text-white backdrop-blur">
                ~{formatInr(recipe.estimatedCostInr)} / {recipe.defaultServings}s
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-forest-900 line-clamp-2 leading-snug group-hover:text-terracotta-600 transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {recipe.description}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-cream-200 flex items-center justify-between text-xs text-stone-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-terracotta-500" />
                  <span className="font-extrabold text-terracotta-600">{recipe.proteinGrams}g Protein</span>
                </div>
                <div className="text-[11px] font-semibold text-stone-500">
                  {recipe.caloriesPerServing} kcal
                </div>
                <div className="text-[11px] font-bold text-forest-700">
                  {recipe.difficulty}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-3xl border border-cream-300 p-8 space-y-3">
          <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-forest-900">No dishes match your filter</h3>
          <p className="text-xs text-stone-500">Try clearing filters or search queries.</p>
        </div>
      )}

    </div>
  );
}
