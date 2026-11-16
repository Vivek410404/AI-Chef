import {
  DayOfWeek,
  MealCategory,
  MealPlanItem,
  Recipe,
  StandardUnit,
  MacroNutrients,
  RecipeNutritionBreakdown,
  RecipeIngredientNutrition,
  DailyNutritionSummary,
  WeeklyNutritionAnalytics,
  HouseholdNutritionGoals,
  NutritionDataSource,
  ProteinSource
} from '@rasoi/shared-types';
import { getIngredientNutritionProfile } from './nutrition-data';
import { UNIT_CONVERSIONS } from './index';

/**
 * Approximate gram weights for non-gram culinary units in Indian cooking
 */
export const CULINARY_UNIT_GRAM_FACTORS: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1, // approximate 1ml = 1g for water-based items, oils scaled separately if needed
  l: 1000,
  tbsp: 15,
  tsp: 5,
  cup: 200, // typical Indian tea cup dry / liquid weight
  pinch: 1,
  bunch: 25, // e.g. coriander ~25g, curry leaves ~10g
  piece: 50 // default piece weight (e.g. egg ~50g, lemon ~40g, potato ~80g)
};

/**
 * Custom piece weights for specific known ingredients
 */
const SPECIFIC_PIECE_WEIGHTS: Record<string, number> = {
  'ing-eggs': 50,
  'ing-lemon': 40,
  'ing-potato': 80,
  'ing-onion': 90,
  'ing-tomato': 70,
  'ing-coriander': 25,
  'ing-curry-leaves': 10
};

/**
 * Calculates accurate grams for an ingredient quantity
 */
export function convertToGrams(ingredientId: string, quantity: number, unit: StandardUnit): number {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit === 'piece' && SPECIFIC_PIECE_WEIGHTS[ingredientId]) {
    return quantity * SPECIFIC_PIECE_WEIGHTS[ingredientId];
  }
  if (lowerUnit === 'bunch' && SPECIFIC_PIECE_WEIGHTS[ingredientId]) {
    return quantity * SPECIFIC_PIECE_WEIGHTS[ingredientId];
  }
  const factor = CULINARY_UNIT_GRAM_FACTORS[lowerUnit] ?? 1;
  return quantity * factor;
}

/**
 * Detects the dominant protein source in an Indian recipe from ingredients and metadata
 */
export function detectDominantProteinSource(recipe: {
  title?: string;
  proteinSource?: ProteinSource;
  ingredients?: Array<{ ingredientId?: string; ingredient?: { name?: string } }>;
}): ProteinSource {
  if (recipe.proteinSource) return recipe.proteinSource;

  const text = (
    (recipe.title || '') +
    ' ' +
    (recipe.ingredients?.map((i) => `${i.ingredientId || ''} ${i.ingredient?.name || ''}`).join(' ') || '')
  ).toLowerCase();

  if (text.includes('paneer') || text.includes('cottage cheese') || text.includes('ing-paneer')) return 'paneer';
  if (text.includes('chole') || text.includes('chickpea') || text.includes('kabuli chana') || text.includes('ing-kabuli-chana')) return 'chickpeas';
  if (text.includes('rajma') || text.includes('kidney bean') || text.includes('ing-rajma')) return 'rajma';
  if (
    text.includes('toor dal') ||
    text.includes('moong dal') ||
    text.includes('urad dal') ||
    text.includes('masoor') ||
    text.includes('chana dal') ||
    text.includes('dal tadka') ||
    text.includes('khatti meethi dal') ||
    text.includes('sambar') ||
    text.includes('khichdi') ||
    text.includes('ing-toor-dal') ||
    text.includes('ing-moong-dal') ||
    text.includes('ing-urad-dal') ||
    text.includes('ing-chana-dal')
  ) {
    return 'dal';
  }
  if (/\b(eggs?|ande|anda curry|egg curry)\b/i.test(text) || text.includes('ing-eggs')) return 'eggs';
  if (text.includes('chicken') || text.includes('murgh') || text.includes('ing-chicken')) return 'chicken';
  if (text.includes('fish') || text.includes('machhi') || text.includes('rohu') || text.includes('catla') || text.includes('ing-fish')) return 'fish';
  if (text.includes('soya') || text.includes('soy chunk') || text.includes('tofu')) return 'soy';
  if (text.includes('kadhi') || text.includes('dahi') || (text.includes('curd') && !text.includes('thepla'))) return 'curd';

  return 'mixed-veg';
}

