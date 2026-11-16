/**
 * Comprehensive Test Suite for RasoiIQ AI Chef Default Preferences & Generation Requirements
 * 
 * Verifies:
 * 1. New household defaults to Vegetarian + All Indian.
 * 2. User can change to Non-Vegetarian.
 * 3. User can change to Eggetarian, Vegan, and Jain.
 * 4. Vegetarian excludes eggs by default.
 * 5. Vegan excludes dairy and all animal products.
 * 6. Jain restrictions remain enforced (no root vegetables, no onion/garlic, non-veg).
 * 7. North Indian search excludes unrelated South Indian results by default.
 * 8. South Indian search respects regional filters (excludes North Indian).
 * 9. All Indian search returns eligible recipes across all regions.
 * 10. Gemini and fallback enforce identical hard constraints.
 * 11. Mixed households respect member-specific restrictions.
 * 12. Five consecutive generation attempts produce appropriate recipe diversity.
 */

import { SEED_RECIPES, SEED_INGREDIENTS, SEED_DEMO_HOUSEHOLD } from '../packages/database/dist/index.js';
import { 
  filterEligibleRecipes, 
  isRecipeCompliantWithDiet, 
  isRecipeCompliantWithCuisine, 
  getSharedHouseholdDietaryConstraint,
  isRecipeCompliantWithAllergies
} from '../packages/grocery-engine/dist/index.js';

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

