'use client';

import React, { useState, useMemo } from 'react';
import { Recipe, DayOfWeek, MealCategory } from '@rasoi/shared-types';
import { calculateRecipeNutrition } from '@rasoi/grocery-engine';
import { X, Clock, Flame, Plus, Check, ShieldCheck, Activity, ChevronDown, ChevronUp, Info, Dumbbell } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onAddToPlan: (recipe: Recipe, day: DayOfWeek, meal: MealCategory, servings: number) => void;
}

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' }
];

export function RecipeDetailModal({ recipe, onClose, onAddToPlan }: RecipeDetailModalProps) {
  const [servings, setServings] = useState(4);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>('lunch');
  const [isAdded, setIsAdded] = useState(false);
  const [showIngredientNutrition, setShowIngredientNutrition] = useState(false);
  const [nutritionView, setNutritionView] = useState<'perServing' | 'total'>('perServing');

  // Sync state when recipe changes
  React.useEffect(() => {
    if (recipe) {
      setServings(recipe.defaultServings || 4);
      setSelectedMeal(recipe.mealTypes[0] || 'lunch');
    }
  }, [recipe]);

  React.useEffect(() => {
    if (!recipe) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [recipe, onClose]);

  const nutrition = useMemo(() => {
    if (!recipe) return null;
    return calculateRecipeNutrition(recipe, servings);
  }, [recipe, servings]);

  if (!recipe || !nutrition) return null;

  const scaleFactor = servings / (recipe.defaultServings || 4);
  const activeNutrients = nutritionView === 'perServing' ? nutrition.perServing : nutrition.total;
  const isHighProtein = nutrition.perServing.protein >= 14;

  const handleAdd = () => {
    onAddToPlan(recipe, selectedDay, selectedMeal, servings);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-scrollbar overflow-y-auto overflow-x-hidden max-w-[100vw]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto overflow-x-hidden no-scrollbar border border-cream-300 shadow-2xl relative my-auto"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-cream-200">
          <ImageWithFallback
            src={recipe.imageUrl}
            alt={recipe.title}
            fallbackTitle={recipe.title}
            fallbackCuisine={recipe.cuisine}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-transparent to-black/30 pointer-events-none" />
          
          <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-surface/90 text-forest-900 backdrop-blur">
                {recipe.cuisine}
              </span>
              {recipe.isJainFriendly ? (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white">
                  Jain Friendly
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-cream-100 backdrop-blur">
                  Standard Homestyle
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black">{recipe.title}</h1>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* Nutrition and Timing Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200">
              <span className="text-[10px] text-stone-500 font-semibold block">Total Time</span>
              <span className="text-sm font-extrabold text-forest-900">{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
            </div>
            <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200">
              <span className="text-[10px] text-stone-500 font-semibold block">Calories / Svg</span>
              <span className="text-sm font-extrabold text-forest-900">{nutrition.perServing.calories} kcal</span>
            </div>
            <div className={`p-3 rounded-2xl border ${isHighProtein ? 'bg-amber-50 border-amber-300' : 'bg-cream-100 border-cream-200'}`}>
              <div className="flex items-center justify-center gap-1">
                <span className="text-[10px] text-stone-500 font-semibold">Protein / Svg</span>
                {isHighProtein && <Dumbbell className="w-3 h-3 text-terracotta-600" />}
              </div>
              <span className="text-sm font-extrabold text-terracotta-600">{nutrition.perServing.protein}g</span>
            </div>
            <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200">
              <span className="text-[10px] text-stone-500 font-semibold block">Est. Cost</span>
              <span className="text-sm font-extrabold text-forest-900">~{formatInr(recipe.estimatedCostInr * scaleFactor)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
            {recipe.description}
          </p>

          {/* Complete Nutrition Tracking Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-cream-50/80 border border-cream-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-cream-200">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-forest-700" />
                  <h3 className="text-sm font-extrabold text-forest-900">Nutrition Information</h3>
                  {isHighProtein && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      High Protein Dish
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Deterministic calculation from ingredient quantities using IFCT 2017 & USDA standards
                </p>
              </div>

              {/* View Switcher: Per Serving vs Total Scaled */}
              <div className="flex items-center bg-cream-200/70 p-1 rounded-xl text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setNutritionView('perServing')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    nutritionView === 'perServing'
                      ? 'bg-surface text-forest-900 shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  Per Serving
                </button>
                <button
                  type="button"
                  onClick={() => setNutritionView('total')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    nutritionView === 'total'
                      ? 'bg-surface text-forest-900 shadow-xs'
                      : 'text-stone-600 hover:text-forest-900'
                  }`}
                >
                  Total ({servings} Svg)
                </button>
              </div>
            </div>

            {/* 7 Required Nutrients Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
              {/* Calories */}
              <div className="p-2.5 rounded-xl bg-surface border border-cream-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Calories</span>
                <span className="text-sm font-black text-forest-900">{activeNutrients.calories}</span>
                <span className="text-[10px] text-stone-400 block">kcal</span>
              </div>

              {/* Protein (Highlighted) */}
              <div className="p-2.5 rounded-xl bg-terracotta-50/70 border border-terracotta-200">
                <span className="text-[10px] text-terracotta-800 uppercase font-black block">Protein</span>
                <span className="text-sm font-black text-terracotta-600">{activeNutrients.protein}g</span>
                <span className="text-[10px] text-terracotta-700/70 block">
                  {nutritionView === 'perServing' ? 'per serving' : 'total'}
                </span>
              </div>

              {/* Carbs */}
              <div className="p-2.5 rounded-xl bg-surface border border-cream-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Carbs</span>
                <span className="text-sm font-black text-forest-900">{activeNutrients.carbs}g</span>
                <span className="text-[10px] text-stone-400 block">energy</span>
              </div>

              {/* Fat */}
              <div className="p-2.5 rounded-xl bg-surface border border-cream-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Total Fat</span>
                <span className="text-sm font-black text-forest-900">{activeNutrients.fat}g</span>
                <span className="text-[10px] text-stone-400 block">lipids</span>
              </div>

              {/* Fibre */}
              <div className="p-2.5 rounded-xl bg-surface border border-cream-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Fibre</span>
                <span className="text-sm font-black text-forest-900">{activeNutrients.fiber}g</span>
                <span className="text-[10px] text-stone-400 block">dietary</span>
              </div>

              {/* Sugar */}
              <div className="p-2.5 rounded-xl bg-surface border border-cream-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Sugar</span>
                <span className="text-sm font-black text-forest-900">{activeNutrients.sugar}g</span>
                <span className="text-[10px] text-stone-400 block">simple</span>
              </div>

              {/* Sodium */}
              <div className="p-2.5 rounded-xl bg-surface border border-cream-200">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Sodium</span>
                <span className="text-sm font-black text-forest-900">{activeNutrients.sodium}</span>
                <span className="text-[10px] text-stone-400 block">mg</span>
              </div>
            </div>

            {/* Attribution Footnote */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 pt-1 gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                <span>
                  Source:{' '}
                  <span className="font-semibold text-stone-600">
                    Indian Food Composition Tables (IFCT 2017, ICMR-NIN)
                  </span>{' '}
                  & USDA FoodData Central.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowIngredientNutrition(!showIngredientNutrition)}
                className="flex items-center gap-1 font-bold text-forest-800 hover:text-forest-950 underline decoration-cream-300 self-start sm:self-auto"
              >
                <span>{showIngredientNutrition ? 'Hide' : 'View'} ingredient breakdown</span>
                {showIngredientNutrition ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible Ingredient Contribution Breakdown */}
            {showIngredientNutrition && (
              <div className="mt-3 pt-3 border-t border-cream-200 space-y-2 animate-fade-in">
                <span className="text-[11px] font-bold text-forest-900 block">
                  Ingredient Contributions (Total Recipe Recipe Weight):
                </span>
                <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1.5 pr-1">
                  {nutrition.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-surface border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5"
                    >
                      <div>
                        <span className="font-bold text-forest-900">{ing.ingredientName}</span>
                        <span className="text-stone-400 text-[10px] ml-1.5">
                          ({ing.quantity} {ing.unit} ≈ {ing.normalizedGrams}g)
                        </span>
                        {ing.isEstimate && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-stone-100 text-stone-600 border border-stone-200">
                            Estimated
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                        <span>{ing.nutrients.calories} kcal</span>
                        <span>•</span>
                        <span className="font-bold text-terracotta-600">{ing.nutrients.protein}g protein</span>
                        <span>•</span>
                        <span className="text-stone-400">{ing.nutrients.carbs}g carbs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Jain Alternative Note */}
          {recipe.jainAlternativeNotes && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Jain Preparation Adaptation:</span>
              </div>
              <p className="text-stone-600">{recipe.jainAlternativeNotes}</p>
            </div>
          )}

          {/* Scaled Ingredients Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-forest-900">Required Ingredients</h3>
                <p className="text-xs text-stone-500">Scaled automatically for your household size</p>
              </div>

              {/* Servings Counter */}
              <div className="flex items-center gap-2 bg-cream-100 px-3 py-1.5 rounded-2xl border border-cream-200">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="text-stone-600 hover:text-forest-900 font-bold px-1 text-sm"
                >
                  -
                </button>
                <span className="font-extrabold text-xs text-forest-900">{servings} Servings</span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="text-stone-600 hover:text-forest-900 font-bold px-1 text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, idx) => {
                const scaledQty = Number((ing.quantity * scaleFactor).toFixed(1));
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-forest-900">{ing.ingredient?.name || ing.ingredientId}</span>
                      {ing.ingredient?.hindiName && (
                        <span className="text-stone-400 text-[11px] ml-1.5">({ing.ingredient.hindiName})</span>
                      )}
                      {ing.notes && <p className="text-[10px] text-stone-500">{ing.notes}</p>}
                    </div>
                    <span className="font-black text-terracotta-600 shrink-0 ml-2">
                      {scaledQty} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step-by-Step Cooking Steps */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-forest-900">Cooking Method</h3>
            <div className="space-y-2.5">
              {recipe.instructions.map((step) => (
                <div key={step.stepNumber} className="flex gap-3.5 p-3.5 rounded-2xl bg-surface border border-cream-200">
                  <div className="w-6 h-6 rounded-full bg-forest-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {step.stepNumber}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {step.instruction}
                    </p>
                    {step.durationMinutes && (
                      <span className="text-[10px] text-stone-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Approx {step.durationMinutes} mins
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add to 7-Day Plan Footer */}
          <div className="pt-4 border-t border-cream-200 p-4 rounded-3xl bg-cream-50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
              Schedule this dish to your Weekly Plan:
            </h4>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {DAYS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDay(d.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedDay === d.id
                        ? 'bg-forest-700 text-white'
                        : 'bg-surface text-stone-600 border border-cream-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMeal(m)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                      selectedMeal === m
                        ? 'bg-terracotta-500 text-white'
                        : 'bg-surface text-stone-600 border border-cream-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={isAdded}
              className="w-full py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow-soft transition-all flex items-center justify-center gap-2"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Added to {selectedDay.toUpperCase()} {selectedMeal.toUpperCase()}!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Confirm: Add to {selectedDay.toUpperCase()} {selectedMeal.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
