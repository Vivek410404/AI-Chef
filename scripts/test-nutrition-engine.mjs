import 'dotenv/config';
import {
  calculateIngredientNutrition,
  calculateRecipeNutrition,
  scaleNutrition,
  calculateDailyNutrition,
  calculateWeeklyNutritionAnalytics,
  detectDominantProteinSource,
  INGREDIENT_NUTRITION_DATABASE,
  getIngredientNutritionProfile
} from '../packages/grocery-engine/dist/index.js';
import {
  SEED_RECIPES,
  SEED_DEMO_HOUSEHOLD
} from '../packages/database/dist/index.js';
import { DeterministicProvider } from '../services/api/dist/ai/deterministic.provider.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`  ✅ PASS: ${message} (Actual: ${actual}, Expected: ${expected})`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message} (Actual: ${actual}, Expected: ${expected}, Diff: ${diff} > ${tolerance})`);
    failed++;
  }
}

console.log('\n🧪 =========================================================================');
console.log('🧪 RASOIIQ — NUTRITION ENGINE QUALITY AUDIT & MEAL DIVERSITY TEST SUITE');
console.log('🧪 =========================================================================\n');

// ----------------------------------------------------------------------
// Category 1: Ingredient Nutrition Calculations from IFCT 2017 & USDA
// ----------------------------------------------------------------------
console.log('--- Category 1: Ingredient Nutrition Calculations ---');
const paneerNutrition = calculateIngredientNutrition('ing-paneer', 200, 'g');
assert(paneerNutrition.ingredientId === 'ing-paneer', 'Maps correct ingredient ID');
assert(paneerNutrition.normalizedGrams === 200, 'Normalizes 200g weight');
assert(paneerNutrition.source === 'IFCT_2017', 'Identifies data source as IFCT_2017');
assert(paneerNutrition.isEstimate === false, 'Verified exact match in nutritional dataset');
// 200g of paneer at 18.3g protein/100g = 36.6g protein
assertClose(paneerNutrition.nutrients.protein, 36.6, 0.2, 'Calculates 200g paneer protein (~36.6g)');
// 200g of paneer at 265 kcal/100g = 530 kcal
assertClose(paneerNutrition.nutrients.calories, 530, 2, 'Calculates 200g paneer calories (530 kcal)');

const milkNutrition = calculateIngredientNutrition('ing-milk', 500, 'ml');
assert(milkNutrition.normalizedGrams === 500, 'Normalizes 500ml liquid volume');
// 500ml milk at 3.2g protein/100ml = 16g protein
assertClose(milkNutrition.nutrients.protein, 16.0, 0.2, 'Calculates 500ml milk protein (16.0g)');

// ----------------------------------------------------------------------
// Category 2: Recipe Nutrition Breakdown (All 7 Nutrients) & Rounding Audit
// ----------------------------------------------------------------------
console.log('\n--- Category 2: Nutrition Rounding Audit & Numerical Precision ---');
const pbmRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-paneer-butter-masala');
assert(Boolean(pbmRecipe), 'Found Paneer Butter Masala seed recipe');

const pbmBreakdown = calculateRecipeNutrition(pbmRecipe);
const perServing = pbmBreakdown.perServing;

// Verify all 7 required nutrients are present per serving
assert(typeof perServing.calories === 'number' && perServing.calories > 0, 'Displays Calories (kcal) per serving');
assert(typeof perServing.protein === 'number' && perServing.protein > 0, 'Displays Protein (g) per serving');
assert(typeof perServing.carbs === 'number' && perServing.carbs > 0, 'Displays Carbohydrates (g) per serving');
assert(typeof perServing.fat === 'number' && perServing.fat > 0, 'Displays Total Fat (g) per serving');
assert(typeof perServing.fiber === 'number' && perServing.fiber >= 0, 'Displays Dietary Fibre (g) per serving');
assert(typeof perServing.sugar === 'number' && perServing.sugar >= 0, 'Displays Sugar (g) per serving');
assert(typeof perServing.sodium === 'number' && perServing.sodium > 0, 'Displays Sodium (mg) per serving');

// AUDIT: Investigate the 2 kcal discrepancy between ingredient sum and per-serving total
// Internal raw values maintain full floating point precision:
const rawTotalCal = pbmBreakdown.rawTotal.calories;
const rawPerServingCal = pbmBreakdown.rawPerServing.calories;
const defServings = pbmRecipe.defaultServings; // 4