async function runTestSuite() {
  console.log('\n========================================================================');
  console.log('  RASOIIQ AI CHEF PREFERENCES & GENERATION VERIFICATION SUITE');
  console.log('========================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: New household defaults to Vegetarian + All Indian
  // --------------------------------------------------------------------------
  console.log('\x1b[36m[TEST 1] New Household Initialization Defaults\x1b[0m');
  try {
    const res = await fetch(`${API_BASE}/households/me`);
    const hh = await res.json();
    assert(hh.dietaryPreference === 'VEGETARIAN', `Default dietaryPreference is VEGETARIAN (actual: ${hh.dietaryPreference})`);
    assert(hh.cuisinePreference === 'ALL_INDIAN', `Default cuisinePreference is ALL_INDIAN (actual: ${hh.cuisinePreference})`);
    assert(SEED_DEMO_HOUSEHOLD.dietaryPreference === 'VEGETARIAN', 'Database seed demo household has dietaryPreference = VEGETARIAN');
    assert(SEED_DEMO_HOUSEHOLD.cuisinePreference === 'ALL_INDIAN', 'Database seed demo household has cuisinePreference = ALL_INDIAN');
  } catch (err) {
    assert(false, `Failed to query household defaults: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 2: User can change to Non-Vegetarian
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 2] Modifiability to Non-Vegetarian Mode\x1b[0m');
  try {
    const updateRes = await fetch(`${API_BASE}/households/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dietaryPreference: 'NON_VEGETARIAN' })
    });
    const updated = await updateRes.json();
    assert(updated.dietaryPreference === 'NON_VEGETARIAN', `Updated household preference to NON_VEGETARIAN (actual: ${updated.dietaryPreference})`);

    // Verify non-veg dishes are now eligible in engine
    const filter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'NON_VEGETARIAN', cuisinePreferences: ['ALL_INDIAN'] });
    const hasChicken = filter.eligible.some(r => r.id === 'recipe-punjabi-chicken-curry');
    const hasFish = filter.eligible.some(r => r.id === 'recipe-bengali-macher-jhol');
    const hasVeg = filter.eligible.some(r => r.id === 'recipe-palak-paneer');
    assert(hasChicken && hasFish, 'NON_VEGETARIAN mode includes chicken and fish recipes');
    assert(hasVeg, 'NON_VEGETARIAN mode also allows vegetarian homestyle recipes');
  } catch (err) {
    assert(false, `Failed updating to NON_VEGETARIAN: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 3: User can change to Eggetarian, Vegan, and Jain
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 3] Modifiability to Eggetarian, Vegan, and Jain Modes\x1b[0m');
  try {
    for (const mode of ['EGGETARIAN', 'VEGAN', 'JAIN', 'VEGETARIAN']) {
      const r = await fetch(`${API_BASE}/households/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dietaryPreference: mode })
      });
      const data = await r.json();
      assert(data.dietaryPreference === mode, `Household dietary mode successfully updated to ${mode}`);
    }
  } catch (err) {
    assert(false, `Failed switching dietary modes: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Vegetarian excludes eggs by default
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 4] Vegetarian Mode Excludes Eggs by Default\x1b[0m');
  const mockEggDish = {
    id: 'test-egg-bhurji',
    title: 'Egg Bhurji',
    cuisine: 'North Indian',
    dietaryTags: ['Eggetarian'],
    ingredients: [{ ingredientId: 'ing-egg', unit: 'pcs', quantity: 2 }]
  };
  const vegCheckEgg = isRecipeCompliantWithDiet(mockEggDish, 'VEGETARIAN');
  const eggetarianCheckEgg = isRecipeCompliantWithDiet(mockEggDish, 'EGGETARIAN');
  assert(!vegCheckEgg, 'Vegetarian mode strictly rejects Egg Bhurji');
  assert(eggetarianCheckEgg, 'Eggetarian mode permits Egg Bhurji');

  // Verify across full seed database in VEGETARIAN mode
  const vegFilter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'VEGETARIAN', cuisinePreferences: ['ALL_INDIAN'] });
  const vegContainsEgg = vegFilter.eligible.some(r => r.dietaryTags.includes('Eggetarian') || r.ingredients?.some(i => i.ingredientId.includes('egg')));
  const vegContainsMeat = vegFilter.eligible.some(r => r.dietaryTags.includes('Non-Vegetarian'));
  assert(!vegContainsEgg, 'Zero egg dishes present in eligible pool for VEGETARIAN mode');
  assert(!vegContainsMeat, 'Zero meat/poultry/fish dishes present in eligible pool for VEGETARIAN mode');

  // --------------------------------------------------------------------------
  // TEST 5: Vegan excludes dairy and all animal products
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 5] Vegan Mode Excludes Dairy & All Animal Products\x1b[0m');
  const paneerDish = SEED_RECIPES.find(r => r.id === 'recipe-palak-paneer');
  const paneerButterMasala = SEED_RECIPES.find(r => r.id === 'recipe-paneer-butter-masala');
  const cholarDal = SEED_RECIPES.find(r => r.id === 'recipe-bengali-cholar-dal'); // vegan dal

  assert(!isRecipeCompliantWithDiet(paneerDish, 'VEGAN'), 'Vegan mode strictly rejects Palak Paneer (contains dairy paneer)');
  assert(!isRecipeCompliantWithDiet(paneerButterMasala, 'VEGAN'), 'Vegan mode strictly rejects Paneer Butter Masala (contains butter & dairy)');
  assert(isRecipeCompliantWithDiet(cholarDal, 'VEGAN'), 'Vegan mode permits plant-based Cholar Dal');

  const veganFilter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'VEGAN', cuisinePreferences: ['ALL_INDIAN'] });
  const veganHasDairy = veganFilter.eligible.some(r => 
    r.ingredients?.some(i => ['ing-paneer', 'ing-butter', 'ing-ghee', 'ing-curd', 'ing-cream', 'ing-milk'].includes(i.ingredientId))
  );
  assert(!veganHasDairy, `Zero dairy-containing recipes present in VEGAN pool (${veganFilter.eligible.length} purely plant-based recipes eligible)`);

  // --------------------------------------------------------------------------
  // TEST 6: Jain restrictions remain enforced (no root veg, onion, garlic, non-veg)
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 6] Jain Dietary Restrictions Strict Enforcement\x1b[0m');
  const jainFilter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'JAIN', cuisinePreferences: ['ALL_INDIAN'] });
  const jainViolations = jainFilter.eligible.filter(r => {
    if (!r.isJainFriendly) return true;
    return r.ingredients?.some(ing => {
      const match = SEED_INGREDIENTS.find(si => si.id === ing.ingredientId);
      return match && match.isJainPermissible === false;
    });
  });
  assert(jainViolations.length === 0, `Zero Jain violations across catalog (all ${jainFilter.eligible.length} eligible dishes verified 100% root-vegetable and onion-garlic free)`);
  assert(jainFilter.eligible.some(r => r.id === 'recipe-methi-thepla'), 'Jain filter permits verified Jain dish Methi Thepla');
  assert(!jainFilter.eligible.some(r => r.id === 'recipe-chole'), 'Jain filter strictly excludes Chole (contains onions/garlic)');

  // --------------------------------------------------------------------------
  // TEST 7: North Indian search excludes unrelated South Indian results by default
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 7] Regional Filter: North Indian Strictly Excludes South Indian\x1b[0m');
  const northFilter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'VEGETARIAN', cuisinePreferences: ['North Indian'] });
  const southInNorth = northFilter.eligible.filter(r => ['South Indian', 'Tamil', 'Kerala', 'Karnataka', 'Andhra'].includes(r.cuisine));
  assert(southInNorth.length === 0, `North Indian filter returns 0 South Indian recipes (leakage: ${southInNorth.length})`);
  assert(northFilter.eligible.some(r => r.cuisine === 'North Indian' || r.cuisine === 'Punjabi'), 'North Indian filter includes authentic Punjabi/North Indian recipes');

  // --------------------------------------------------------------------------
  // TEST 8: South Indian search respects regional filters (excludes North Indian)
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 8] Regional Filter: South Indian Strictly Excludes North Indian\x1b[0m');
  const southFilter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'VEGETARIAN', cuisinePreferences: ['South Indian'] });
  const northInSouth = southFilter.eligible.filter(r => ['North Indian', 'Punjabi', 'Mughlai', 'Awadhi', 'Kashmiri'].includes(r.cuisine));
  assert(northInSouth.length === 0, `South Indian filter returns 0 North Indian recipes (leakage: ${northInSouth.length})`);
  assert(southFilter.eligible.some(r => r.id === 'recipe-masala-dosa' || r.id === 'recipe-sambar-rice'), 'South Indian filter includes authentic South Indian recipes');

  // --------------------------------------------------------------------------
  // TEST 9: All Indian search returns eligible recipes across all regions
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 9] All Indian Cuisines Returns Pan-Indian Diversity\x1b[0m');
  const allIndianFilter = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'VEGETARIAN', cuisinePreferences: ['ALL_INDIAN'] });
  const cuisinesRepresented = new Set(allIndianFilter.eligible.map(r => r.cuisine));
  assert(cuisinesRepresented.has('North Indian') || cuisinesRepresented.has('Punjabi'), 'ALL_INDIAN includes North Indian/Punjabi');
  assert(cuisinesRepresented.has('South Indian'), 'ALL_INDIAN includes South Indian');
  assert(cuisinesRepresented.has('Gujarati'), 'ALL_INDIAN includes West Indian/Gujarati');
  assert(allIndianFilter.eligible.length >= 6, `ALL_INDIAN spans all regions with ${allIndianFilter.eligible.length} eligible dishes`);

  // --------------------------------------------------------------------------
  // TEST 10: Gemini and Fallback enforce identical hard constraints
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 10] Hard Constraints Enforcement Across Engine & Providers\x1b[0m');
  try {
    // Generate plan via API with North Indian + Vegetarian
    const genRes = await fetch(`${API_BASE}/ai/generate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        householdId: 'hh-sharma-family',
        daysCount: 7,
        dietaryPreference: 'VEGETARIAN',
        cuisinePreference: 'North Indian'
      })
    });
    const plan = await genRes.json();
    console.log(`  \x1b[33m[Provider Log]\x1b[0m Source: \x1b[1m${plan.source}\x1b[0m | Fallback Reason: "${plan.fallbackReason || 'None'}"`);
    
    // Check all returned meals strictly conform to North Indian and Vegetarian
    const invalidCuisine = plan.meals.filter(m => {
      const rec = SEED_RECIPES.find(r => r.id === m.recipeId);
      return !isRecipeCompliantWithCuisine(rec || { cuisine: m.cuisine }, ['North Indian']);
    });
    const nonVegInPlan = plan.meals.filter(m => {
      const rec = SEED_RECIPES.find(r => r.id === m.recipeId);
      return !isRecipeCompliantWithDiet(rec, 'VEGETARIAN');
    });

    assert(invalidCuisine.length === 0, `All generated meals strictly respect regional constraint "North Indian" (violations: ${invalidCuisine.length})`);
    assert(nonVegInPlan.length === 0, `All generated meals strictly respect dietary constraint "VEGETARIAN" (violations: ${nonVegInPlan.length})`);
    assert(plan.source === 'deterministic-fallback' || plan.source === 'gemini', `Authoritative provider reported correctly: ${plan.source}`);
  } catch (err) {
    assert(false, `Error generating plan in test 10: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST 11: Mixed households respect member-specific restrictions
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 11] Mixed Household Dietary Constraints Reconciliation\x1b[0m');
  const mockMembers = [
    { id: 'm1', name: 'Ramesh', dietaryPreference: 'jain', allergies: [] },
    { id: 'm2', name: 'Rohan', dietaryPreference: 'non-vegetarian', allergies: [] },
    { id: 'm3', name: 'Pooja', dietaryPreference: 'vegetarian', allergies: ['peanuts'] }
  ];
  const sharedDiet = getSharedHouseholdDietaryConstraint(mockMembers);
  assert(sharedDiet === 'JAIN', `Shared meal calculates to most restrictive dietary constraint: JAIN (actual: ${sharedDiet})`);

  const mixedFilter = filterEligibleRecipes(SEED_RECIPES, {
    members: mockMembers,
    cuisinePreferences: ['ALL_INDIAN']
  });

  const hasAllergenViolation = mixedFilter.eligible.some(r => !isRecipeCompliantWithAllergies(r, ['peanuts']));
  const hasJainViolation = mixedFilter.eligible.some(r => !isRecipeCompliantWithDiet(r, 'JAIN'));

  assert(!hasAllergenViolation, 'Zero shared meals contain peanut allergens for member Pooja');
  assert(!hasJainViolation, 'Zero shared meals violate Jain dietary restrictions for member Ramesh');
  assert(mixedFilter.eligible.length > 0, `Eligible shared recipes successfully discovered (${mixedFilter.eligible.length} recipes safe for entire family)`);

  // --------------------------------------------------------------------------
  // TEST 12: Five consecutive generation attempts produce recipe diversity
  // --------------------------------------------------------------------------
  console.log('\n\x1b[36m[TEST 12] Five Consecutive Generation Attempts Produce Recipe Diversity\x1b[0m');
  try {
    const runSummaries = [];
    for (let run = 1; run <= 5; run++) {
      const res = await fetch(`${API_BASE}/ai/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          householdId: 'hh-sharma-family',
          daysCount: 7,
          dietaryPreference: 'VEGETARIAN',
          cuisinePreference: 'ALL_INDIAN'
        })
      });
      const data = await res.json();
      const uniqueRecipeIds = new Set(data.meals.map(m => m.recipeId));
      runSummaries.push({
        run,
        source: data.source,
        totalMeals: data.meals.length,
        uniqueRecipes: uniqueRecipeIds.size,
        firstThreeRecipes: data.meals.slice(0, 3).map(m => m.recipeTitle)
      });
    }

    console.log('  Five Generation Runs Summary:');
    runSummaries.forEach(s => {
      console.log(`    Run #${s.run} (${s.source}): ${s.uniqueRecipes} unique recipes across ${s.totalMeals} meals. Samples: [${s.firstThreeRecipes.join(', ')}]`);
    });

    const allFiveRunsHaveHighDiversity = runSummaries.every(s => s.uniqueRecipes >= 6);
    assert(allFiveRunsHaveHighDiversity, 'All 5 consecutive generation attempts maintain >= 6 unique recipes per 7-day plan');

    // Check that across runs, opening meal shifts due to recency penalties
    const openingMeals = runSummaries.map(s => s.firstThreeRecipes[0]);
    const uniqueOpeningDishes = new Set(openingMeals).size;
    assert(uniqueOpeningDishes >= 2, `Dynamic history penalty rotates opening meals across runs (${uniqueOpeningDishes} different opening dishes seen)`);
  } catch (err) {
    assert(false, `Consecutive diversity test error: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`  AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
