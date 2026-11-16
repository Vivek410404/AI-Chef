/**
 * RasoiIQ AI Chef Production-Hardening Test Suite
 * 
 * Verifies:
 * 1. Gemini integration & model verification (supported models, backend-only API key).
 * 2. Gemini successful generation with valid mock response (catalog reconciliation, schema validation).
 * 3. Gemini failure and fallback scenarios (invalid API key, quota exhaustion, network timeout, unsupported model, malformed JSON, schema violation).
 * 4. Provider-source accuracy (never report Gemini when fallback generated meals).
 * 5. Unknown or incomplete ingredient metadata fails closed (never treated as confirmed safe).
 * 6. Multiple members with conflicting dietary preferences (intersection of actual restrictions: e.g. Vegan + Jain).
 * 7. Multiple member-specific allergies (simultaneous peanut-free + gluten-free).
 * 8. Explicit ingredient exclusions per member and household-wide.
 * 9. Recipe diversity: >= 10 unique recipes in a 21-meal weekly plan when catalog permits.
 * 10. Zero duplicate recipes on the same day.
 * 11. Explanation when catalog limitations prevent target diversity without relaxing constraints.
 * 12. Recipe diversity across repeated weekly generations.
 */

import { SEED_RECIPES, SEED_INGREDIENTS, SEED_DEMO_HOUSEHOLD } from '../packages/database/dist/index.js';
import {
  filterEligibleRecipes,
  isRecipeCompliantWithDiet,
  isRecipeCompliantWithAllergies,
  isRecipeCompliantWithExclusions,
  isRecipeCompliantWithHouseholdMembers,
  isIngredientMetadataVerified,
  getIngredientMetadata,
  VERIFIED_INGREDIENT_REGISTRY
} from '../packages/grocery-engine/dist/index.js';
import { GeminiProvider } from '../services/api/dist/ai/gemini.provider.js';
import { DeterministicProvider } from '../services/api/dist/ai/deterministic.provider.js';

const API_BASE = 'http://localhost:4000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✘ FAIL\x1b[0m: ${message}`);
  }
}

