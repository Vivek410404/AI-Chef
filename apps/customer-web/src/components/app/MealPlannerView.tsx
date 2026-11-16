'use client';

import React, { useState } from 'react';
import {
  MealPlanItem,
  Recipe,
  DayOfWeek,
  MealCategory,
  Household,
  ScaledIngredientRequirement
} from '@rasoi/shared-types';
import {
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  Clock,
  Flame,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Calendar as CalendarIcon,
  ChefHat,
  PackageCheck,
  TrendingDown,
  Layers,
  UtensilsCrossed,
  Activity,
  Dumbbell,
  Target,
  Info,
  BarChart3,
  Sliders,
  Check
} from 'lucide-react';
import { calculateWeeklyNutritionAnalytics } from '@rasoi/grocery-engine';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';
import { MaharajDigestModal } from './MaharajDigestModal';

interface MealPlannerViewProps {
  planItems: MealPlanItem[];
  household: Household | null;
  requirements: ScaledIngredientRequirement[];
  onAddMeal: (day: DayOfWeek, meal: MealCategory) => void;
  onRegenerateMeal?: (day: DayOfWeek, meal: MealCategory) => void;
  onRemoveMeal: (id: string) => void;
  onUpdateServings: (id: string, delta: number) => void;
  onOpenAiPlanner: () => void;
  onGoToBasket: () => void;
  onClearPlan: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenHousehold: () => void;
}

const DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
  { id: 'saturday', label: 'Saturday', short: 'Sat' },
  { id: 'sunday', label: 'Sunday', short: 'Sun' }
];

const MEAL_CATEGORIES: { id: MealCategory; label: string; timeHint: string }[] = [
  { id: 'breakfast', label: 'Breakfast', timeHint: 'Morning' },
  { id: 'lunch', label: 'Lunch', timeHint: 'Afternoon' },
  { id: 'dinner', label: 'Dinner', timeHint: 'Evening' },
  { id: 'snack', label: 'Snacks', timeHint: 'Tea-time' }
];