// In unrounded internal precision: rawPerServing * defServings MUST equal rawTotal with 0 discrepancy:
assertClose(
  rawTotalCal,
  rawPerServingCal * defServings,
  0.0001,
  'Internal unrounded precision: rawTotal equals rawPerServing * defaultServings exactly'
);

// Theoretical maximum rounding error for integer presentation rounding over N servings is ceil(N / 2):
// For N = 4 servings, the documented tolerance is ceil(4 / 2) = 2 kcal:
const DOCUMENTED_CALORIE_TOLERANCE = Math.ceil(defServings / 2); // 2 kcal
const presentationDiscrepancy = Math.abs(pbmBreakdown.total.calories - (perServing.calories * defServings));

console.log(`    ℹ️ Rounding Audit Trace (PBM):`);
console.log(`       - Raw internal ingredient sum: ${rawTotalCal.toFixed(2)} kcal`);
console.log(`       - Raw internal per serving: ${rawPerServingCal.toFixed(2)} kcal`);
console.log(`       - Presentation rounded total: ${pbmBreakdown.total.calories} kcal`);
console.log(`       - Presentation rounded per-serving: ${perServing.calories} kcal`);
console.log(`       - Per-serving * 4: ${perServing.calories * defServings} kcal`);
console.log(`       - Discrepancy: ${presentationDiscrepancy} kcal (Documented bound: <= ${DOCUMENTED_CALORIE_TOLERANCE} kcal)`);

assert(
  presentationDiscrepancy <= DOCUMENTED_CALORIE_TOLERANCE,
  `Presentation rounding difference (${presentationDiscrepancy} kcal) is strictly within mathematical tolerance (<= ${DOCUMENTED_CALORIE_TOLERANCE} kcal)`
);

assertClose(
  pbmBreakdown.total.protein,
  perServing.protein * defServings,
  0.5,
  'Total recipe protein equals perServing * defaultServings within decimal tolerance'
);

// ----------------------------------------------------------------------
// Category 3: Serving-Size Scaling & Invariance
// ----------------------------------------------------------------------
console.log('\n--- Category 3: Serving-Size Scaling ---');
const scaled2Svg = calculateRecipeNutrition(pbmRecipe, 2);
const scaled6Svg = calculateRecipeNutrition(pbmRecipe, 6);

assert(scaled2Svg.servings === 2, 'Scaled to 2 servings');
assert(scaled6Svg.servings === 6, 'Scaled to 6 servings');

// Per-serving values MUST remain constant across serving scale changes
assert(scaled2Svg.perServing.protein === pbmBreakdown.perServing.protein, 'Per-serving protein is invariant to serving count');
assert(scaled6Svg.perServing.calories === pbmBreakdown.perServing.calories, 'Per-serving calories is invariant to serving count');

// Total macros must scale proportionately (2 vs 6 = 1:3 ratio)
assertClose(
  scaled2Svg.total.protein,
  scaled6Svg.total.protein * (2 / 6),
  0.3,
  'Scaling 2 vs 6 servings maintains exact 1:3 ratio'
);

// ----------------------------------------------------------------------
// Category 4: Daily Nutrition Aggregation & Meal Breakdown
// ----------------------------------------------------------------------
console.log('\n--- Category 4: Daily Nutrition Aggregation & Meal Breakdown ---');
const choleRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-amritsari-chole');
const theplaRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-methi-thepla');
const dalRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-dal-tadka');

const mockDailyItems = [
  {
    id: 'item-1',
    mealPlanId: 'plan-1',
    dayOfWeek: 'monday',
    mealCategory: 'breakfast',
    recipeId: theplaRecipe.id,
    recipe: theplaRecipe,
    servings: 1
  },
  {
    id: 'item-2',
    mealPlanId: 'plan-1',
    dayOfWeek: 'monday',
    mealCategory: 'lunch',
    recipeId: choleRecipe.id,
    recipe: choleRecipe,
    servings: 1
  },
  {
    id: 'item-3',
    mealPlanId: 'plan-1',
    dayOfWeek: 'monday',
    mealCategory: 'dinner',
    recipeId: dalRecipe.id,
    recipe: dalRecipe,
    servings: 1
  }
];

const dailySummary = calculateDailyNutrition(mockDailyItems, 'monday', 65);
assert(dailySummary.dayOfWeek === 'monday', 'Calculates summary for Monday');
assert(dailySummary.mealCount === 3, 'Counts 3 planned meals');

// Verify daily total equals sum of meals
const sumMealProtein =
  dailySummary.byMeal.breakfast.protein +
  dailySummary.byMeal.lunch.protein +
  dailySummary.byMeal.dinner.protein;
