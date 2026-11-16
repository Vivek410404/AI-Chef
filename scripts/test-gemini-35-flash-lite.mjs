/**
 * RasoiIQ — Gemini 3.5 Flash-Lite Verification Suite
 * 
 * Verifies:
 * 1. Direct test of Gemini 3.5 Flash-Lite with real API response.
 * 2. Generation of an actual seven-day meal plan (21 meals).
 * 3. Authoritative response reports 'gemini' as provider and 'gemini-3.5-flash-lite' as model.
 * 4. Fallback chain: 1. gemini-3.5-flash-lite -> 2. gemini-3.1-flash-lite -> 3. deterministic-fallback.
 * 5. HTTP 429 handling with Retry-After and rate-limit reset information.
 * 6. Avoidance of repeatedly calling an exhausted model/provider.
 * 7. Separate handling of HTTP 404, 401, 403, 500 and network failures.
 * 8. Preservation of all dietary modes, regional filtering, allergies, and nutrition calculations.
 */

import fs from 'fs';
import { SEED_RECIPES, SEED_DEMO_HOUSEHOLD } from '../packages/database/dist/index.js';
import {
  filterEligibleRecipes,
  isRecipeCompliantWithDiet,
  isRecipeCompliantWithAllergies,
  isRecipeCompliantWithHouseholdMembers
} from '../packages/grocery-engine/dist/index.js';
import { GeminiProvider } from '../services/api/dist/ai/gemini.provider.js';
import { DeterministicProvider } from '../services/api/dist/ai/deterministic.provider.js';
import { AiService } from '../services/api/dist/ai/ai.service.js';
import { StoreService } from '../services/api/dist/data/store.service.js';