/**
 * Round nutrient to 1 decimal place (or integer for sodium and calories)
 */
export function roundNutrient(val: number, isInteger = false): number {
  if (isInteger) return Math.round(val);
  return Math.round(val * 10) / 10;
}

/**
 * Calculate nutrition for a single ingredient quantity with high internal precision
 */
export function calculateIngredientNutrition(
  ingredientId: string,
  quantity: number,
  unit: StandardUnit,
  fallbackName?: string,
  fallbackCategory?: string
): RecipeIngredientNutrition {
  const { profile, isEstimate } = getIngredientNutritionProfile(ingredientId, fallbackName, fallbackCategory);
  const normalizedGrams = convertToGrams(ingredientId, quantity, unit);
  const ratio = normalizedGrams / 100;

  // Maintain unrounded floating-point precision internally to prevent compounding truncation error
  const rawNutrients: MacroNutrients = {
    calories: profile.calories * ratio,
    protein: profile.protein * ratio,
    carbs: profile.carbs * ratio,
    fat: profile.fat * ratio,
    fiber: profile.fiber * ratio,
    sugar: profile.sugar * ratio,
    sodium: profile.sodium * ratio
  };

  const nutrients: MacroNutrients = {
    calories: roundNutrient(rawNutrients.calories, true),
    protein: roundNutrient(rawNutrients.protein),
    carbs: roundNutrient(rawNutrients.carbs),
    fat: roundNutrient(rawNutrients.fat),
    fiber: roundNutrient(rawNutrients.fiber),
    sugar: roundNutrient(rawNutrients.sugar),
    sodium: roundNutrient(rawNutrients.sodium, true)
  };

  return {
    ingredientId,
    ingredientName: profile.ingredientName,
    quantity,
    unit,
    normalizedGrams: Math.round(normalizedGrams),
    nutrients,
    rawNutrients,
    source: profile.source,
    sourceAttribution: profile.sourceAttribution,
    confidence: profile.confidence,
    isEstimate
  };
}

/**
 * Deterministically calculates complete nutritional breakdown for any recipe from its ingredient quantities
 * Maintains full numerical precision internally and rounds solely for presentation boundaries.
 */