assertClose(dailySummary.total.protein, sumMealProtein, 0.2, 'Daily total protein equals sum of breakfast, lunch, and dinner');

const sumMealCalories =
  dailySummary.byMeal.breakfast.calories +
  dailySummary.byMeal.lunch.calories +
  dailySummary.byMeal.dinner.calories;
assertClose(dailySummary.total.calories, sumMealCalories, 2, 'Daily total calories equals sum of breakfast, lunch, and dinner');

// ----------------------------------------------------------------------
// Category 5: 7-Day Protein Diversity & Source Rotation
// ----------------------------------------------------------------------
console.log('\n--- Category 5: 7-Day Protein Diversity & Source Rotation ---');
const rajmaRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-rajma-chawal');
const palakPaneerRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-palak-paneer');
const eggCurryRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-egg-curry');
const gujDalRecipe = SEED_RECIPES.find((r) => r.id === 'recipe-gujarati-khatti-meethi-dal');

// Verify dominant protein source classification across catalog
assert(detectDominantProteinSource(pbmRecipe) === 'paneer', 'Identifies PBM as paneer source');
assert(detectDominantProteinSource(choleRecipe) === 'chickpeas', 'Identifies Chole as chickpeas source');
assert(detectDominantProteinSource(rajmaRecipe) === 'rajma', 'Identifies Rajma as rajma source');
assert(detectDominantProteinSource(dalRecipe) === 'dal', 'Identifies Dal Tadka as dal source');
assert(detectDominantProteinSource(eggCurryRecipe) === 'eggs', 'Identifies Egg Curry as eggs source');

// Construct a realistic diverse 7-day meal plan rotating protein sources
const diverseWeeklySchedule = [
  // Monday: Breakfast Thepla, Lunch Paneer Butter Masala (paneer), Dinner Dal Tadka (dal)
  { day: 'monday', slot: 'breakfast', r: theplaRecipe },
  { day: 'monday', slot: 'lunch', r: pbmRecipe },
  { day: 'monday', slot: 'dinner', r: dalRecipe },

  // Tuesday: Breakfast Thepla, Lunch Amritsari Chole (chickpeas), Dinner Palak Paneer (paneer)
  { day: 'tuesday', slot: 'breakfast', r: theplaRecipe },
  { day: 'tuesday', slot: 'lunch', r: choleRecipe },
  { day: 'tuesday', slot: 'dinner', r: palakPaneerRecipe },

  // Wednesday: Breakfast Thepla, Lunch Kashmiri Rajma (rajma), Dinner Gujarati Dal (dal)
  { day: 'wednesday', slot: 'breakfast', r: theplaRecipe },
  { day: 'wednesday', slot: 'lunch', r: rajmaRecipe },
  { day: 'wednesday', slot: 'dinner', r: gujDalRecipe },

  // Thursday: Breakfast Thepla, Lunch Egg Curry (eggs), Dinner Dal Tadka (dal)
  { day: 'thursday', slot: 'breakfast', r: theplaRecipe },
  { day: 'thursday', slot: 'lunch', r: eggCurryRecipe },
  { day: 'thursday', slot: 'dinner', r: dalRecipe },

  // Friday: Breakfast Thepla, Lunch Amritsari Chole (chickpeas), Dinner Paneer Butter Masala (paneer)
  { day: 'friday', slot: 'breakfast', r: theplaRecipe },
  { day: 'friday', slot: 'lunch', r: choleRecipe },
  { day: 'friday', slot: 'dinner', r: pbmRecipe },

  // Saturday: Breakfast Thepla, Lunch Rajma Chawal (rajma), Dinner Gujarati Dal (dal)
  { day: 'saturday', slot: 'breakfast', r: theplaRecipe },
  { day: 'saturday', slot: 'lunch', r: rajmaRecipe },
  { day: 'saturday', slot: 'dinner', r: gujDalRecipe },

  // Sunday: Breakfast Thepla, Lunch Palak Paneer (paneer), Dinner Dal Tadka (dal)
  { day: 'sunday', slot: 'breakfast', r: theplaRecipe },
  { day: 'sunday', slot: 'lunch', r: palakPaneerRecipe },
  { day: 'sunday', slot: 'dinner', r: dalRecipe }
];

const mockDiverseWeeklyItems = diverseWeeklySchedule.map((item, idx) => ({
  id: `div-m-${idx}`,
  mealPlanId: 'plan-div',
  dayOfWeek: item.day,
  mealCategory: item.slot,
  recipeId: item.r.id,
  recipe: item.r,
  servings: 1
}));

