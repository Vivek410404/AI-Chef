'use client';

import React from 'react';
import { Recipe } from '@rasoi/shared-types';
import { Clock, Flame, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';

interface FeaturedRecipesSectionProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onViewAll: () => void;
}

export function FeaturedRecipesSection({
  recipes,
  onSelectRecipe,
  onViewAll
}: FeaturedRecipesSectionProps) {
  const displayRecipes = recipes.slice(0, 4);

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-terracotta-600 mb-1">Authentic Regional Indian Kitchen</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-forest-900 tracking-tight">
              Featured Indian Recipes
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Tested homestyle recipes with exact scaling, Jain variations, and grocery mappings.
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-bold flex items-center gap-2 transition-colors border border-forest-200"
          >
            <span>Explore All 10+ Curated Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onSelectRecipe(recipe)}
              className="bg-surface rounded-3xl overflow-hidden border border-cream-300 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              {/* Recipe Image with Cuisine Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-cream-200">
                <ImageWithFallback
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  fallbackTitle={recipe.title}
                  fallbackCuisine={recipe.cuisine}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-surface/90 text-forest-900 backdrop-blur shadow-sm">
                    {recipe.cuisine}
                  </span>
                  {recipe.isJainFriendly && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-sm">
                      Jain
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-black/60 text-white backdrop-blur">
                  ~{formatInr(recipe.estimatedCostInr)} / {recipe.defaultServings}s
                </div>
              </div>

              {/* Recipe Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-forest-900 line-clamp-2 leading-snug group-hover:text-terracotta-600 transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-cream-200 flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-terracotta-500" />
                    <span>{recipe.proteinGrams}g Protein</span>
                  </div>
                  <div className="text-[11px] font-bold text-forest-700">
                    {recipe.difficulty}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
