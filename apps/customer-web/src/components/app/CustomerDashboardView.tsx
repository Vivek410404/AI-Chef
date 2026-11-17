'use client';

import React from 'react';
import {
  Household,
  MealPlanItem,
  ScaledIngredientRequirement,
  GroceryBasket,
  Recipe,
  DayOfWeek,
  MealCategory
} from '@rasoi/shared-types';
import {
  Sparkles,
  Calendar,
  ShoppingBag,
  Package,
  Users,
  UtensilsCrossed,
  Compass,
  Activity,
  Dumbbell,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  Plus,
  ShieldCheck,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { calculateWeeklyNutritionAnalytics } from '@rasoi/grocery-engine';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatInr } from '@/lib/utils';

interface CustomerDashboardViewProps {
  household: Household | null;
  mealPlanItems: MealPlanItem[];
  requirements: ScaledIngredientRequirement[];
  basket: GroceryBasket | null;
  orders: any[];
  onOpenHousehold: () => void;
  onOpenAiPlanner: () => void;
  onGoToPlanner: () => void;
  onGoToBasket: () => void;
  onGoToPantry: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onAddMeal: (day: DayOfWeek, meal: MealCategory) => void;
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

export function CustomerDashboardView({
  household,
  mealPlanItems,
  requirements,
  basket,
  orders,
  onOpenHousehold,
  onOpenAiPlanner,
  onGoToPlanner,
  onGoToBasket,
  onGoToPantry,
  onSelectRecipe,
  onAddMeal
}: CustomerDashboardViewProps) {
  // Real nutrition calculations based on actual scheduled meals
  const weeklyAnalytics = React.useMemo(() => {
    return calculateWeeklyNutritionAnalytics(mealPlanItems, household?.nutritionGoals);
  }, [mealPlanItems, household]);

  // Scheduled meals for selected day (default to Monday)
  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>('monday');
  const todayMeals = {
    breakfast: mealPlanItems.find((i) => i.dayOfWeek === selectedDay && i.mealCategory === 'breakfast'),
    lunch: mealPlanItems.find((i) => i.dayOfWeek === selectedDay && i.mealCategory === 'lunch'),
    dinner: mealPlanItems.find((i) => i.dayOfWeek === selectedDay && i.mealCategory === 'dinner'),
    snack: mealPlanItems.find((i) => i.dayOfWeek === selectedDay && i.mealCategory === 'snack')
  };

  const plannedCount = mealPlanItems.length;
  const totalSlots = 28;
  const planProgressPercent = Math.min(100, Math.round((plannedCount / totalSlots) * 100));

  const activeRetailer = basket?.comparisons.find((c) => c.retailer.id === basket?.selectedRetailerId) || basket?.comparisons[0];
  const selectedCartItems = basket?.items.filter((i) => i.isSelectedForPurchase) || [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* 1. Welcome & Household Header Banner */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Active Household Hub
            </span>
            <span className="text-xs font-semibold text-terracotta-600 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
              {household?.dietaryPreference || 'VEGETARIAN'} Mode
            </span>
            <span className="text-xs font-semibold text-stone-600 bg-cream-100 px-2.5 py-0.5 rounded-full border border-cream-200">
              {household?.cuisinePreference || 'ALL INDIAN'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-forest-900 tracking-tight">
            Namaste, {household?.name || 'Your Kitchen'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Welcome to your family food-tech companion. Plan meals with Gemini 3.5 Flash-Lite, track IFCT nutrition, and order smart grocery baskets across Blinkit, Zepto, DMart Ready, and BigBasket.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-500 font-medium">
            <span>Members: <strong className="text-forest-900">{household?.members?.length || 1} {household?.members?.length === 1 ? 'Person' : 'People'}</strong></span>
            <span>•</span>
            <span>Weekly Budget: <strong className="text-forest-900">{formatInr(household?.weeklyBudgetInr || 3500)}</strong></span>
            <span>•</span>
            <button
              onClick={onOpenHousehold}
              className="text-forest-700 font-bold hover:underline cursor-pointer"
            >
              Configure Preferences →
            </button>
          </div>
        </div>

        {/* Action Hub Quick CTAs */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 relative z-10">
          <button
            onClick={onOpenAiPlanner}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-forest-700 via-forest-600 to-emerald-600 hover:opacity-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-soft hover:shadow-elevated transition-all"
          >
            <Sparkles className="w-4 h-4 text-saffron-500 animate-pulse" />
            <span>Generate with AI Chef</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onGoToPlanner}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-cream-300 hover:border-forest-500 text-forest-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-forest-600" />
              <span>7-Day Planner</span>
            </button>

            <button
              onClick={onGoToBasket}
              className="flex-1 px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Smart Basket ({basket ? basket.items.filter(i => i.isSelectedForPurchase).length : requirements.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Primary 2-Column Grid: Today's Meals + Nutrition Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols): Today's Meals */}
        <div className="lg:col-span-2 bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cream-200 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-forest-900">
                  Planned Meals ({DAYS.find(d => d.id === selectedDay)?.label})
                </h2>
                <p className="text-xs text-stone-500">Scheduled home cooking plan for this day</p>
              </div>
            </div>

            {/* Quick Day Switcher Pills */}
            <div className="flex items-center gap-1 bg-cream-100/80 p-1 rounded-xl border border-cream-200 self-start sm:self-auto overflow-x-auto">
              {DAYS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${selectedDay === d.id
                    ? 'bg-forest-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-forest-900 hover:bg-cream-200'
                    }`}
                >
                  {d.short}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]).map((cat) => {
              const item = todayMeals[cat];
              return (
                <div
                  key={cat}
                  className="p-3.5 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col justify-between space-y-2 hover:border-forest-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-forest-800 bg-cream-100 px-2.5 py-0.5 rounded-lg border border-cream-200">
                      {cat}
                    </span>
                    {item && (
                      <span className="text-[10px] text-stone-500 font-semibold">
                        {item.servings} Servings
                      </span>
                    )}
                  </div>

                  {item?.recipe ? (
                    <div
                      onClick={() => onSelectRecipe(item.recipe)}
                      className="cursor-pointer group flex items-start gap-3"
                    >
                      <ImageWithFallback
                        src={item.recipe.imageUrl}
                        alt={item.recipe.title}
                        fallbackTitle={item.recipe.title}
                        fallbackCuisine={item.recipe.cuisine}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-cream-200"
                      />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-extrabold text-forest-900 group-hover:text-terracotta-600 line-clamp-1 leading-snug">
                          {item.recipe.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {item.recipe.prepTimeMinutes + item.recipe.cookTimeMinutes}m
                          </span>
                          <span>•</span>
                          <span className="font-bold text-terracotta-600">{item.recipe.proteinGrams}g Protein</span>
                        </div>
                        <p className="text-[10px] text-stone-400 line-clamp-1">{item.recipe.cuisine} Cuisine</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center">
                      <button
                        onClick={() => onAddMeal(selectedDay, cat)}
                        className="text-xs font-bold text-stone-500 hover:text-forest-900 flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Plus className="w-3.5 h-3.5 text-forest-600" />
                        <span>Add Dish</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Nutrition Snapshot */}
        <div className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-forest-900">Nutrition Snapshot</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                IFCT 2017 Verified
              </span>
            </div>

            {/* Protein Progress */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-bold text-stone-600">Daily Average Protein:</span>
                <span className="font-black text-terracotta-600 text-sm">
                  {weeklyAnalytics.plannedDayAverage.protein}g / {household?.nutritionGoals?.dailyProteinGrams || 65}g
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-cream-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-terracotta-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, weeklyAnalytics.avgDailyProteinProgressPercent || 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>Progress: {weeklyAnalytics.avgDailyProteinProgressPercent || 0}%</span>
                <span>Goal: {household?.nutritionGoals?.dailyProteinGrams || 65}g/day</span>
              </div>
            </div>

            {/* Macro Stats Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-center">
                <span className="text-[10px] text-stone-500 block">Planned Calories</span>
                <span className="font-extrabold text-forest-900">{weeklyAnalytics.plannedDayAverage.calories} kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-center">
                <span className="text-[10px] text-stone-500 block">Dietary Fibre</span>
                <span className="font-extrabold text-emerald-700">{weeklyAnalytics.plannedDayAverage.fiber}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-center">
                <span className="text-[10px] text-stone-500 block">Carbohydrates</span>
                <span className="font-extrabold text-forest-900">{weeklyAnalytics.plannedDayAverage.carbs}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200 text-center">
                <span className="text-[10px] text-stone-500 block">Total Fat</span>
                <span className="font-extrabold text-forest-900">{weeklyAnalytics.plannedDayAverage.fat}g</span>
              </div>
            </div>
          </div>

          <button
            onClick={onGoToPlanner}
            className="w-full py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-stone-700 font-bold text-xs transition-colors text-center"
          >
            View Detailed Nutrition Analytics →
          </button>
        </div>

      </div>

      {/* 3. Secondary 2-Column Grid: 7-Day Plan Progress + Grocery & Smart Basket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weekly Meal Plan Overview */}
        <div className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-forest-700" />
              <h3 className="text-sm font-extrabold text-forest-900">Current Weekly Meal Plan</h3>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {plannedCount} of {totalSlots} Slots Scheduled
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-forest-600 transition-all duration-500"
                style={{ width: `${planProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Mini 7-Day Day Strips */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {DAYS.map((d) => {
              const dayMealsCount = mealPlanItems.filter((m) => m.dayOfWeek === d.id).length;
              const isToday = d.id === 'monday';
              return (
                <div
                  key={d.id}
                  onClick={onGoToPlanner}
                  className={`p-2 rounded-xl border cursor-pointer transition-colors ${isToday
                    ? 'bg-forest-700 text-white border-forest-800'
                    : dayMealsCount > 0
                      ? 'bg-cream-100 text-forest-900 border-cream-200 hover:bg-cream-200'
                      : 'bg-cream-50 text-stone-400 border-cream-100'
                    }`}
                >
                  <span className="font-extrabold block text-[11px]">{d.short}</span>
                  <span className={`text-[10px] ${isToday ? 'text-cream-200' : 'text-stone-500'}`}>
                    {dayMealsCount} meals
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-stone-500">
              {plannedCount >= 10 ? '✓ High diversity target achieved' : 'Tip: Schedule at least 10 unique recipes'}
            </span>
            <button
              onClick={onGoToPlanner}
              className="text-forest-700 font-bold hover:underline"
            >
              Open 7-Day Planner →
            </button>
          </div>
        </div>

        {/* Smart Basket & Retailer Status */}
        <div className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-terracotta-600" />
              <h3 className="text-sm font-extrabold text-forest-900">Grocery Requirements & Basket</h3>
            </div>
            <span className="text-[10px] font-black uppercase bg-cream-200 text-stone-600 px-2 py-0.5 rounded border border-cream-300">
              SAMPLE DATA
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
              <span className="text-[10px] text-stone-500 block">Total Ingredients</span>
              <span className="text-lg font-black text-forest-900">{requirements.length}</span>
              <span className="text-[10px] text-stone-400 block">from recipes</span>
            </div>

            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200">
              <span className="text-[10px] text-stone-500 block">In Purchase Basket</span>
              <span className="text-lg font-black text-forest-900">{selectedCartItems.length}</span>
              <span className="text-[10px] text-stone-400 block">packs selected</span>
            </div>

            <div className="p-3 rounded-2xl bg-forest-50 border border-forest-200">
              <span className="text-[10px] text-forest-700 block font-semibold">{activeRetailer?.retailer.name || 'Blinkit'} Total</span>
              <span className="text-lg font-black text-forest-900">
                {formatInr(activeRetailer?.estimatedTotalInr || 0)}
              </span>
              <span className="text-[10px] text-emerald-700 block font-bold">100% Consistent</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500">
            <strong>Recipe Separation Guarantee:</strong> Deselecting an item from your purchase basket leaves recipe requirements 100% intact.
          </p>

          <div className="pt-1 flex justify-between items-center text-xs">
            <button
              onClick={onGoToPantry}
              className="text-stone-600 font-semibold hover:text-forest-900 flex items-center gap-1"
            >
              <Package className="w-3.5 h-3.5 text-amber-600" />
              <span>Check Pantry Stock</span>
            </button>
            <button
              onClick={onGoToBasket}
              className="px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold transition-colors"
            >
              Review Basket & Checkout →
            </button>
          </div>
        </div>

      </div>

      {/* 4. Recent Simulated Orders Section (Persisted Orders) */}
      <div className="bg-surface rounded-3xl p-6 border border-cream-300 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-forest-900">Recent Simulated Orders</h3>
          </div>
          <span className="text-[10px] font-bold text-stone-400">
            {orders.length} Demo Order{orders.length === 1 ? '' : 's'} Recorded
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-semibold text-stone-600">No simulated orders placed yet.</p>
            <p className="text-[11px]">
              Generate a meal plan, review your Smart Basket, and complete the simulated checkout to test the demo order flow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {orders.map((ord: any) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-forest-900">{ord.orderNumber || ord.id}</span>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    {ord.status || 'DEMO ORDER CONFIRMED'}
                  </span>
                </div>

                <div className="space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span>Retailer:</span>
                    <strong className="text-forest-900">{ord.retailerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <strong className="text-forest-900">{formatInr(ord.totalAmountInr)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Items Count:</span>
                    <span>{ord.itemsCount || ord.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 pt-1">
                    <span>Placed At:</span>
                    <span>{new Date(ord.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