const diverseWeeklyAnalytics = calculateWeeklyNutritionAnalytics(mockDiverseWeeklyItems, { dailyProteinGrams: 65 });

assert(
  diverseWeeklyAnalytics.proteinSourcesDetected.length >= 4,
  `Detects at least 4 distinct protein sources across the week (${diverseWeeklyAnalytics.proteinSourcesDetected.join(', ')})`
);
assert(
  diverseWeeklyAnalytics.proteinSourcesDetected.includes('paneer') &&
  diverseWeeklyAnalytics.proteinSourcesDetected.includes('dal') &&
  diverseWeeklyAnalytics.proteinSourcesDetected.includes('chickpeas') &&
  diverseWeeklyAnalytics.proteinSourcesDetected.includes('rajma'),
  'Rotates across Paneer, Dal, Chickpeas, and Rajma'
);
assert(
  diverseWeeklyAnalytics.proteinDiversityScore === 100,
  `Awards 100% protein diversity score for rich rotation (${diverseWeeklyAnalytics.proteinDiversityScore}%)`
);
assert(
  diverseWeeklyAnalytics.highProteinMealsCount > 0,
  `Identifies ${diverseWeeklyAnalytics.highProteinMealsCount} high-protein meals (>= 15g protein)`
);

// ----------------------------------------------------------------------
// Category 6: Weekly Analytics Dual Metrics (Calendar-Day vs Planned-Day)
// ----------------------------------------------------------------------
console.log('\n--- Category 6: Calendar-Day vs Planned-Day Dual Metrics ---');
// Scenario: A user plans meals on only 3 days (Mon, Wed, Fri); Tue, Thu, Sat, Sun are empty
const partialPlanItems = [
  { id: 'p-1', mealPlanId: 'plan-part', dayOfWeek: 'monday', mealCategory: 'lunch', recipeId: pbmRecipe.id, recipe: pbmRecipe, servings: 1 },
  { id: 'p-2', mealPlanId: 'plan-part', dayOfWeek: 'monday', mealCategory: 'dinner', recipeId: dalRecipe.id, recipe: dalRecipe, servings: 1 },
  { id: 'p-3', mealPlanId: 'plan-part', dayOfWeek: 'wednesday', mealCategory: 'lunch', recipeId: rajmaRecipe.id, recipe: rajmaRecipe, servings: 1 },
  { id: 'p-4', mealPlanId: 'plan-part', dayOfWeek: 'wednesday', mealCategory: 'dinner', recipeId: dalRecipe.id, recipe: dalRecipe, servings: 1 },
  { id: 'p-5', mealPlanId: 'plan-part', dayOfWeek: 'friday', mealCategory: 'lunch', recipeId: choleRecipe.id, recipe: choleRecipe, servings: 1 },
  { id: 'p-6', mealPlanId: 'plan-part', dayOfWeek: 'friday', mealCategory: 'dinner', recipeId: dalRecipe.id, recipe: dalRecipe, servings: 1 }
];

const partialWeeklyAnalytics = calculateWeeklyNutritionAnalytics(partialPlanItems);

assert(partialWeeklyAnalytics.plannedDaysCount === 3, 'Accurately counts 3 planned days');
assert(partialWeeklyAnalytics.emptyDaysCount === 4, 'Accurately counts 4 empty unscheduled days');

// Planned-day average MUST divide by 3 (planned days count):
const expectedPlannedDayCalories = Math.round(partialWeeklyAnalytics.weeklyTotal.calories / 3);
assert(
  partialWeeklyAnalytics.plannedDayAverage.calories === expectedPlannedDayCalories,
  `Planned-day average calories (${partialWeeklyAnalytics.plannedDayAverage.calories} kcal) divides only by active planned days (3)`
);

// Calendar-day average MUST divide by 7 (full calendar week):
const expectedCalendarDayCalories = Math.round(partialWeeklyAnalytics.weeklyTotal.calories / 7);
assert(
  partialWeeklyAnalytics.calendarDayAverage.calories === expectedCalendarDayCalories,
  `Calendar-day average calories (${partialWeeklyAnalytics.calendarDayAverage.calories} kcal) divides by 7 calendar days`
);