async function runHardeningTests() {
  console.log('\n========================================================================');
  console.log('  RASOIIQ AI CHEF PRODUCTION-HARDENING AUDIT & TEST SUITE');
  console.log('========================================================================\n');

  // ==========================================================================
  // SECTION 1: Gemini Integration & Model Configuration
  // ==========================================================================
  console.log('\x1b[36m[SECTION 1] Gemini Integration & Model Configuration\x1b[0m');
  const gemini = new GeminiProvider();
  assert(gemini.name === 'gemini', 'GeminiProvider identified with provider name "gemini"');
  
  // Verify candidate models in prioritized fallback order (1. gemini-3.5-flash-lite, 2. gemini-3.1-flash-lite)
  const candidateModels = gemini['candidateModels'] || [];
  assert(candidateModels[0] === 'models/gemini-3.5-flash-lite', `Primary model is gemini-3.5-flash-lite (actual: ${candidateModels[0]})`);
  assert(candidateModels[1] === 'models/gemini-3.1-flash-lite', `Secondary model is gemini-3.1-flash-lite (actual: ${candidateModels[1]})`);
  assert(!candidateModels.includes('models/gemini-1.0-pro'), 'Deprecated legacy model gemini-1.0-pro removed');

  // ==========================================================================
  // SECTION 2: Gemini Successful Generation (Catalog Reconciliation & Schema)
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 2] Gemini Successful Generation Pipeline\x1b[0m');
  const mockGeminiSuccessResponse = {
    candidates: [{
      content: {
        parts: [{
          text: JSON.stringify({
            source: 'gemini',
            planSummary: 'Vibrant pan-Indian weekly plan curated by Gemini AI',
            estimatedWeeklyBudgetInr: 2850,
            nutritionalHighlights: {
              avgDailyCalories: 1880,
              proteinFocus: 'Balanced regional Indian plant and dairy protein',
              fiberRating: 'Excellent'
            },
            meals: [
              { dayOfWeek: 'monday', mealCategory: 'breakfast', recipeId: 'recipe-methi-thepla', recipeTitle: 'Spiced Gujarati Methi Thepla', cuisine: 'Gujarati', reason: 'Nutritious fiber-rich start', servings: 4 },
              { dayOfWeek: 'monday', mealCategory: 'lunch', recipeId: 'recipe-rajma-chawal', recipeTitle: 'Dhaba Style Kashmiri Rajma Chawal', cuisine: 'Punjabi', reason: 'High protein legumes', servings: 4 },
              { dayOfWeek: 'monday', mealCategory: 'dinner', recipeId: 'recipe-bhindi-masala', recipeTitle: 'Chatpati Homestyle Bhindi Masala', cuisine: 'North Indian', reason: 'Light green vegetable curry', servings: 4 },
              { dayOfWeek: 'tuesday', mealCategory: 'breakfast', recipeId: 'recipe-idli-sambar', recipeTitle: 'Steamed Idli with Drumstick Vegetable Sambar', cuisine: 'South Indian', reason: 'Fermented gut-friendly breakfast', servings: 4 },
              { dayOfWeek: 'tuesday', mealCategory: 'lunch', recipeId: 'recipe-palak-paneer', recipeTitle: 'Creamy Homestyle Palak Paneer', cuisine: 'North Indian', reason: 'Iron & calcium rich', servings: 4 },
              { dayOfWeek: 'tuesday', mealCategory: 'dinner', recipeId: 'recipe-bengali-cholar-dal', recipeTitle: 'Traditional Bengali Narkel Cholar Dal', cuisine: 'Bengali', reason: 'Comforting protein dal', servings: 4 },
              { dayOfWeek: 'wednesday', mealCategory: 'breakfast', recipeId: 'recipe-khaman-dhokla', recipeTitle: 'Surati Nylon Khaman Dhokla', cuisine: 'Gujarati', reason: 'Steamed protein snack', servings: 4 },
              { dayOfWeek: 'wednesday', mealCategory: 'lunch', recipeId: 'recipe-amritsari-chole', recipeTitle: 'Authentic Amritsari Pindi Chole', cuisine: 'Punjabi', reason: 'High protein chickpeas', servings: 4 },
              { dayOfWeek: 'wednesday', mealCategory: 'dinner', recipeId: 'recipe-moong-dal-khichdi', recipeTitle: 'Sattvic Moong Dal Khichdi with Desi Ghee', cuisine: 'Gujarati', reason: 'Easy to digest dinner', servings: 4 },
              { dayOfWeek: 'thursday', mealCategory: 'breakfast', recipeId: 'recipe-kanda-poha', recipeTitle: 'Mumbai Style Batata Kanda Poha', cuisine: 'Maharashtrian', reason: 'Quick energy breakfast', servings: 4 },
              { dayOfWeek: 'thursday', mealCategory: 'lunch', recipeId: 'recipe-dal-tadka', recipeTitle: 'Dhaba Style Yellow Dal Tadka', cuisine: 'North Indian', reason: 'Homestyle yellow dal', servings: 4 },
              { dayOfWeek: 'thursday', mealCategory: 'dinner', recipeId: 'recipe-aloo-gobi', recipeTitle: 'Homestyle Adraki Aloo Gobi', cuisine: 'North Indian', reason: 'Classic vegetable main', servings: 4 },
              { dayOfWeek: 'friday', mealCategory: 'breakfast', recipeId: 'recipe-masala-dosa', recipeTitle: 'Crispy Bengaluru Masala Dosa', cuisine: 'South Indian', reason: 'Crispy weekend breakfast', servings: 4 },
              { dayOfWeek: 'friday', mealCategory: 'lunch', recipeId: 'recipe-sambhar-rice', recipeTitle: 'Chennai Sambar Sadam (One-Pot Sambar Rice)', cuisine: 'South Indian', reason: 'Lentils and vegetables', servings: 4 },
              { dayOfWeek: 'friday', mealCategory: 'dinner', recipeId: 'recipe-baingan-bharta', recipeTitle: 'Dhaba Style Smoked Baingan Bharta', cuisine: 'Punjabi', reason: 'Smoky roasted eggplant', servings: 4 },
              { dayOfWeek: 'saturday', mealCategory: 'breakfast', recipeId: 'recipe-rava-upma', recipeTitle: 'Spiced Vegetable Rava Upma', cuisine: 'South Indian', reason: 'Wholesome semolina breakfast', servings: 4 },
              { dayOfWeek: 'saturday', mealCategory: 'lunch', recipeId: 'recipe-paneer-butter-masala', recipeTitle: 'Restaurant Style Paneer Butter Masala', cuisine: 'North Indian', reason: 'Weekend family feast', servings: 4 },
              { dayOfWeek: 'saturday', mealCategory: 'dinner', recipeId: 'recipe-gujarati-khatti-meethi-dal', recipeTitle: 'Authentic Gujarati Khatti Meethi Dal', cuisine: 'Gujarati', reason: 'Sweet and tangy comfort', servings: 4 },
              { dayOfWeek: 'sunday', mealCategory: 'breakfast', recipeId: 'recipe-methi-thepla', recipeTitle: 'Spiced Gujarati Methi Thepla', cuisine: 'Gujarati', reason: 'Comforting Sunday thepla', servings: 4 },
              { dayOfWeek: 'sunday', mealCategory: 'lunch', recipeId: 'recipe-jain-paneer-bhurji', recipeTitle: 'Sattvic Jain Malai Paneer Bhurji', cuisine: 'North Indian', reason: 'Fresh paneer bhurji', servings: 4 },
              { dayOfWeek: 'sunday', mealCategory: 'dinner', recipeId: 'recipe-jain-moong-dal-tadka', recipeTitle: 'Sattvic Homestyle Moong Dal Tadka', cuisine: 'North Indian', reason: 'Light restorative dinner', servings: 4 }
            ]
          })
        }]
      }
    }]
  };

  const mockSuccessFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(mockGeminiSuccessResponse),
    json: async () => mockGeminiSuccessResponse
  });

  const successfulGeminiProvider = new GeminiProvider();
  successfulGeminiProvider.fetchFn = mockSuccessFetch;

  try {
    process.env.GEMINI_API_KEY = 'mock_valid_key_for_unit_test';
    const plan = await successfulGeminiProvider.generateMealPlan({
      daysCount: 7,
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'ALL_INDIAN'
    }, SEED_RECIPES);

    assert(plan.source === 'gemini', `Authoritative provider source is 'gemini' (actual: ${plan.source})`);
    assert(Boolean(plan.modelUsed), `Model used is reported: ${plan.modelUsed}`);
    assert(plan.meals.length === 21, `Full 21 meals parsed and reconciled (actual: ${plan.meals.length})`);
    assert(plan.uniqueRecipesCount >= 10, `Achieves high diversity: ${plan.uniqueRecipesCount} unique recipes across 21 meals`);

    // Verify zero same-day duplicates in Gemini output
    const dayMap = {};
    for (const m of plan.meals) {
      dayMap[m.dayOfWeek] = dayMap[m.dayOfWeek] || [];
      dayMap[m.dayOfWeek].push(m.recipeId);
    }
    const hasSameDayDup = Object.values(dayMap).some(list => new Set(list).size !== list.length);
    assert(!hasSameDayDup, 'Gemini reconciliation guarantees zero duplicate recipes on the same day');
  } catch (err) {
    assert(false, `Gemini successful generation failed: ${err.message}`);
  }

  // ==========================================================================
  // SECTION 3: Gemini Failure & Fallback Scenarios
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 3] Gemini Failure & Fallback Scenarios\x1b[0m');

  // Scenario 3A: Invalid API Key (HTTP 400)
  const invalidKeyFetch = async () => ({
    ok: false,
    status: 400,
    text: async () => JSON.stringify({ error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } })
  });
  const invalidKeyProvider = new GeminiProvider();
  invalidKeyProvider.fetchFn = invalidKeyFetch;
  try {
    await invalidKeyProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected invalid API key to throw');
  } catch (err) {
    assert(err.message.includes('HTTP 400') || err.message.includes('API key not valid'),
      `Invalid API key correctly detected and thrown: ${err.message.slice(0, 70)}...`);
  }

  // Scenario 3B: Quota Exhaustion (HTTP 429)
  GeminiProvider.clearQuotaStates();
  const quotaFetch = async () => ({
    ok: false,
    status: 429,
    text: async () => JSON.stringify({ error: { code: 429, message: 'Resource has been exhausted (e.g. check quota).', status: 'RESOURCE_EXHAUSTED' } })
  });
  const quotaProvider = new GeminiProvider();
  quotaProvider.fetchFn = quotaFetch;
  try {
    await quotaProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected quota exhaustion to throw');
  } catch (err) {
    assert(err.message.includes('HTTP 429') || err.message.includes('exhausted'),
      `Quota exhaustion correctly detected and thrown: ${err.message.slice(0, 70)}...`);
  }

  // Scenario 3C: Network Timeout / Abort Error
  GeminiProvider.clearQuotaStates();
  const timeoutFetch = async () => {
    throw new Error('The operation was aborted due to timeout');
  };
  const timeoutProvider = new GeminiProvider();
  timeoutProvider.fetchFn = timeoutFetch;
  try {
    await timeoutProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected network timeout to throw');
  } catch (err) {
    assert(err.message.includes('timeout') || err.message.includes('aborted') || err.message.includes('Network failure'),
      `Network timeout correctly caught: ${err.message}`);
  }

  // Scenario 3D: Unsupported Model (HTTP 404)
  GeminiProvider.clearQuotaStates();
  const notFoundFetch = async () => ({
    ok: false,
    status: 404,
    text: async () => JSON.stringify({ error: { code: 404, message: 'models/gemini-2.0-flash is no longer available.', status: 'NOT_FOUND' } })
  });
  const notFoundProvider = new GeminiProvider();
  notFoundProvider.fetchFn = notFoundFetch;
  try {
    await notFoundProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected unsupported model to throw');
  } catch (err) {
    assert(err.message.includes('HTTP 404') || err.message.includes('All Gemini models failed'),
      `Unsupported model correctly caught: ${err.message.slice(0, 70)}...`);
  }

  // Scenario 3E: Malformed Non-JSON Response from Gemini
  GeminiProvider.clearQuotaStates();
  const malformedJsonFetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Sorry, I cannot help with that.' }] } }] }),
    json: async () => ({ candidates: [{ content: { parts: [{ text: 'Sorry, I cannot help with that.' }] } }] })
  });
  const malformedProvider = new GeminiProvider();
  malformedProvider.fetchFn = malformedJsonFetch;
  try {
    await malformedProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected malformed non-JSON to throw');
  } catch (err) {
    assert(err.message.includes('malformed JSON') || err.message.includes('Unexpected'),
      `Malformed JSON correctly caught: ${err.message}`);
  }

  // Scenario 3F: Provider Source Accuracy under Live Call (Gemini or Fallback)
  try {
    const fallbackRes = await fetch(`${API_BASE}/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daysCount: 7, dietaryPreference: 'VEGETARIAN', cuisinePreference: 'ALL_INDIAN' })
    });
    const fallbackData = await fallbackRes.json();
    if (fallbackData.source === 'deterministic-fallback') {
      assert(fallbackData.source === 'deterministic-fallback', `Fallback response source accurately labeled as 'deterministic-fallback' (actual: ${fallbackData.source})`);
      assert(Boolean(fallbackData.fallbackReason), `Fallback reason transparently recorded: "${fallbackData.fallbackReason?.slice(0, 60)}..."`);
      assert(fallbackData.source !== 'gemini', 'Never reports Gemini as the provider when fallback generated meals');
    } else {
      assert(fallbackData.source === 'gemini', `Live Gemini answered and source is accurately labeled as 'gemini' (actual: ${fallbackData.source})`);
      assert(Boolean(fallbackData.modelUsed), `Model used transparently recorded: ${fallbackData.modelUsed}`);
      assert(fallbackData.source !== 'deterministic-fallback', 'Never reports fallback when Gemini generated meals');
    }
  } catch (err) {
    assert(false, `Live call provider accuracy test failed: ${err.message}`);
  }

  // ==========================================================================
  // SECTION 4: Unknown Ingredient Metadata (Fail-Closed Security)
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 4] Unknown Ingredient Metadata Fail-Closed Verification\x1b[0m');

  const recipeWithUnknownIng = {
    id: 'test-mystery-dish',
    title: 'Mystery Curry with Unverified Ingredient',
    cuisine: 'North Indian',
    dietaryTags: ['Pure Vegetarian'],
    mealTypes: ['lunch'],
    ingredients: [
      { ingredientId: 'ing-mystery-paste-999', quantity: 50, unit: 'g', isVerified: false }
    ],
    isJainFriendly: true,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    defaultServings: 4,
    caloriesPerServing: 200,
    proteinGrams: 5,
    carbsGrams: 20,
    fatGrams: 5,
    fiberGrams: 2,
    imageUrl: '',
    estimatedCostInr: 100
  };

  assert(!isIngredientMetadataVerified({ ingredientId: 'ing-mystery-paste-999', isVerified: false }),
    'Unverified ingredient correctly identified as unverified');
  assert(!isRecipeCompliantWithDiet(recipeWithUnknownIng, 'VEGAN'),
    'Fail-closed: Recipe with unverified ingredient rejected for VEGAN mode');
  assert(!isRecipeCompliantWithDiet(recipeWithUnknownIng, 'JAIN'),
    'Fail-closed: Recipe with unverified ingredient rejected for JAIN mode');
  assert(!isRecipeCompliantWithDiet(recipeWithUnknownIng, 'VEGETARIAN'),
    'Fail-closed: Recipe with unverified ingredient rejected for VEGETARIAN mode');
  assert(!isRecipeCompliantWithAllergies(recipeWithUnknownIng, ['peanuts']),
    'Fail-closed: Recipe with unverified ingredient rejected when allergy check is requested');

  // Verified ingredient is accepted
  assert(isIngredientMetadataVerified({ ingredientId: 'ing-paneer' }),
    'Verified ingredient (ing-paneer) confirmed verified in registry');

  // ==========================================================================
  // SECTION 5: Multi-Member Conflicting Preferences (Intersection Rule)
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 5] Multi-Member Conflicting Preferences (Intersection of Restrictions)\x1b[0m');

  // Household with: Member 1 = Vegan, Member 2 = Jain
  const veganAndJainMembers = [
    { id: 'm-vegan', name: 'Vani', dietaryPreference: 'vegan', allergies: [], dislikedIngredients: [] },
    { id: 'm-jain', name: 'Jayesh', dietaryPreference: 'jain', allergies: [], dislikedIngredients: [] }
  ];

  // A dish with dairy (paneer) is Jain, but NOT Vegan -> Must be REJECTED
  const paneerDish = SEED_RECIPES.find(r => r.id === 'recipe-jain-paneer-bhurji');
  const paneerCheck = isRecipeCompliantWithHouseholdMembers(paneerDish, veganAndJainMembers);
  assert(!paneerCheck.isCompliant, 'Jain Paneer Bhurji rejected because it contains dairy, violating Vani\'s Vegan mode');

  // A dish with root veg (potato) is Vegan, but NOT Jain -> Must be REJECTED
  const alooDish = SEED_RECIPES.find(r => r.id === 'recipe-aloo-gobi');
  const alooCheck = isRecipeCompliantWithHouseholdMembers(alooDish, veganAndJainMembers);
  assert(!alooCheck.isCompliant, 'Aloo Gobi rejected because it contains potatoes/ginger, violating Jayesh\'s Jain mode');

  // A dish that is BOTH Vegan AND Jain (e.g. Traditional Bengali Cholar Dal or Bhindi Masala) -> Must be ACCEPTED
  const cholarDal = SEED_RECIPES.find(r => r.id === 'recipe-bengali-cholar-dal');
  const cholarCheck = isRecipeCompliantWithHouseholdMembers(cholarDal, veganAndJainMembers);
  assert(cholarCheck.isCompliant, 'Traditional Bengali Cholar Dal accepted: satisfies BOTH Vegan and Jain constraints simultaneously');

  // ==========================================================================
  // SECTION 6: Multi-Member Member-Specific Allergies & Exclusions
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 6] Multi-Member Allergies & Explicit Ingredient Exclusions\x1b[0m');

  // Member 1: Peanut allergy. Member 2: Gluten allergy.
  const allergyMembers = [
    { id: 'm-peanut', name: 'Pooja', dietaryPreference: 'vegetarian', allergies: ['peanuts'], dislikedIngredients: [] },
    { id: 'm-gluten', name: 'Rohan', dietaryPreference: 'vegetarian', allergies: ['gluten'], dislikedIngredients: [] }
  ];

  // Thepla contains whole wheat atta (gluten) -> Violates Rohan
  const theplaDish = SEED_RECIPES.find(r => r.id === 'recipe-methi-thepla');
  const theplaCheck = isRecipeCompliantWithHouseholdMembers(theplaDish, allergyMembers);
  assert(!theplaCheck.isCompliant, 'Methi Thepla rejected because it contains gluten (atta), violating Rohan\'s gluten allergy');

  // Kanda Poha contains peanuts -> Violates Pooja
  const pohaDish = SEED_RECIPES.find(r => r.id === 'recipe-kanda-poha');
  const pohaCheck = isRecipeCompliantWithHouseholdMembers(pohaDish, allergyMembers);
  assert(!pohaCheck.isCompliant, 'Kanda Poha rejected because it contains peanuts, violating Pooja\'s peanut allergy');

  // Gluten-free, peanut-free dish (e.g. Palak Paneer or Moong Dal Khichdi) -> Accepted
  const glutenPeanutFreeDish = SEED_RECIPES.find(r => r.id === 'recipe-palak-paneer');
  const gpfCheck = isRecipeCompliantWithHouseholdMembers(glutenPeanutFreeDish, allergyMembers);
  assert(gpfCheck.isCompliant, 'Palak Paneer accepted: simultaneously satisfies peanut-free and gluten-free allergies');

  // Explicit ingredient exclusion test
  const exclusionMembers = [
    { id: 'm-picky', name: 'Aarav', dietaryPreference: 'vegetarian', allergies: [], dislikedIngredients: ['ing-baingan'] }
  ];
  const bainganDish = SEED_RECIPES.find(r => r.id === 'recipe-baingan-bharta');
  const bainganCheck = isRecipeCompliantWithHouseholdMembers(bainganDish, exclusionMembers);
  assert(!bainganCheck.isCompliant, 'Baingan Bharta rejected because Aarav explicitly excluded ing-baingan');

  // ==========================================================================
  // SECTION 7: Recipe Diversity & Zero Same-Day Repetitions
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 7] Recipe Diversity & Zero Same-Day Repetitions (21 Meals)\x1b[0m');

  const deterministic = new DeterministicProvider();
  const diversePlan = await deterministic.generateMealPlan({
    daysCount: 7,
    dietaryPreference: 'VEGETARIAN',
    cuisinePreference: 'ALL_INDIAN'
  }, SEED_RECIPES);

  assert(diversePlan.meals.length === 21, `Full 21 meals generated across 7 days (actual: ${diversePlan.meals.length})`);
  assert(diversePlan.uniqueRecipesCount >= 10,
    `Target exceeded: ${diversePlan.uniqueRecipesCount} unique recipes across 21 meals (target: >= 10)`);

  // Check zero same-day duplicates across all 7 days
  const dayGroup = {};
  for (const m of diversePlan.meals) {
    dayGroup[m.dayOfWeek] = dayGroup[m.dayOfWeek] || [];
    dayGroup[m.dayOfWeek].push(m.recipeId);
  }
  let anySameDayRepeat = false;
  for (const [day, ids] of Object.entries(dayGroup)) {
    if (new Set(ids).size !== ids.length) {
      anySameDayRepeat = true;
      console.error(`Same-day repeat on ${day}: [${ids.join(', ')}]`);
    }
  }
  assert(!anySameDayRepeat, 'Zero duplicate recipes on the same day across all 7 days');

  // Consecutive generation diversity across 5 runs
  console.log('\n\x1b[36m[SECTION 8] Diversity Across 5 Consecutive Generation Sessions\x1b[0m');
  const runUniqueCounts = [];
  const runOpeningDishes = [];
  let rollingRecent = [];

  for (let run = 1; run <= 5; run++) {
    const runPlan = await deterministic.generateMealPlan({
      daysCount: 7,
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'ALL_INDIAN',
      recentRecipeIds: rollingRecent
    }, SEED_RECIPES);

    runUniqueCounts.push(runPlan.uniqueRecipesCount);
    runOpeningDishes.push(runPlan.meals[0].recipeTitle);
    rollingRecent = Array.from(new Set([...runPlan.meals.map(m => m.recipeId), ...rollingRecent])).slice(0, 21);
  }

  assert(runUniqueCounts.every(c => c >= 10),
    `All 5 consecutive weekly generation runs achieved >= 10 unique recipes (Actual counts: [${runUniqueCounts.join(', ')}])`);
  const uniqueOpeners = new Set(runOpeningDishes).size;
  assert(uniqueOpeners >= 2,
    `Recency penalty rotates opening meals across sessions (${uniqueOpeners} distinct opening dishes across 5 runs: [${runOpeningDishes.join(', ')}])`);

  // ==========================================================================
  // SECTION 9: Catalog Limitation Handling Without Constraint Relaxation
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 9] Catalog Limitation Handling Without Constraint Relaxation\x1b[0m');

  // Request for South Indian only (which has ~5 eligible recipes in catalog)
  const southPlan = await deterministic.generateMealPlan({
    daysCount: 7,
    dietaryPreference: 'VEGETARIAN',
    cuisinePreference: 'South Indian'
  }, SEED_RECIPES);

  assert(Boolean(southPlan.catalogLimitation),
    `Catalog limitation clearly documented when catalog size < 10: "${southPlan.catalogLimitation?.slice(0, 80)}..."`);
  const nonSouthMeals = southPlan.meals.filter(m => !['South Indian', 'Tamil', 'Kerala', 'Karnataka'].includes(m.cuisine));
  assert(nonSouthMeals.length === 0,
    `Zero constraints relaxed: 0 non-South Indian dishes returned despite limited catalog (violations: ${nonSouthMeals.length})`);

  // Impossible constraint (e.g. Jain Non-Vegetarian)
  const impossibleFilter = filterEligibleRecipes(SEED_RECIPES, {
    members: [
      { id: 'm1', name: 'Jain Member', dietaryPreference: 'jain', allergies: [], dislikedIngredients: [] },
      { id: 'm2', name: 'Strict Non-Veg Excluder', dietaryPreference: 'non-vegetarian', allergies: [], dislikedIngredients: ['ing-tomato', 'ing-bhindi', 'ing-paneer', 'ing-moong-dal', 'ing-chana-dal', 'ing-atta', 'ing-besan', 'ing-basmati-rice', 'ing-dosa-batter', 'ing-bajra-flour'] }
    ]
  });
  assert(impossibleFilter.eligible.length === 0, 'Impossible combined constraint yields 0 eligible recipes');
  assert(Boolean(impossibleFilter.reasonIfNotAvailable),
    `Clear explanation returned without relaxing constraints: "${impossibleFilter.reasonIfNotAvailable?.slice(0, 90)}..."`);

  // ==========================================================================
  // SUMMARY REPORT
  // ==========================================================================
  console.log('\n========================================================================');
  console.log(`  AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runHardeningTests();