export function calculateRecipeNutrition(
  recipe: {
    id: string;
    title: string;
    defaultServings?: number;
    proteinSource?: ProteinSource;
    ingredients: Array<{
      ingredientId: string;
      quantity: number;
      unit: StandardUnit;
      ingredient?: { name?: string; category?: any };
    }>;
  },
  customServings?: number
): RecipeNutritionBreakdown {
  const defaultServings = Math.max(1, recipe.defaultServings || 4);
  const targetServings = customServings ? Math.max(1, customServings) : defaultServings;

  let rawCalories = 0;
  let rawProtein = 0;
  let rawCarbs = 0;
  let rawFat = 0;
  let rawFiber = 0;
  let rawSugar = 0;
  let rawSodium = 0;

  let exactMatches = 0;
  const sourcesMap = new Map<NutritionDataSource, string>();
  const ingredientsList: RecipeIngredientNutrition[] = [];

  for (const ing of recipe.ingredients) {
    const ingNutrition = calculateIngredientNutrition(
      ing.ingredientId,
      ing.quantity,
      ing.unit,
      ing.ingredient?.name,
      ing.ingredient?.category
    );

    const raw = ingNutrition.rawNutrients || ingNutrition.nutrients;
    rawCalories += raw.calories;
    rawProtein += raw.protein;
    rawCarbs += raw.carbs;
    rawFat += raw.fat;
    rawFiber += raw.fiber;
    rawSugar += raw.sugar;
    rawSodium += raw.sodium;

    if (!ingNutrition.isEstimate) exactMatches++;
    sourcesMap.set(ingNutrition.source, ingNutrition.sourceAttribution);
    ingredientsList.push(ingNutrition);
  }

  // Exact unrounded internal totals
  const rawTotal: MacroNutrients = {
    calories: rawCalories,
    protein: rawProtein,
    carbs: rawCarbs,
    fat: rawFat,
    fiber: rawFiber,
    sugar: rawSugar,
    sodium: rawSodium
  };

  const rawPerServing: MacroNutrients = {
    calories: rawCalories / defaultServings,
    protein: rawProtein / defaultServings,
    carbs: rawCarbs / defaultServings,
    fat: rawFat / defaultServings,
    fiber: rawFiber / defaultServings,
    sugar: rawSugar / defaultServings,
    sodium: rawSodium / defaultServings
  };

  // Recipe total rounded for presentation
  const recipeTotal: MacroNutrients = {
    calories: Math.round(rawCalories),
    protein: roundNutrient(rawProtein),
    carbs: roundNutrient(rawCarbs),
    fat: roundNutrient(rawFat),
    fiber: roundNutrient(rawFiber),
    sugar: roundNutrient(rawSugar),
    sodium: Math.round(rawSodium)
  };

  // Per-serving rounded directly from unrounded raw values to prevent double-rounding drift
  const perServing: MacroNutrients = {
    calories: Math.round(rawCalories / defaultServings),
    protein: roundNutrient(rawProtein / defaultServings),
    carbs: roundNutrient(rawCarbs / defaultServings),
    fat: roundNutrient(rawFat / defaultServings),
    fiber: roundNutrient(rawFiber / defaultServings),
    sugar: roundNutrient(rawSugar / defaultServings),
    sodium: Math.round(rawSodium / defaultServings)
  };

  const dataCompletenessPercent =
    recipe.ingredients.length > 0
      ? Math.round((exactMatches / recipe.ingredients.length) * 100)
      : 100;

  const sources = Array.from(sourcesMap.entries()).map(([source, attribution]) => ({
    source,
    attribution
  }));

  // If custom servings requested, scale the recipe totals accordingly
  let activeTotal = recipeTotal;
  let activeRawTotal = rawTotal;
  if (targetServings !== defaultServings) {
    const scale = targetServings / defaultServings;
    activeRawTotal = {
      calories: rawTotal.calories * scale,
      protein: rawTotal.protein * scale,
      carbs: rawTotal.carbs * scale,
      fat: rawTotal.fat * scale,
      fiber: rawTotal.fiber * scale,
      sugar: rawTotal.sugar * scale,
      sodium: rawTotal.sodium * scale
    };
    activeTotal = {
      calories: Math.round(activeRawTotal.calories),
      protein: roundNutrient(activeRawTotal.protein),
      carbs: roundNutrient(activeRawTotal.carbs),
      fat: roundNutrient(activeRawTotal.fat),
      fiber: roundNutrient(activeRawTotal.fiber),
      sugar: roundNutrient(activeRawTotal.sugar),
      sodium: Math.round(activeRawTotal.sodium)
    };
  }

  const dominantProteinSource = detectDominantProteinSource(recipe);

  return {
    total: activeTotal,
    perServing,
    rawTotal: activeRawTotal,
    rawPerServing,
    servings: targetServings,
    dataCompletenessPercent,
    sources,
    ingredients: ingredientsList,
    dominantProteinSource
  };
}

/**
 * Scale any nutrient set proportionately between serving counts
 */
export function scaleNutrition(
  nutrients: MacroNutrients,
  originalServings: number,
  targetServings: number
): MacroNutrients {
  if (originalServings <= 0 || targetServings <= 0) return nutrients;
  const ratio = targetServings / originalServings;
  return {
    calories: Math.round(nutrients.calories * ratio),
    protein: roundNutrient(nutrients.protein * ratio),
    carbs: roundNutrient(nutrients.carbs * ratio),
    fat: roundNutrient(nutrients.fat * ratio),
    fiber: roundNutrient(nutrients.fiber * ratio),
    sugar: roundNutrient(nutrients.sugar * ratio),
    sodium: Math.round(nutrients.sodium * ratio)
  };
}

/**
 * Empty macros helper
 */
export function getZeroMacros(): MacroNutrients {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };
}

/**
 * Add two macro sets
 */