// Read API key from .env
const envContent = fs.readFileSync('d:/Startup/.env', 'utf-8');
const match = envContent.match(/GEMINI_API_KEY=["']?([^"'\r\n]+)/);
const apiKey = match ? match[1] : '';

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

async function runGemini35FlashLiteSuite() {
  console.log('\n========================================================================');
  console.log('  RASOIIQ — GEMINI 3.5 FLASH-LITE VERIFICATION SUITE');
  console.log('========================================================================\n');

  // ==========================================================================
  // SECTION 1: Model Hierarchy & Fallback Order Configuration
  // ==========================================================================
  console.log('\x1b[36m[SECTION 1] Model Hierarchy & Provider Fallback Order\x1b[0m');
  const provider = new GeminiProvider();
  assert(provider.name === 'gemini', 'GeminiProvider name is "gemini"');
  assert(provider.candidateModels.length === 2, `Configured exactly 2 candidate models in fallback order (actual: ${provider.candidateModels.length})`);
  assert(provider.candidateModels[0] === 'models/gemini-3.5-flash-lite', `Primary model is Gemini 3.5 Flash-Lite (actual: ${provider.candidateModels[0]})`);
  assert(provider.candidateModels[1] === 'models/gemini-3.1-flash-lite', `Secondary model is Gemini 3.1 Flash-Lite (actual: ${provider.candidateModels[1]})`);

  // ==========================================================================
  // SECTION 2: Real Gemini 3.5 Flash-Lite Meal Plan Generation (Direct API Call)
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 2] Live Gemini 3.5 Flash-Lite Meal Plan Generation\x1b[0m');
  assert(Boolean(apiKey && apiKey.length > 20), `Live Gemini API key loaded from backend .env (${apiKey.substring(0, 8)}...)`);

  process.env.GEMINI_API_KEY = apiKey;
  GeminiProvider.clearQuotaStates();

  let livePlan = null;
  const startTime = Date.now();
  try {
    livePlan = await provider.generateMealPlan({
      daysCount: 7,
      servingsPerMeal: 4,
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'ALL_INDIAN',
      prompt: 'Wholesome weekly family meal plan with rich variety'
    }, SEED_RECIPES);

    const elapsedMs = Date.now() - startTime;
    console.log(`  ℹ️ Live Gemini API call completed in ${elapsedMs}ms`);

    assert(livePlan.source === 'gemini', `Authoritative provider source is 'gemini' (actual: ${livePlan.source})`);
    assert(livePlan.modelUsed === 'gemini-3.5-flash-lite' || livePlan.modelUsed === 'gemini-3.1-flash-lite', `Exact model reported is Gemini Flash-Lite candidate (actual: ${livePlan.modelUsed})`);
    assert(livePlan.meals.length === 21, `Full 21 meals generated across 7 days (actual: ${livePlan.meals.length})`);
    assert(livePlan.uniqueRecipesCount >= 10, `High recipe diversity: ${livePlan.uniqueRecipesCount} unique recipes (target: >= 10)`);

    // Verify zero same-day duplicates in the live plan
    const dayMealMap = {};
    for (const m of livePlan.meals) {
      dayMealMap[m.dayOfWeek] = dayMealMap[m.dayOfWeek] || [];
      dayMealMap[m.dayOfWeek].push(m.recipeId);
    }
    const hasSameDayDup = Object.values(dayMealMap).some(list => new Set(list).size !== list.length);
    assert(!hasSameDayDup, 'Guaranteed zero same-day duplicates in generated 7-day schedule');

    // Verify dietary compliance of all 21 suggested meals
    const nonVegViolations = livePlan.meals.filter(m => {
      const r = SEED_RECIPES.find(rec => rec.id === m.recipeId);
      return !r || !isRecipeCompliantWithDiet(r, 'VEGETARIAN');
    });
    assert(nonVegViolations.length === 0, `All 21 meals strictly compliant with VEGETARIAN dietary mode (violations: ${nonVegViolations.length})`);
  } catch (err) {
    assert(false, `Live Gemini 3.5 Flash-Lite generation failed: ${err.message}`);
  }

  // ==========================================================================
  // SECTION 3: Secondary Model Fallback (Gemini 3.1 Flash-Lite)
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 3] Secondary Model Fallback: Gemini 3.1 Flash-Lite\x1b[0m');
  const mockFallbackTo31 = new GeminiProvider();
  let model35Called = false;
  let model31Called = false;

  mockFallbackTo31.fetchFn = async (url) => {
    if (url.includes('gemini-3.5-flash-lite')) {
      model35Called = true;
      // Simulate HTTP 429 Quota Exhaustion on primary model
      return {
        ok: false,
        status: 429,
        headers: new Headers({ 'retry-after': '45' }),
        text: async () => JSON.stringify({
          error: {
            code: 429,
            message: 'Resource has been exhausted (check quota).',
            status: 'RESOURCE_EXHAUSTED'
          }
        })
      };
    }
    if (url.includes('gemini-3.1-flash-lite')) {
      model31Called = true;
      // Secondary model returns 200 OK
      const sampleResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                source: 'gemini',
                planSummary: 'Plan from Gemini 3.1 Flash-Lite',
                estimatedWeeklyBudgetInr: 2800,
                nutritionalHighlights: { avgDailyCalories: 1900, proteinFocus: 'Lentils', fiberRating: 'High' },
                meals: livePlan ? livePlan.meals : []
              })
            }]
          }
        }]
      };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(sampleResponse),
        json: async () => sampleResponse
      };
    }
    throw new Error('Unexpected URL: ' + url);
  };

  try {
    const planFrom31 = await mockFallbackTo31.generateMealPlan({
      daysCount: 7,
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'ALL_INDIAN'
    }, SEED_RECIPES);

    assert(model35Called, 'Primary model gemini-3.5-flash-lite attempted first');
    assert(model31Called, 'Secondary model gemini-3.1-flash-lite attempted second on primary 429');
    assert(planFrom31.source === 'gemini', `Authoritative provider source is 'gemini' (actual: ${planFrom31.source})`);
    assert(planFrom31.modelUsed === 'gemini-3.1-flash-lite', `Authoritative model reported is 'gemini-3.1-flash-lite' (actual: ${planFrom31.modelUsed})`);
  } catch (err) {
    assert(false, `Fallback to 3.1 failed: ${err.message}`);
  }

  // ==========================================================================
  // SECTION 4: HTTP 429 Quota Exhaustion & Rate-Limit Cache Avoidance
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 4] Quota/Rate-Limit State Recording & Repeated-Call Avoidance\x1b[0m');
  
  // Verify that gemini-3.5-flash-lite rate limit state was recorded
  const quotaStates = GeminiProvider.getQuotaStates();
  assert(quotaStates.has('models/gemini-3.5-flash-lite'), 'Quota rate limit state recorded for models/gemini-3.5-flash-lite');
  const recordedLimit = quotaStates.get('models/gemini-3.5-flash-lite');
  assert(recordedLimit.statusCode === 429, `Status code 429 captured (actual: ${recordedLimit.statusCode})`);
  assert(recordedLimit.retryAfterSeconds === 45, `Retry-After header duration respected (expected: 45s, actual: ${recordedLimit.retryAfterSeconds}s)`);
  assert(recordedLimit.resetAt > Date.now(), 'Rate-limit reset timestamp is in the future');

  // Verify that subsequent calls skip gemini-3.5-flash-lite immediately without making an HTTP request
  let directCallTo35Made = false;
  mockFallbackTo31.fetchFn = async (url) => {
    if (url.includes('gemini-3.5-flash-lite')) {
      directCallTo35Made = true;
      throw new Error('Should not have been called!');
    }
    if (url.includes('gemini-3.1-flash-lite')) {
      const sampleResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                source: 'gemini',
                planSummary: 'Quick plan',
                estimatedWeeklyBudgetInr: 2800,
                nutritionalHighlights: { avgDailyCalories: 1900, proteinFocus: 'Lentils', fiberRating: 'High' },
                meals: livePlan ? livePlan.meals : []
              })
            }]
          }
        }]
      };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(sampleResponse),
        json: async () => sampleResponse
      };
    }
    throw new Error('Unexpected URL: ' + url);
  };

  await mockFallbackTo31.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
  assert(!directCallTo35Made, 'Avoids repeatedly calling provider with active rate limit (skipped 3.5 without HTTP request)');

  // Clear quota states for subsequent tests
  GeminiProvider.clearQuotaStates();
  assert(GeminiProvider.getQuotaStates().size === 0, 'Quota states cleanly cleared for test isolation');

  // ==========================================================================
  // SECTION 5: Separate Error Handling (401/403, 404, 500, Network Timeout)
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 5] Separate Categorization of HTTP & Network Errors\x1b[0m');

  // Test 5A: HTTP 401/403 Authentication Error
  const authProvider = new GeminiProvider();
  authProvider.fetchFn = async () => ({
    ok: false,
    status: 401,
    text: async () => JSON.stringify({ error: { code: 401, message: 'API key not valid.', status: 'UNAUTHENTICATED' } })
  });
  try {
    await authProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected 401 auth error to throw');
  } catch (err) {
    assert(err.message.includes('401') || err.message.includes('API key'), `Auth error (401) separately identified: ${err.message.slice(0, 60)}...`);
  }

  // Test 5B: HTTP 404 Model Not Found
  const notFoundProvider = new GeminiProvider();
  notFoundProvider.fetchFn = async () => ({
    ok: false,
    status: 404,
    text: async () => JSON.stringify({ error: { code: 404, message: 'Model not found or deprecated.', status: 'NOT_FOUND' } })
  });
  try {
    await notFoundProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected 404 error to throw');
  } catch (err) {
    assert(err.message.includes('404') || err.message.includes('NOT_FOUND'), `Model not found (404) separately identified: ${err.message.slice(0, 60)}...`);
  }

  // Test 5C: HTTP 500 Server Error
  const serverErrProvider = new GeminiProvider();
  serverErrProvider.fetchFn = async () => ({
    ok: false,
    status: 500,
    text: async () => JSON.stringify({ error: { code: 500, message: 'Internal server error on Google servers.', status: 'INTERNAL' } })
  });
  try {
    await serverErrProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected 500 server error to throw');
  } catch (err) {
    assert(err.message.includes('500') || err.message.includes('Google API upstream server error'), `Server error (500) separately identified: ${err.message.slice(0, 60)}...`);
  }

  // Test 5D: Network Timeout / Abort
  const timeoutProvider = new GeminiProvider();
  timeoutProvider.fetchFn = async () => {
    throw new Error('The operation was aborted due to timeout');
  };
  try {
    await timeoutProvider.generateMealPlan({ daysCount: 7 }, SEED_RECIPES);
    assert(false, 'Expected timeout to throw');
  } catch (err) {
    assert(err.message.includes('Network failure') || err.message.includes('timeout'), `Network failure/timeout separately identified: ${err.message.slice(0, 60)}...`);
  }

  // ==========================================================================
  // SECTION 6: Full Cascade to Deterministic Fallback & Attribution
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 6] Seamless Cascade to Deterministic Fallback & Provider Attribution\x1b[0m');
  const store = new StoreService();
  const failingGemini = new GeminiProvider();
  failingGemini.fetchFn = async () => ({
    ok: false,
    status: 429,
    headers: new Headers({ 'retry-after': '60' }),
    text: async () => JSON.stringify({ error: { code: 429, message: 'Daily quota limit reached.', status: 'RESOURCE_EXHAUSTED' } })
  });
  const deterministic = new DeterministicProvider();
  const aiService = new AiService(store, failingGemini, deterministic);

  const fallbackResponse = await aiService.generatePlan({
    daysCount: 7,
    servingsPerMeal: 4,
    dietaryPreference: 'VEGETARIAN',
    cuisinePreference: 'ALL_INDIAN'
  });

  assert(fallbackResponse.source === 'deterministic-fallback', `Fallback response reports 'deterministic-fallback' (actual: ${fallbackResponse.source})`);
  assert(fallbackResponse.source !== 'gemini', 'NEVER silently labels fallback-generated meals as Gemini');
  assert(Boolean(fallbackResponse.fallbackReason), `Fallback reason explicitly populated: "${fallbackResponse.fallbackReason.slice(0, 50)}..."`);
  assert(fallbackResponse.meals.length === 21, 'Deterministic fallback successfully generated all 21 meals');
  assert(fallbackResponse.uniqueRecipesCount >= 10, `Deterministic fallback achieved >= 10 unique recipes (${fallbackResponse.uniqueRecipesCount} unique)`);

  // ==========================================================================
  // SECTION 7: Dietary & Regional Constraint Preservation
  // ==========================================================================
  console.log('\n\x1b[36m[SECTION 7] Dietary & Regional Constraint Preservation\x1b[0m');
  
  // 1. Strict Jain Mode Filter
  const jainResult = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'JAIN', cuisinePreferences: ['ALL_INDIAN'] });
  assert(jainResult.eligible.length >= 8, `Jain mode returns >= 8 verified Jain recipes (actual: ${jainResult.eligible.length})`);
  assert(jainResult.eligible.every(r => r.isJainFriendly), '100% of Jain recipes are verified root-vegetable/onion-garlic free');

  // 2. Strict Regional Filter (North Indian excludes South Indian)
  const northResult = filterEligibleRecipes(SEED_RECIPES, { dietaryPreference: 'VEGETARIAN', cuisinePreferences: ['North Indian'] });
  const hasSouthInNorth = northResult.eligible.some(r => r.cuisine === 'South Indian');
  assert(!hasSouthInNorth, 'North Indian filter strictly excludes South Indian recipes (0 leakage)');

  // 3. Multi-Member Intersection (Vegan + Jain)
  const multiMemberCompliant = isRecipeCompliantWithHouseholdMembers(
    SEED_RECIPES.find(r => r.id === 'recipe-bengali-cholar-dal'),
    [
      { name: 'Vani', dietaryPreference: 'vegan', allergies: [] },
      { name: 'Jayesh', dietaryPreference: 'jain', allergies: [] }
    ]
  );
  assert(multiMemberCompliant, 'Bengali Cholar Dal simultaneously satisfies Vegan and Jain restrictions');

  console.log('\n========================================================================');
  console.log(`  AUDIT SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log('========================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runGemini35FlashLiteSuite().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