// Empty days must NOT be counted as zero consumption for planned day average:
assert(
  partialWeeklyAnalytics.plannedDayAverage.calories > partialWeeklyAnalytics.calendarDayAverage.calories,
  `Planned day average (${partialWeeklyAnalytics.plannedDayAverage.calories} kcal) does NOT count empty days as zero consumption, exceeding 7-day calendar baseline (${partialWeeklyAnalytics.calendarDayAverage.calories} kcal)`
);

// Backward compatibility: weeklyDailyAverage maps to calendarDayAverage
assert(
  partialWeeklyAnalytics.weeklyDailyAverage.calories === partialWeeklyAnalytics.calendarDayAverage.calories,
  'weeklyDailyAverage remains backwards-compatible alias to calendarDayAverage'
);

// ----------------------------------------------------------------------
// Category 7: Protein Goal Tracking & Household Member Independence
// ----------------------------------------------------------------------
console.log('\n--- Category 7: Household Member Nutrition Personalization ---');
const goal60Analytics = calculateDailyNutrition(mockDailyItems, 'monday', 60);
const goal90Analytics = calculateDailyNutrition(mockDailyItems, 'monday', 90);

assert(
  goal60Analytics.proteinProgressPercent > goal90Analytics.proteinProgressPercent,
  'Dynamic goal calibration adjusts progress percentage without prescriptive restrictions'
);

// Member-level independent targets
assert(
  Boolean(SEED_DEMO_HOUSEHOLD.nutritionGoals?.dailyProteinGrams),
  'Demo household has optional nutrition goals configured'
);

const pooja = SEED_DEMO_HOUSEHOLD.members.find((m) => m.name === 'Pooja');
const rohan = SEED_DEMO_HOUSEHOLD.members.find((m) => m.name.includes('Rohan'));
assert(
  pooja?.nutritionGoals?.dailyProteinGrams !== rohan?.nutritionGoals?.dailyProteinGrams,
  `Household members have distinct, independent nutrition goals (Pooja: ${pooja?.nutritionGoals?.dailyProteinGrams}g, Rohan: ${rohan?.nutritionGoals?.dailyProteinGrams}g)`
);

// Compute individual member progress for the same daily intake
const poojaProgress = Math.round((dailySummary.total.protein / (pooja?.nutritionGoals?.dailyProteinGrams || 65)) * 100);
const rohanProgress = Math.round((dailySummary.total.protein / (rohan?.nutritionGoals?.dailyProteinGrams || 65)) * 100);
assert(
  poojaProgress !== rohanProgress,
  `Individual progress percentages are computed independently for each member (Pooja: ${poojaProgress}%, Rohan: ${rohanProgress}%)`
);

// ----------------------------------------------------------------------
// Category 8: Missing / Unlisted Nutritional Data Handling & Attribution
// ----------------------------------------------------------------------
console.log('\n--- Category 8: Transparent Data Sources & Estimation Handling ---');
const unlistedIngNutrition = calculateIngredientNutrition(
  'ing-rare-culinary-herb',
  50,
  'g',
  'Rare Himalayan Herb',
  'Produce'
);

assert(unlistedIngNutrition.isEstimate === true, 'Flags unlisted ingredient as an estimate');
assert(unlistedIngNutrition.source === 'ESTIMATE', 'Records data source as ESTIMATE');
assert(
  unlistedIngNutrition.sourceAttribution.includes('Estimated Culinary Benchmark'),
  'Records transparent source attribution without inventing fake precision'
);

// Create recipe with one unlisted item and verify completeness %
const testRecipeWithUnlisted = {
  id: 'recipe-test-experimental',
  title: 'Experimental Dish',
  defaultServings: 2,
  ingredients: [
    { ingredientId: 'ing-paneer', quantity: 200, unit: 'g' },
    { ingredientId: 'ing-rare-culinary-herb', quantity: 50, unit: 'g' }
  ]
};

const unlistedBreakdown = calculateRecipeNutrition(testRecipeWithUnlisted);
assert(
  unlistedBreakdown.dataCompletenessPercent === 50,
  'Computes exact data completeness percentage (1 exact, 1 estimate = 50%)'
);
assert(
  unlistedBreakdown.sources.some((s) => s.source === 'ESTIMATE'),
  'Attribution list transparently includes ESTIMATE with explanation'
);

// ----------------------------------------------------------------------
// Category 9: Recommendation Engine Diversity & Repetition Penalties
// ----------------------------------------------------------------------
console.log('\n--- Category 9: Recommendation Engine 7-Day Diversity & Repetition Controls ---');
const deterministicProvider = new DeterministicProvider();

const aiPlan = await deterministicProvider.generateMealPlan(
  {
    daysCount: 7,
    servingsPerMeal: 4,
    proteinPreference: 'high-protein',
    seed: 42
  },
  SEED_RECIPES
);