export function MealPlannerView({
  planItems,
  household,
  requirements,
  onAddMeal,
  onRegenerateMeal,
  onRemoveMeal,
  onUpdateServings,
  onOpenAiPlanner,
  onGoToBasket,
  onClearPlan,
  onSelectRecipe,
  onOpenHousehold
}: MealPlannerViewProps) {
  // Mobile active day index (0 = Monday, 6 = Sunday)
  const [activeMobileDayIdx, setActiveMobileDayIdx] = useState(0);
  const [isMaharajModalOpen, setIsMaharajModalOpen] = useState(false);

  const getMeal = (day: DayOfWeek, category: MealCategory) => {
    return planItems.find(i => i.dayOfWeek === day && i.mealCategory === category);
  };

  // Section 5: Real Application Data Calculations for Summary Area
  const totalSlotsCount = 7 * 4; // 7 days * 4 meal categories = 28 total slots
  const plannedMealsCount = planItems.length;
  const emptySlotsCount = Math.max(0, totalSlotsCount - plannedMealsCount);
  const totalRequiredIngredientsCount = requirements.length;
  const estimatedWeeklyCost = planItems.reduce((sum, item) => sum + (item.recipe?.estimatedCostInr || 120), 0);
  const weeklyBudget = household?.weeklyBudgetInr || 3500;
  const budgetPercentage = Math.min(100, Math.round((estimatedWeeklyCost / weeklyBudget) * 100));

  const activeMobileDay = DAYS[activeMobileDayIdx];

  // Nutrition & Protein Analytics State
  const [nutritionTab, setNutritionTab] = useState<'daily' | 'weekly'>('daily');
  const [avgMetricType, setAvgMetricType] = useState<'planned' | 'calendar'>('planned');
  const [selectedNutritionDay, setSelectedNutritionDay] = useState<DayOfWeek>('monday');
  const [isEditingProteinGoal, setIsEditingProteinGoal] = useState(false);
  const [customProteinGoal, setCustomProteinGoal] = useState<number>(
    household?.nutritionGoals?.dailyProteinGrams || 65
  );

  const weeklyAnalytics = React.useMemo(() => {
    return calculateWeeklyNutritionAnalytics(planItems, {
      ...household?.nutritionGoals,
      dailyProteinGrams: customProteinGoal
    });
  }, [planItems, household, customProteinGoal]);

  const activeDailyNutrition = weeklyAnalytics.dailySummaries[selectedNutritionDay];

  const handlePrevDay = () => {
    setActiveMobileDayIdx((prev) => (prev > 0 ? prev - 1 : 6));
  };

  const handleNextDay = () => {
    setActiveMobileDayIdx((prev) => (prev < 6 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Planner Header & Quick Actions */}
      <div className="bg-surface rounded-3xl p-5 sm:p-7 border border-cream-300 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
              Active Week: Nov 16 - Nov 22
            </span>
            <button
              onClick={onOpenHousehold}
              className="text-xs font-semibold text-stone-600 hover:text-forest-800 underline decoration-cream-400"
            >
              • {household?.name || 'Sharma Family'} ({household?.members.length || 4} Members)
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-forest-900 tracking-tight">
            Weekly Indian Meal Planner
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Organize home meals across breakfast, lunch, dinner & snacks with automatic grocery syncing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={onOpenAiPlanner}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-forest-700 via-forest-600 to-emerald-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-soft hover:shadow-elevated transition-all"
          >
            <Sparkles className="w-4 h-4 text-saffron-500 animate-pulse" />
            <span>Generate AI Plan</span>
          </button>

          <button
            onClick={onGoToBasket}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-soft transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Smart Basket ({requirements.length})</span>
          </button>

          <button
            onClick={() => setIsMaharajModalOpen(true)}
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-soft hover:shadow-elevated transition-all"
            title="Generate Cook / Maharaj Prep Digest"
          >
            <ChefHat className="w-4 h-4 text-saffron-400" />
            <span>Cook Digest</span>
          </button>

          {plannedMealsCount > 0 && (
            <button
              onClick={onClearPlan}
              className="p-2.5 sm:p-3 rounded-2xl border border-cream-300 text-stone-400 hover:text-red-600 hover:border-red-200 transition-colors"
              title="Reset Week"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Section 5: Compact Weekly Summary Dashboard Area (Actual Application Data) */}
      <div className="bg-surface rounded-3xl p-5 border border-cream-300 shadow-soft">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-3.5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-forest-700" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-forest-900">
              Weekly Meal & Grocery Snapshot
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">
            {plannedMealsCount} of {totalSlotsCount} Slots Planned
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Planned Meals Stat */}
          <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Planned Meals</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-forest-900">{plannedMealsCount}</span>
              <span className="text-[11px] text-stone-500">/ {totalSlotsCount}</span>
            </div>
            <span className="text-[10px] font-semibold text-forest-700 block">
              {emptySlotsCount} slots open
            </span>
          </div>

          {/* Grocery Ingredients Stat */}
          <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Ingredients Required</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-forest-900">{totalRequiredIngredientsCount}</span>
              <span className="text-[11px] text-stone-500">unique items</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 block">
              Deduplicated automatically
            </span>
          </div>

          {/* Estimated Cooking Cost */}
          <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Est. Grocery Total</span>
            <span className="text-xl font-black text-forest-900 block">
              {formatInr(estimatedWeeklyCost)}
            </span>
            <span className="text-[10px] font-semibold text-stone-500 block">
              For {household?.members.length || 4} family members
            </span>
          </div>

          {/* Budget Progress Bar */}
          <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold uppercase text-stone-500">Budget Progress</span>
              <span className="text-xs font-black text-forest-900">{budgetPercentage}%</span>
            </div>
            <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 90 ? 'bg-amber-500' : 'bg-forest-600'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-stone-500 block">
              {formatInr(estimatedWeeklyCost)} of {formatInr(weeklyBudget)} weekly budget
            </span>
          </div>

        </div>
      </div>

      {/* 2.5 Nutrition Tracking & Protein Analytics Dashboard */}
      <div className="bg-surface rounded-3xl p-5 sm:p-7 border border-cream-300 shadow-soft space-y-6">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-forest-700" />
              <h2 className="text-lg sm:text-xl font-black text-forest-900 tracking-tight">
                Nutrition & Protein Tracking
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Deterministic calculations from recipe ingredients (Indian Food Composition Tables - IFCT 2017 & USDA)
            </p>
          </div>

          {/* Daily vs Weekly Toggle */}
          <div className="flex items-center bg-cream-100 p-1 rounded-2xl border border-cream-200 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setNutritionTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all ${
                nutritionTab === 'daily'
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-forest-900'
              }`}
            >
              Daily Breakdown
            </button>
            <button
              type="button"
              onClick={() => setNutritionTab('weekly')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold transition-all ${
                nutritionTab === 'weekly'
                  ? 'bg-forest-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-forest-900'
              }`}
            >
              Weekly Averages & Insights
            </button>
          </div>
        </div>

        {/* 1. Prominent Protein Tracking Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cream-100 via-amber-50/50 to-cream-100 border border-amber-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-forest-900">Protein Goal Tracker</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {weeklyAnalytics.highProteinMealsCount} High-Protein Meals (≥15g)
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {nutritionTab === 'daily'
                    ? `Showing ${DAYS.find(d => d.id === selectedNutritionDay)?.label} protein intake`
                    : 'Showing weekly average daily protein'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsEditingProteinGoal(!isEditingProteinGoal)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-cream-300 text-xs font-bold text-stone-700 hover:text-forest-900 hover:border-forest-400 transition-all"
              >
                <Sliders className="w-3.5 h-3.5 text-forest-700" />
                <span>{isEditingProteinGoal ? 'Close Goal Editor' : 'Adjust Protein Goal'}</span>
              </button>
            </div>
          </div>

          {/* Goal Editor Pop-down */}
          {isEditingProteinGoal && (
            <div className="p-3.5 rounded-xl bg-surface border border-amber-200 space-y-2 animate-fade-in text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-forest-900">Configure Daily Protein Goal (Optional):</span>
                <span className="font-black text-sm text-terracotta-600">{customProteinGoal}g / day</span>
              </div>
              <input
                type="range"
                min="40"
                max="140"
                step="5"
                value={customProteinGoal}
                onChange={(e) => setCustomProteinGoal(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                <span>40g (Light)</span>
                <span>65g (Balanced)</span>
                <span>90g (Active)</span>
                <span>140g (High Athletic)</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-snug pt-1">
                Note: This is an optional personal preference target. RasoiIQ does not prescribe medical or weight-loss targets.
              </p>
            </div>
          )}

          {/* Progress Bar & Numerical Metrics */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-forest-900">
                  {nutritionTab === 'daily'
                    ? `${activeDailyNutrition.total.protein}g`
                    : `${weeklyAnalytics.weeklyDailyAverage.protein}g`}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  / {customProteinGoal}g goal
                </span>
              </div>
              <span className="font-black text-xs text-amber-800">
                {nutritionTab === 'daily'
                  ? `${activeDailyNutrition.proteinProgressPercent || 0}% of target`
                  : `${weeklyAnalytics.avgDailyProteinProgressPercent || 0}% of target`}
              </span>
            </div>

            <div className="w-full bg-cream-200/80 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (nutritionTab === 'daily'
                    ? (activeDailyNutrition.proteinProgressPercent || 0)
                    : (weeklyAnalytics.avgDailyProteinProgressPercent || 0)) >= 80
                    ? 'bg-forest-600'
                    : (nutritionTab === 'daily'
                        ? (activeDailyNutrition.proteinProgressPercent || 0)
                        : (weeklyAnalytics.avgDailyProteinProgressPercent || 0)) >= 50
                      ? 'bg-amber-500'
                      : 'bg-terracotta-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    nutritionTab === 'daily'
                      ? activeDailyNutrition.proteinProgressPercent || 0
                      : weeklyAnalytics.avgDailyProteinProgressPercent || 0
                  )}%`
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-stone-500 pt-0.5">
              <span>Weekly Avg: <strong>{weeklyAnalytics.weeklyDailyAverage.protein}g/day</strong></span>
              <span>7-Day Total: <strong>{weeklyAnalytics.weeklyTotal.protein}g</strong></span>
            </div>
          </div>
        </div>

        {/* TAB 1: Daily Breakdown View */}
        {nutritionTab === 'daily' && (
          <div className="space-y-4">
            {/* Day Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {DAYS.map((d) => {
                const daySummary = weeklyAnalytics.dailySummaries[d.id];
                const isSelected = selectedNutritionDay === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedNutritionDay(d.id)}
                    className={`px-3 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all text-center flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? 'bg-forest-700 text-white shadow-soft'
                        : 'bg-cream-50 hover:bg-cream-100 text-stone-600 border border-cream-200'
                    }`}
                  >
                    <span>{d.short}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-amber-300 font-extrabold' : 'text-stone-400'}`}>
                      {daySummary.total.protein}g P
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Daily Macro Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Daily Calories</span>
                <span className="text-lg font-black text-forest-900">{activeDailyNutrition.total.calories}</span>
                <span className="text-[10px] text-stone-400 block">kcal</span>
              </div>

              <div className="p-3 rounded-2xl bg-terracotta-50 border border-terracotta-200">
                <span className="text-[10px] font-black text-terracotta-800 uppercase block">Daily Protein</span>
                <span className="text-lg font-black text-terracotta-600">{activeDailyNutrition.total.protein}g</span>
                <span className="text-[10px] text-terracotta-700/70 block">vital building blocks</span>
              </div>

              <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Carbohydrates</span>
                <span className="text-lg font-black text-forest-900">{activeDailyNutrition.total.carbs}g</span>
                <span className="text-[10px] text-stone-400 block">daily energy</span>
              </div>

              <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Total Fat</span>
                <span className="text-lg font-black text-forest-900">{activeDailyNutrition.total.fat}g</span>
                <span className="text-[10px] text-stone-400 block">healthy lipids</span>
              </div>

              <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Dietary Fibre</span>
                <span className="text-lg font-black text-forest-900">{activeDailyNutrition.total.fiber}g</span>
                <span className="text-[10px] text-stone-400 block">gut wellness</span>
              </div>
            </div>

            {/* Meal Category Breakdown for the Day */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Meal-by-Meal Contribution ({DAYS.find(d => d.id === selectedNutritionDay)?.label}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => {
                  const item = getMeal(selectedNutritionDay, cat);
                  const macros = activeDailyNutrition.byMeal[cat];
                  return (
                    <div
                      key={cat}
                      className="p-3 rounded-2xl bg-surface border border-cream-200 flex flex-col justify-between space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold uppercase text-[10px] tracking-wider text-forest-800 bg-cream-100 px-2 py-0.5 rounded-lg">
                          {cat}
                        </span>
                        {item && (
                          <span className="text-[10px] text-stone-400 font-semibold">
                            {item.servings} svg
                          </span>
                        )}
                      </div>

                      {item?.recipe ? (
                        <div>
                          <p className="font-bold text-forest-900 line-clamp-1 leading-snug">
                            {item.recipe.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-600">
                            <span>{macros.calories} kcal</span>
                            <span>•</span>
                            <span className="font-bold text-terracotta-600">{macros.protein}g protein</span>
                            <span>•</span>
                            <span className="text-stone-400">{macros.fiber}g fibre</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-400 italic">No meal scheduled</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Weekly Averages & Comparative Insights View */}
        {nutritionTab === 'weekly' && (
          <div className="space-y-5">
            {/* Metric Mode Toggle: Planned Day vs Calendar Day */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-cream-100/70 border border-cream-200 rounded-2xl">
              <div>
                <span className="text-xs font-bold text-forest-900 block">Average Calculation Mode:</span>
                <span className="text-[11px] text-stone-500">
                  {avgMetricType === 'planned'
                    ? `Showing intake averaged across ${weeklyAnalytics.plannedDaysCount || 0} active planned cooking days (empty days excluded).`
                    : 'Showing 7-day annualized baseline distributed across all calendar days.'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-cream-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setAvgMetricType('planned')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    avgMetricType === 'planned'
                      ? 'bg-forest-700 text-white shadow-soft'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-cream-50'
                  }`}
                >
                  Planned Day Avg ({weeklyAnalytics.plannedDaysCount || 0}d)
                </button>
                <button
                  type="button"
                  onClick={() => setAvgMetricType('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    avgMetricType === 'calendar'
                      ? 'bg-forest-700 text-white shadow-soft'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-cream-50'
                  }`}
                >
                  7-Day Calendar Avg
                </button>
              </div>
            </div>

            {/* Average Metric Badges (Controlled by selected calculation mode) */}
            {(() => {
              const activeAvg = avgMetricType === 'planned'
                ? (weeklyAnalytics.plannedDayAverage || weeklyAnalytics.weeklyDailyAverage)
                : (weeklyAnalytics.calendarDayAverage || weeklyAnalytics.weeklyDailyAverage);
              const labelSubtitle = avgMetricType === 'planned'
                ? `per planned day (${weeklyAnalytics.plannedDaysCount || 0}d)`
                : 'per calendar day (7d)';

              return (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Average Calories</span>
                    <span className="text-lg font-black text-forest-900">{activeAvg.calories}</span>
                    <span className="text-[10px] text-stone-400 block">{labelSubtitle}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-terracotta-50 border border-terracotta-200">
                    <span className="text-[10px] font-black text-terracotta-800 uppercase block">Average Protein</span>
                    <span className="text-lg font-black text-terracotta-600">{activeAvg.protein}g</span>
                    <span className="text-[10px] text-terracotta-700/70 block">{labelSubtitle}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Avg Carbohydrates</span>
                    <span className="text-lg font-black text-forest-900">{activeAvg.carbs}g</span>
                    <span className="text-[10px] text-stone-400 block">{labelSubtitle}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Avg Total Fat</span>
                    <span className="text-lg font-black text-forest-900">{activeAvg.fat}g</span>
                    <span className="text-[10px] text-stone-400 block">{labelSubtitle}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase block">Avg Dietary Fibre</span>
                    <span className="text-lg font-black text-forest-900">{activeAvg.fiber}g</span>
                    <span className="text-[10px] text-stone-400 block">{labelSubtitle}</span>
                  </div>
                </div>
              );
            })()}

            {/* Protein Source Diversity & Rotation Card */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-forest-900">
                    Protein Source Diversity & Rotation
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-terracotta-100 text-terracotta-800">
                    Diversity Score: {weeklyAnalytics.proteinDiversityScore || 0}%
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-semibold">
                  {weeklyAnalytics.highProteinMealsCount} High-Protein Meals (≥15g/svg)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-stone-500 font-medium text-[11px]">Active Sources Rotated:</span>
                {weeklyAnalytics.proteinSourcesDetected && weeklyAnalytics.proteinSourcesDetected.length > 0 ? (
                  weeklyAnalytics.proteinSourcesDetected.map((src) => (
                    <span
                      key={src}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-surface border border-cream-200 text-forest-800 capitalize shadow-2xs"
                    >
                      {src}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400 italic text-[11px]">
                    Plan meals to rotate between Paneer, Dal, Chickpeas, Rajma, Soy, Curd, etc.
                  </span>
                )}
              </div>
            </div>

            {/* 7-Day Day-by-Day Comparison Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                7-Day Nutritional Balance Overview:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                {DAYS.map((d) => {
                  const daySummary = weeklyAnalytics.dailySummaries[d.id];
                  const proteinRatio = Math.min(100, Math.round((daySummary.total.protein / customProteinGoal) * 100));
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-2xl bg-surface border border-cream-200 flex flex-col justify-between space-y-2 text-center"
                    >
                      <span className="text-xs font-extrabold text-forest-900 block">{d.short}</span>
                      
                      <div className="space-y-1">
                        <span className="text-sm font-black text-terracotta-600 block">
                          {daySummary.total.protein}g
                        </span>
                        <div className="w-full bg-cream-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${proteinRatio >= 80 ? 'bg-forest-600' : 'bg-amber-500'}`}
                            style={{ width: `${proteinRatio}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-500 block">
                          {daySummary.total.calories} kcal
                        </span>
                      </div>

                      <span className="text-[9px] text-stone-400 block">
                        {daySummary.mealCount} meals
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meal Category Averages */}
            <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="font-bold text-forest-900">Average Category Contributions:</span>
              <div className="flex flex-wrap items-center gap-4 text-stone-600 text-[11px]">
                <span>Breakfast: <strong>{weeklyAnalytics.byMealAverage.breakfast.calories} kcal</strong> ({weeklyAnalytics.byMealAverage.breakfast.protein}g P)</span>
                <span>Lunch: <strong>{weeklyAnalytics.byMealAverage.lunch.calories} kcal</strong> ({weeklyAnalytics.byMealAverage.lunch.protein}g P)</span>
                <span>Dinner: <strong>{weeklyAnalytics.byMealAverage.dinner.calories} kcal</strong> ({weeklyAnalytics.byMealAverage.dinner.protein}g P)</span>
              </div>
            </div>
          </div>
        )}

        {/* Data Attribution Footer */}
        <div className="pt-2 border-t border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-forest-700 shrink-0" />
            <span>
              All nutrition values calculated deterministically per ingredient from the{' '}
              <strong>Indian Food Composition Tables (IFCT 2017, ICMR-NIN)</strong> & USDA FoodData Central.
            </span>
          </div>
          <span className="text-stone-400 text-[10px]">
            Personal preferences only. Not intended as clinical nutrition advice.
          </span>
        </div>

      </div>

      {/* 3. MOBILE VIEW: 1 Day at a Time with Previous/Next Navigation and Day Selector Pills */}
      <div className="block lg:hidden space-y-4">
        
        {/* Day Selector Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {DAYS.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActiveMobileDayIdx(idx)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                activeMobileDayIdx === idx
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'bg-surface text-stone-600 border border-cream-300'
              }`}
            >
              <span>{d.short}</span>
              {d.id === 'monday' && <span className="ml-1 text-[9px] text-emerald-300">•</span>}
            </button>
          ))}
        </div>

        {/* Active Day Header with Nav Arrows */}
        <div className="bg-surface rounded-3xl p-4 border border-cream-300 shadow-soft flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className="w-10 h-10 rounded-2xl bg-cream-100 hover:bg-cream-200 text-forest-900 flex items-center justify-center transition-colors"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-extrabold text-base text-forest-900">{activeMobileDay.label}</h3>
              {activeMobileDay.id === 'monday' && (
                <span className="text-[9px] font-extrabold uppercase bg-forest-700 text-white px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {planItems.filter(i => i.dayOfWeek === activeMobileDay.id).length} meals planned
            </span>
          </div>

          <button
            onClick={handleNextDay}
            className="w-10 h-10 rounded-2xl bg-cream-100 hover:bg-cream-200 text-forest-900 flex items-center justify-center transition-colors"
            aria-label="Next day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Meal Slots for the Active Day on Mobile */}
        <div className="space-y-3">
          {MEAL_CATEGORIES.map((cat) => {
            const item = getMeal(activeMobileDay.id, cat.id);

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-forest-900">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">{cat.timeHint}</span>
                </div>

                {item && item.recipe ? (
                  /* Filled Meal Card on Mobile */
                  <div className="p-3.5 rounded-3xl bg-surface border border-cream-300 shadow-soft space-y-3">
                    <div className="flex gap-3">
                      <ImageWithFallback
                        src={item.recipe.imageUrl}
                        alt={item.recipe.title}
                        fallbackTitle={item.recipe.title}
                        fallbackCuisine={item.recipe.cuisine}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0 cursor-pointer"
                        onClick={() => onSelectRecipe(item.recipe)}
                      />

                      <div className="flex-1 overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[10px] font-bold text-terracotta-600 uppercase">
                              {item.recipe.cuisine}
                            </span>
                            <div className="flex items-center gap-1">
                              {onRegenerateMeal && (
                                <button
                                  onClick={() => onRegenerateMeal(activeMobileDay.id, cat.id)}
                                  className="p-1 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                  title="Regenerate this meal with AI Chef"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onAddMeal(activeMobileDay.id, cat.id)}
                                className="p-1 rounded-lg text-stone-400 hover:text-forest-700"
                                title="Swap dish"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onRemoveMeal(item.id)}
                                className="p-1 rounded-lg text-stone-400 hover:text-red-500"
                                title="Remove dish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4
                            onClick={() => onSelectRecipe(item.recipe)}
                            className="text-xs sm:text-sm font-extrabold text-forest-900 line-clamp-2 leading-snug cursor-pointer hover:text-terracotta-600"
                          >
                            {item.recipe.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-stone-500 mt-1">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {item.recipe.prepTimeMinutes + item.recipe.cookTimeMinutes}m
                          </span>
                          <span>•</span>
                          <span>{item.recipe.proteinGrams}g Protein</span>
                        </div>
                      </div>
                    </div>

                    {/* Touch-Friendly Servings Controls */}
                    <div className="pt-2 border-t border-cream-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-600">Servings</span>
                      <div className="flex items-center gap-3 bg-cream-100 px-3 py-1.5 rounded-2xl border border-cream-200">
                        <button
                          onClick={() => onUpdateServings(item.id, -1)}
                          disabled={item.servings <= 1}
                          className="min-w-8 min-h-8 flex items-center justify-center font-bold text-base text-stone-700 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-xs text-forest-900 min-w-4 text-center">
                          {item.servings}
                        </span>
                        <button
                          onClick={() => onUpdateServings(item.id, 1)}
                          className="min-w-8 min-h-8 flex items-center justify-center font-bold text-base text-stone-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Slot on Mobile */
                  <button
                    onClick={() => onAddMeal(activeMobileDay.id, cat.id)}
                    className="w-full p-4 rounded-3xl border-2 border-dashed border-cream-300 hover:border-forest-500 hover:bg-forest-50/40 bg-surface/60 transition-all flex items-center justify-center gap-2 group min-h-16"
                  >
                    <div className="w-7 h-7 rounded-full bg-forest-50 group-hover:bg-forest-700 group-hover:text-white text-forest-700 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-stone-600 group-hover:text-forest-900">
                      Add Dish to {cat.label}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* 4. DESKTOP & TABLET VIEW: Responsive 7-Day Grid with Horizontal Scroll and Generous Card Width */}
      <div className="hidden lg:block overflow-x-auto pb-4 scrollbar-thin">
        <div className="grid grid-cols-7 gap-3.5 min-w-[1050px]">
          {DAYS.map((day) => {
            const dayMeals = planItems.filter(i => i.dayOfWeek === day.id);
            const isToday = day.id === 'monday';

            return (
              <div
                key={day.id}
                className={`rounded-3xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'bg-cream-50/90 border-forest-500/50 shadow-soft'
                    : 'bg-surface border-cream-300'
                }`}
              >
                {/* Day Header */}
                <div className="p-3.5 border-b border-cream-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-forest-900">{day.label}</h3>
                    <span className="text-[10px] font-semibold text-stone-500">
                      {dayMeals.length} planned
                    </span>
                  </div>
                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase bg-forest-700 text-white px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Slots: Breakfast, Lunch, Dinner, Snacks */}
                <div className="p-2.5 space-y-2.5 flex-1">
                  {MEAL_CATEGORIES.map((cat) => {
                    const item = getMeal(day.id, cat.id);

                    if (item && item.recipe) {
                      return (
                        <div
                          key={cat.id}
                          className="p-2.5 rounded-2xl bg-surface border border-cream-200 shadow-sm space-y-2 hover:border-forest-400 transition-colors group"
                        >
                          {/* Meal Category & Actions */}
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400">
                              {cat.label}
                            </span>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              {onRegenerateMeal && (
                                <button
                                  onClick={() => onRegenerateMeal(day.id, cat.id)}
                                  className="text-amber-500 hover:text-amber-600 p-0.5 transition-colors"
                                  title="Regenerate this meal with AI Chef"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                </button>
                              )}
                              <button
                                onClick={() => onAddMeal(day.id, cat.id)}
                                className="text-stone-300 hover:text-forest-700 p-0.5 transition-colors"
                                title="Swap dish"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onRemoveMeal(item.id)}
                                className="text-stone-300 hover:text-red-500 p-0.5 transition-colors"
                                title="Remove meal"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Recipe Preview Clickable with ImageFallback */}
                          <div
                            onClick={() => onSelectRecipe(item.recipe)}
                            className="flex items-start gap-2 cursor-pointer"
                          >
                            <ImageWithFallback
                              src={item.recipe.imageUrl}
                              alt={item.recipe.title}
                              fallbackTitle={item.recipe.title}
                              fallbackCuisine={item.recipe.cuisine}
                              className="w-11 h-11 rounded-xl object-cover shrink-0"
                            />
                            <div className="overflow-hidden flex-1">
                              <p className="text-xs font-bold text-forest-900 leading-snug line-clamp-2 group-hover:text-terracotta-600 transition-colors">
                                {item.recipe.title}
                              </p>
                              <span className="text-[10px] text-stone-400 block mt-0.5">
                                {item.recipe.cuisine}
                              </span>
                            </div>
                          </div>

                          {/* Servings Counter */}
                          <div className="pt-1.5 border-t border-cream-100 flex items-center justify-between text-[11px] text-stone-600">
                            <span className="font-semibold text-[10px]">Servings</span>
                            <div className="flex items-center gap-1 bg-cream-100 px-2 py-0.5 rounded-lg border border-cream-200">
                              <button
                                onClick={() => onUpdateServings(item.id, -1)}
                                disabled={item.servings <= 1}
                                className="text-stone-600 hover:text-forest-900 disabled:opacity-30 font-bold px-0.5"
                              >
                                -
                              </button>
                              <span className="font-extrabold text-forest-900 text-xs px-1">
                                {item.servings}
                              </span>
                              <button
                                onClick={() => onUpdateServings(item.id, 1)}
                                className="text-stone-600 hover:text-forest-900 font-bold px-0.5"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Empty Slot
                    return (
                      <button
                        key={cat.id}
                        onClick={() => onAddMeal(day.id, cat.id)}
                        className="w-full p-2.5 rounded-2xl border-2 border-dashed border-cream-300 hover:border-forest-500 hover:bg-forest-50/40 bg-surface/50 transition-all text-center space-y-0.5 group block"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                          {cat.label}
                        </span>
                        <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-stone-500 group-hover:text-forest-800">
                          <Plus className="w-3 h-3 text-forest-500" />
                          <span>Add Dish</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      <MaharajDigestModal
        isOpen={isMaharajModalOpen}
        onClose={() => setIsMaharajModalOpen(false)}
        household={household}
        planItems={planItems}
      />

    </div>
  );
}