export function addMacros(a: MacroNutrients, b: MacroNutrients): MacroNutrients {
  return {
    calories: Math.round(a.calories + b.calories),
    protein: roundNutrient(a.protein + b.protein),
    carbs: roundNutrient(a.carbs + b.carbs),
    fat: roundNutrient(a.fat + b.fat),
    fiber: roundNutrient(a.fiber + b.fiber),
    sugar: roundNutrient(a.sugar + b.sugar),
    sodium: Math.round(a.sodium + b.sodium)
  };
}

/**
 * Calculate Daily Nutrition Summary and meal-category breakdowns
 */
export function calculateDailyNutrition(
  mealPlanItems: MealPlanItem[],
  day: DayOfWeek,
  proteinGoalGrams?: number
): DailyNutritionSummary {
  const dayItems = mealPlanItems.filter((i) => i.dayOfWeek === day);

  const byMeal: Record<MealCategory, MacroNutrients> = {
    breakfast: getZeroMacros(),
    lunch: getZeroMacros(),
    dinner: getZeroMacros(),
    snack: getZeroMacros()
  };

  let dayTotal = getZeroMacros();

  for (const item of dayItems) {
    if (!item.recipe) continue;
    // Calculate per-serving nutrition for recipe
    const breakdown = calculateRecipeNutrition(item.recipe);
    // Multiply by item.servings
    const servings = item.servings || 1;
    const mealNutrients = scaleNutrition(breakdown.perServing, 1, servings);

    byMeal[item.mealCategory] = addMacros(byMeal[item.mealCategory], mealNutrients);
    dayTotal = addMacros(dayTotal, mealNutrients);
  }

  let proteinProgressPercent: number | undefined;
  if (proteinGoalGrams && proteinGoalGrams > 0) {
    proteinProgressPercent = Math.min(150, Math.round((dayTotal.protein / proteinGoalGrams) * 100));
  }

  return {
    dayOfWeek: day,
    total: dayTotal,
    byMeal,
    mealCount: dayItems.length,
    proteinProgressPercent
  };
}

const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Calculate complete Weekly Nutrition Analytics across 7 days
 * Provides both 7-day calendar averages and planned-day averages (excluding empty days)
 */