assert(aiPlan.meals.length === 21, 'Generates full 21 meals for 7 days');

// Check recipe variety: out of 21 slots, at least 15 unique dishes should be selected
const uniqueRecipeIds = new Set(aiPlan.meals.map((m) => m.recipeId));
assert(
  uniqueRecipeIds.size >= 15,
  `Ensures high meal variety: ${uniqueRecipeIds.size} unique recipes out of 21 slots`
);

// Verify protein source rotation across main meals:
const mainMeals = aiPlan.meals.filter((m) => m.mealCategory === 'lunch' || m.mealCategory === 'dinner');
const mainProteinSources = mainMeals.map((m) => {
  const r = SEED_RECIPES.find((rec) => rec.id === m.recipeId);
  return r ? (r.proteinSource || detectDominantProteinSource(r)) : 'mixed-veg';
});

// Check that consecutive main meals DO NOT repeat the same protein source:
let consecutiveProteinRepeats = 0;
for (let i = 1; i < mainProteinSources.length; i++) {
  if (
    mainProteinSources[i] !== 'mixed-veg' &&
    mainProteinSources[i] === mainProteinSources[i - 1]
  ) {
    consecutiveProteinRepeats++;
  }
}
assert(
  consecutiveProteinRepeats === 0,
  `Prevents consecutive protein source repeats across lunch & dinner (0 consecutive collisions)`
);

// Verify rotation across multiple distinct protein sources:
const uniqueProteinsInPlan = new Set(mainProteinSources.filter((p) => p !== 'mixed-veg'));
assert(
  uniqueProteinsInPlan.size >= 3,
  `Rotates among at least 3 distinct verified protein sources in high-protein plan (${Array.from(uniqueProteinsInPlan).join(', ')})`
);

// Verify that Chole does NOT appear on all seven days:
const choleOccurrences = aiPlan.meals.filter((m) => m.recipeId === 'recipe-amritsari-chole').length;
assert(
  choleOccurrences <= 2,
  `Chole appears only ${choleOccurrences} time(s) across 7 days, eliminating mono-protein schedule`
);

// Verify Explicit User Repetition Override:
// When the user explicitly requests repetition, the engine should honor it without artificial blocking
const explicitPlan = await deterministicProvider.generateMealPlan(
  {
    daysCount: 7,
    prompt: 'I love paneer, please give me paneer every day',
    seed: 123
  },
  SEED_RECIPES
);

const paneerCount = explicitPlan.meals.filter((m) => m.recipeTitle.toLowerCase().includes('paneer')).length;
assert(
  paneerCount >= 2,
  `Honors user explicit repetition request (generates ${paneerCount} paneer meals when asked)`
);

// ----------------------------------------------------------------------
// Category 10: Strict Dietary Restrictions & Safety Independence
// ----------------------------------------------------------------------
console.log('\n--- Category 10: Strict Dietary Restrictions & Safety Independence ---');
const jainPlan = await deterministicProvider.generateMealPlan(
  {
    daysCount: 7,
    dietaryRestrictions: ['Jain Friendly'],
    proteinPreference: 'high-protein',
    seed: 99
  },
  SEED_RECIPES
);

const nonJainInJainPlan = jainPlan.meals.filter((m) => {
  const r = SEED_RECIPES.find((rec) => rec.id === m.recipeId);
  return r && !r.isJainFriendly;
});

assert(
  nonJainInJainPlan.length === 0,
  `Strict Jain safety: 0 non-Jain recipes selected (${jainPlan.meals.length} meals fully compliant)`
);

const vegPlan = await deterministicProvider.generateMealPlan(
  {
    daysCount: 7,
    dietaryRestrictions: ['Pure Vegetarian'],
    proteinPreference: 'high-protein',
    seed: 77
  },
  SEED_RECIPES
);

const nonVegInVegPlan = vegPlan.meals.filter((m) => {
  const r = SEED_RECIPES.find((rec) => rec.id === m.recipeId);
  return r && (r.dietaryTags.includes('Non-Vegetarian') || r.dietaryTags.includes('Eggetarian'));
});

assert(
  nonVegInVegPlan.length === 0,
  `Strict Vegetarian safety: 0 non-veg/egg recipes selected despite protein prioritization`
);

// Summary
console.log('\n=========================================================================');
console.log(`Test Results: ${passed} Passed, ${failed} Failed across 10 Categories`);
console.log('=========================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