export function calculateWeeklyNutritionAnalytics(
  mealPlanItems: MealPlanItem[],
  householdGoals?: HouseholdNutritionGoals
): WeeklyNutritionAnalytics {
  const dailySummaries: Record<DayOfWeek, DailyNutritionSummary> = {} as any;

  let weeklyTotal = getZeroMacros();
  let highProteinMealsCount = 0;
  let plannedDaysCount = 0;
  const uniqueProteinSources = new Set<ProteinSource>();

  const mealTotals: Record<MealCategory, MacroNutrients> = {
    breakfast: getZeroMacros(),
    lunch: getZeroMacros(),
    dinner: getZeroMacros(),
    snack: getZeroMacros()
  };

  for (const day of ALL_DAYS) {
    const summary = calculateDailyNutrition(mealPlanItems, day, householdGoals?.dailyProteinGrams);
    dailySummaries[day] = summary;
    weeklyTotal = addMacros(weeklyTotal, summary.total);

    if (summary.mealCount > 0) {
      plannedDaysCount++;
    }

    for (const cat of ['breakfast', 'lunch', 'dinner', 'snack'] as MealCategory[]) {
      mealTotals[cat] = addMacros(mealTotals[cat], summary.byMeal[cat]);
    }
  }

  // Count high-protein meals & catalog unique protein sources across planned meals
  for (const item of mealPlanItems) {
    if (!item.recipe) continue;
    const breakdown = calculateRecipeNutrition(item.recipe);
    if (breakdown.perServing.protein >= 15) {
      highProteinMealsCount++;
    }
    const source = detectDominantProteinSource(item.recipe);
    if (source && source !== 'mixed-veg') {
      uniqueProteinSources.add(source);
    }
  }

  // Metric 1: Average nutrition per calendar day (weekly total / 7)
  const calendarDayAverage: MacroNutrients = {
    calories: Math.round(weeklyTotal.calories / 7),
    protein: roundNutrient(weeklyTotal.protein / 7),
    carbs: roundNutrient(weeklyTotal.carbs / 7),
    fat: roundNutrient(weeklyTotal.fat / 7),
    fiber: roundNutrient(weeklyTotal.fiber / 7),
    sugar: roundNutrient(weeklyTotal.sugar / 7),
    sodium: Math.round(weeklyTotal.sodium / 7)
  };

  // Metric 2: Average nutrition per planned day (weekly total / plannedDaysCount, minimum 1 to avoid /0)
  const divisor = Math.max(1, plannedDaysCount);
  const plannedDayAverage: MacroNutrients = {
    calories: Math.round(weeklyTotal.calories / divisor),
    protein: roundNutrient(weeklyTotal.protein / divisor),
    carbs: roundNutrient(weeklyTotal.carbs / divisor),
    fat: roundNutrient(weeklyTotal.fat / divisor),
    fiber: roundNutrient(weeklyTotal.fiber / divisor),
    sugar: roundNutrient(weeklyTotal.sugar / divisor),
    sodium: Math.round(weeklyTotal.sodium / divisor)
  };

  const emptyDaysCount = 7 - plannedDaysCount;

  // Protein Diversity Score: 0-100 score based on variety of protein sources
  // Having 4 or more distinct protein sources in a week is considered optimal (100%)
  const proteinSourcesDetected = Array.from(uniqueProteinSources);
  const proteinDiversityScore = Math.min(100, Math.round((proteinSourcesDetected.length / 4) * 100));

  const byMealAverage: Record<MealCategory, MacroNutrients> = {
    breakfast: {
      calories: Math.round(mealTotals.breakfast.calories / 7),
      protein: roundNutrient(mealTotals.breakfast.protein / 7),
      carbs: roundNutrient(mealTotals.breakfast.carbs / 7),
      fat: roundNutrient(mealTotals.breakfast.fat / 7),
      fiber: roundNutrient(mealTotals.breakfast.fiber / 7),
      sugar: roundNutrient(mealTotals.breakfast.sugar / 7),
      sodium: Math.round(mealTotals.breakfast.sodium / 7)
    },
    lunch: {
      calories: Math.round(mealTotals.lunch.calories / 7),
      protein: roundNutrient(mealTotals.lunch.protein / 7),
      carbs: roundNutrient(mealTotals.lunch.carbs / 7),
      fat: roundNutrient(mealTotals.lunch.fat / 7),
      fiber: roundNutrient(mealTotals.lunch.fiber / 7),
      sugar: roundNutrient(mealTotals.lunch.sugar / 7),
      sodium: Math.round(mealTotals.lunch.sodium / 7)
    },
    dinner: {
      calories: Math.round(mealTotals.dinner.calories / 7),
      protein: roundNutrient(mealTotals.dinner.protein / 7),
      carbs: roundNutrient(mealTotals.dinner.carbs / 7),
      fat: roundNutrient(mealTotals.dinner.fat / 7),
      fiber: roundNutrient(mealTotals.dinner.fiber / 7),
      sugar: roundNutrient(mealTotals.dinner.sugar / 7),
      sodium: Math.round(mealTotals.dinner.sodium / 7)
    },
    snack: {
      calories: Math.round(mealTotals.snack.calories / 7),
      protein: roundNutrient(mealTotals.snack.protein / 7),
      carbs: roundNutrient(mealTotals.snack.carbs / 7),
      fat: roundNutrient(mealTotals.snack.fat / 7),
      fiber: roundNutrient(mealTotals.snack.fiber / 7),
      sugar: roundNutrient(mealTotals.snack.sugar / 7),
      sodium: Math.round(mealTotals.snack.sodium / 7)
    }
  };

  let avgDailyProteinProgressPercent: number | undefined;
  if (householdGoals?.dailyProteinGrams && householdGoals.dailyProteinGrams > 0) {
    avgDailyProteinProgressPercent = Math.min(
      150,
      Math.round((calendarDayAverage.protein / householdGoals.dailyProteinGrams) * 100)
    );
  }

  return {
    dailySummaries,
    weeklyTotal,
    weeklyDailyAverage: calendarDayAverage,
    calendarDayAverage,
    plannedDayAverage,
    plannedDaysCount,
    emptyDaysCount,
    byMealAverage,
    highProteinMealsCount,
    proteinGoalGrams: householdGoals?.dailyProteinGrams,
    avgDailyProteinProgressPercent,
    proteinSourcesDetected,
    proteinDiversityScore
  };
}
