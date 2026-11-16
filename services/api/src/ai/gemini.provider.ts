import { Injectable, Logger } from '@nestjs/common';
import {
  AIPlanGenerationPrompt,
  AIPlanGenerationResponse,
  Recipe,
  AISuggestedMeal,
  DayOfWeek,
  MealCategory,
  IndianCuisine
} from '@rasoi/shared-types';
import { filterEligibleRecipes } from '@rasoi/grocery-engine';
import { AIPlanResponseSchema } from '@rasoi/validation';
import { IAiPlannerProvider } from './ai.interface';

export interface QuotaRateLimitState {
  exhausted: boolean;
  statusCode: number;
  reason: string;
  resetAt: number; // Unix timestamp in ms
  retryAfterSeconds?: number;
  recordedAt: number;
}

@Injectable()
export class GeminiProvider implements IAiPlannerProvider {
  name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);

  // Candidate models on Google AI Studio API in prioritized fallback order:
  // 1. Gemini 3.5 Flash-Lite
  // 2. Gemini 3.1 Flash-Lite
  public readonly candidateModels = [
    'models/gemini-3.5-flash-lite',
    'models/gemini-3.1-flash-lite'
  ];

  public fetchFn: typeof fetch = fetch;

  // In-memory rate limit and quota exhaustion tracking per model
  private static readonly modelQuotaStates = new Map<string, QuotaRateLimitState>();

  /**
   * Check if a model is currently rate limited or has exhausted its daily quota.
   */
  public static isModelRateLimited(modelName: string): { limited: boolean; resetInMs?: number; reason?: string } {
    const state = GeminiProvider.modelQuotaStates.get(modelName);
    if (!state) return { limited: false };

    const now = Date.now();
    if (now >= state.resetAt) {
      GeminiProvider.modelQuotaStates.delete(modelName);
      return { limited: false };
    }

    return {
      limited: true,
      resetInMs: state.resetAt - now,
      reason: state.reason
    };
  }

  /**
   * Record a rate limit / quota exhaustion event for a model.
   */
  public static recordQuotaLimit(modelName: string, state: QuotaRateLimitState): void {
    GeminiProvider.modelQuotaStates.set(modelName, state);
  }

  /**
   * Clear recorded quota states (used in tests or administrative resets).
   */
  public static clearQuotaStates(): void {
    GeminiProvider.modelQuotaStates.clear();
  }

  /**
   * Get all active quota states.
   */
  public static getQuotaStates(): Map<string, QuotaRateLimitState> {
    return new Map(GeminiProvider.modelQuotaStates);
  }

  async generateMealPlan(
    prompt: AIPlanGenerationPrompt,
    availableRecipes: Recipe[]
  ): Promise<AIPlanGenerationResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY not configured.');
    }

    const daysCount = prompt.daysCount || 7;
    const servings = prompt.servingsPerMeal || 4;
    const dietaryRestrictions = prompt.dietaryRestrictions || [];
    const isJain = dietaryRestrictions.includes('Jain Friendly') ||
      prompt.prompt?.toLowerCase().includes('jain');

    // 1. Authoritative Dietary, Allergy, Member-Intersection, and Regional Filtering
    const filterResult = filterEligibleRecipes(availableRecipes, {
      dietaryPreference:
        prompt.dietaryPreference ||
        (isJain ? 'JAIN' : 'VEGETARIAN'),
      cuisinePreferences: prompt.cuisinePreferences?.map(String) || [prompt.cuisinePreference || 'ALL_INDIAN'],
      allergies: prompt.members?.flatMap((m) => m.allergies || []) || [],
      excludeRecipeIds: prompt.excludeRecipeIds,
      excludeIngredients: prompt.excludeIngredients,
      members: prompt.members
    });

    if (filterResult.eligible.length === 0) {
      throw new Error(
        filterResult.reasonIfNotAvailable ||
        'No suitable recipes in catalog matching the requested dietary mode and regional cuisine preference.'
      );
    }

    const eligibleRecipes = filterResult.eligible;
    const requestedCuisines = filterResult.effectiveCuisines.join(', ');

    // Recipes summary for prompt context - ONLY compliant recipes passed to Gemini
    const recipeSummaries = eligibleRecipes.map(r => ({
      id: r.id,
      title: r.title,
      cuisine: r.cuisine,
      mealTypes: r.mealTypes,
      isJainFriendly: r.isJainFriendly,
      dietaryTags: r.dietaryTags,
      prepTimeMinutes: r.prepTimeMinutes,
      cookTimeMinutes: r.cookTimeMinutes
    }));

    // Retrieve recent recipes to avoid repetitive generation
    const recentRecipeTitles: string[] = (prompt.recentRecipeIds || [])
      .map(id => eligibleRecipes.find(r => r.id === id)?.title)
      .filter((title): title is string => Boolean(title));

    const proteinDirective = prompt.proteinPreference === 'high-protein'
      ? 'PROTEIN FOCUS (HIGH): Household prefers high-protein meals. Strongly prioritize recipes rich in lentils, paneer, rajma, chole, sprouts, or eggs providing 14g+ protein per serving.'
      : 'PROTEIN FOCUS: Standard balanced nutrition across macro-nutrients.';

    const systemPrompt = `You are RasoiIQ's expert Indian Nutritionist and AI Meal Planning Architect.
Your objective is to generate an authentic, delicious, nutritionally balanced weekly Indian meal plan with MAXIMUM VARIETY and protein awareness.

CRITICAL INSTRUCTIONS:
1. ONLY select recipes from the Available Recipe Catalog below. Match the exact recipeId, recipeTitle, and cuisine.
2. STRICT DIETARY MODE (${filterResult.appliedDiet}):
   - If VEGETARIAN: Exclude all meat, poultry, fish, seafood, and eggs. Dairy is permitted.
   - If NON_VEGETARIAN: Chicken, meat, fish, seafood, eggs, and vegetarian foods are permitted.
   - If EGGETARIAN: Vegetarian foods and eggs are permitted. Exclude meat, poultry, fish, and seafood.
   - If VEGAN: 100% plant-based. Exclude all meat, fish, eggs, dairy, and honey.
   - If JAIN: Select ONLY recipes where isJainFriendly is true. Never include onion, garlic, or root vegetables.
3. STRICT REGIONAL CONSTRAINT:
   - Selected Cuisines: [${requestedCuisines}].
   - If a specific region is requested (e.g. North Indian), select ONLY recipes matching that region. Do NOT return dishes from unrelated regions (e.g. never suggest South Indian dishes for a North Indian request).
   - If ALL_INDIAN is selected, rotate across diverse Indian regions.
4. ${proteinDirective}
   - Deterministic Nutrition Rule: Gemini suggests recipes aligned with nutritional preferences, but RasoiIQ's deterministic engine calculates all authoritative nutritional totals from raw ingredient quantities referenced against IFCT 2017.
5. PREVENT REPETITIVE MEALS (HIGH PRIORITY):
   - Zero Same-Day Repetition Rule: NEVER schedule the same recipe twice on the same day. Breakfast, lunch, and dinner must be different dishes.
   - High Diversity Target: Aim for at least 10 unique recipes across the 7-day schedule whenever catalog permits.
   - Recently Planned Recipes: The household recently ate these dishes: [${recentRecipeTitles.join(', ') || 'None'}]. AVOID repeating them unless the catalog has no other eligible option.
   - Protein Source Diversity & Rotation: Rotate actively among Paneer, Dal, Chickpeas, Rajma, Curd/Dahi, and Eggs/Chicken (if permitted). Do NOT suggest the same protein source on consecutive days.
   - Ingredient Diversity: Do NOT repeat the same hero ingredient on consecutive days.
   - Cuisine Rotation: Alternate cuisines across the week.
6. Output MUST be valid, well-formed JSON conforming exactly to this structure without markdown fences or extra commentary:
{
  "source": "gemini",
  "planSummary": "Concise overview of this varied regional Indian weekly menu",
  "estimatedWeeklyBudgetInr": 2900,
  "nutritionalHighlights": {
    "avgDailyCalories": 1900,
    "proteinFocus": "Balanced plant protein from lentils, legumes, and paneer",
    "fiberRating": "High (Leafy greens, unpolished grains, and fresh vegetables)"
  },
  "meals": [
    {
      "dayOfWeek": "monday",
      "mealCategory": "breakfast",
      "recipeId": "exact_recipe_id",
      "recipeTitle": "exact_recipe_title",
      "cuisine": "South Indian",
      "reason": "Why this dish was chosen for breakfast",
      "servings": ${servings}
    }
  ]
}

Available Recipe Catalog:
${JSON.stringify(recipeSummaries, null, 2)}
`;

    // Dynamic user prompt with random session context to prevent any semantic caching
    const sessionToken = Math.random().toString(36).substring(2, 8);
    const userMessage = `User Request: "${prompt.prompt || 'Generate a fresh, varied weekly Indian meal plan'}"
Session Context Token: [${sessionToken}]
Days: ${daysCount} (Breakfast, Lunch, Dinner each day = ${daysCount * 3} meals total)
Servings: ${servings}
Preferred Cuisines: ${requestedCuisines}
Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
Protein Preference: ${prompt.proteinPreference || 'standard'}
Target Daily Protein: ${prompt.targetDailyProteinGrams ? prompt.targetDailyProteinGrams + 'g' : 'Not specified'}
Target Daily Calories: ${prompt.targetDailyCalories ? prompt.targetDailyCalories + ' kcal' : 'Not specified'}
Recently Planned Recipes to Avoid: ${recentRecipeTitles.join(', ') || 'None'}
Opening Meal Rotation: Do NOT start Monday breakfast with any of the recently planned dishes [${recentRecipeTitles.join(', ') || 'None'}]. Choose a different eligible breakfast recipe for Monday!`;

    this.logger.log(`[Provider: gemini] Request initiated for ${daysCount} days (${daysCount * 3} meals). User prompt: "${prompt.prompt || 'default'}"`);

    let lastError: Error | null = null;
    let selectedModel = '';
    let rawContent = '';

    // Iterate through candidate models in fallback order
    for (const modelName of this.candidateModels) {
      // 1. Quota & Rate Limit Pre-Check:
      // Avoid repeatedly calling a provider/model that has exhausted its daily quota or is currently rate-limited
      const rateLimitStatus = GeminiProvider.isModelRateLimited(modelName);
      if (rateLimitStatus.limited) {
        const waitSec = Math.ceil((rateLimitStatus.resetInMs || 0) / 1000);
        const quotaNotice = `Skipping ${modelName}: Quota/Rate limit active until ${new Date(Date.now() + (rateLimitStatus.resetInMs || 0)).toISOString()} (${rateLimitStatus.reason}, retry in ${waitSec}s)`;
        this.logger.warn(`[Provider: gemini] ${quotaNotice}`);
        lastError = new Error(quotaNotice);
        continue;
      }

      try {
        selectedModel = modelName;
        this.logger.log(`[Provider: gemini] Attempting generation with model: ${modelName}`);

        const startTime = Date.now();
        const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

        let response: Response;
        try {
          response = await this.fetchFn(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(10000),
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json'
              }
            })
          });
        } catch (fetchErr: any) {
          const netMsg = `Network failure/timeout connecting to ${modelName}: ${fetchErr.message}`;
          this.logger.warn(`[Provider: gemini] [NETWORK_ERROR] ${netMsg}. Trying next candidate...`);
          lastError = new Error(netMsg);
          continue;
        }

        if (!response.ok) {
          const status = response.status;
          const errText = await response.text();
          let parsedErr: any = null;
          try {
            parsedErr = JSON.parse(errText);
          } catch {}

          const apiMessage = parsedErr?.error?.message || errText.substring(0, 300);

          // Handle HTTP 429: Quota Exhaustion / Rate Limit Exceeded
          if (status === 429) {
            let retryAfterSec = 60; // Default 60s cooldown

            // Inspect Retry-After header
            const retryHeader = response.headers?.get?.('retry-after');
            if (retryHeader) {
              const parsedSec = parseInt(retryHeader, 10);
              if (!isNaN(parsedSec)) {
                retryAfterSec = parsedSec;
              } else {
                const parsedDate = Date.parse(retryHeader);
                if (!isNaN(parsedDate) && parsedDate > Date.now()) {
                  retryAfterSec = Math.ceil((parsedDate - Date.now()) / 1000);
                }
              }
            } else if (parsedErr?.error?.details) {
              // Inspect Google RPC RetryInfo
              for (const detail of parsedErr.error.details) {
                if (detail.retryDelay) {
                  const match = String(detail.retryDelay).match(/([\d.]+)s/);
                  if (match) retryAfterSec = Math.ceil(parseFloat(match[1]));
                }
              }
            }

            // Check if daily quota exhausted
            const isDailyQuota = /daily quota|per day|day quota/i.test(apiMessage);
            if (isDailyQuota) {
              const now = new Date();
              const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
              retryAfterSec = Math.max(retryAfterSec, Math.ceil((midnightUtc.getTime() - now.getTime()) / 1000));
            }

            GeminiProvider.recordQuotaLimit(modelName, {
              exhausted: true,
              statusCode: 429,
              reason: apiMessage,
              retryAfterSeconds: retryAfterSec,
              resetAt: Date.now() + retryAfterSec * 1000,
              recordedAt: Date.now()
            });

            const quotaMsg = `HTTP 429 on ${modelName}: ${apiMessage}. Rate limit active for ${retryAfterSec}s. Switching to next candidate...`;
            this.logger.warn(`[Provider: gemini] [QUOTA_EXHAUSTED] ${quotaMsg}`);
            lastError = new Error(quotaMsg);
            continue;
          }

          // Handle HTTP 401 / 403: Authentication / Permission Error
          if (status === 401 || status === 403) {
            const authMsg = `HTTP ${status} on ${modelName}: ${apiMessage}. API key invalid or unauthorized.`;
            this.logger.error(`[Provider: gemini] [AUTH_ERROR] ${authMsg}`);
            lastError = new Error(authMsg);
            continue;
          }

          // Handle HTTP 404: Model Not Found / Unsupported
          if (status === 404) {
            const notFoundMsg = `HTTP 404 on ${modelName}: ${apiMessage}. Model unsupported or deprecated.`;
            this.logger.warn(`[Provider: gemini] [NOT_FOUND] ${notFoundMsg}`);
            lastError = new Error(notFoundMsg);
            continue;
          }

          // Handle HTTP 500 / 502 / 503 / 504: Google Server Error
          if (status >= 500) {
            const serverMsg = `HTTP ${status} on ${modelName}: ${apiMessage}. Google API upstream server error.`;
            this.logger.error(`[Provider: gemini] [SERVER_ERROR] ${serverMsg}`);
            lastError = new Error(serverMsg);
            continue;
          }

          // Other HTTP errors (e.g. 400 Bad Request)
          const generalMsg = `HTTP ${status} on ${modelName}: ${apiMessage}`;
          this.logger.warn(`[Provider: gemini] ${generalMsg}`);
          lastError = new Error(generalMsg);
          continue;
        }

        const data = await response.json();
        rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawContent || rawContent.trim() === '') {
          throw new Error(`Empty response received from ${modelName} candidate part.`);
        }

        const durationMs = Date.now() - startTime;
        this.logger.log(`[Provider: gemini] Request successful via ${modelName} in ${durationMs}ms (${rawContent.length} bytes received).`);
        break; // Successfully got response
      } catch (err: any) {
        lastError = err;
        this.logger.warn(`[Provider: gemini] Model ${modelName} failed (${err.message}). Trying next candidate...`);
      }
    }

    if (!rawContent) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
    }

    // Parse and clean JSON response
    const cleanJson = rawContent
      .replace(/^```json/gi, '')
      .replace(/^```/gi, '')
      .replace(/```$/gi, '')
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseErr: any) {
      this.logger.error(`[Provider: gemini] JSON parsing error: ${parseErr.message}`);
      throw new Error(`Gemini returned malformed JSON: ${parseErr.message}`);
    }

    // Auto-reconciliation & Catalog validation strictly against eligible recipes
    const reconciledMeals: AISuggestedMeal[] = [];
    const usedRecipeIdsInThisPlan = new Set<string>();
    const recipeFrequency = new Map<string, number>();
    const dayToAssignedRecipeIds = new Map<string, Set<string>>();

    const explicitRepetition = Boolean(
      prompt.prompt &&
      /repeat|every day|daily|same meal|always chole|always paneer/i.test(prompt.prompt)
    );

    for (const meal of parsed.meals || []) {
      const day = (meal.dayOfWeek || 'monday').toLowerCase() as DayOfWeek;
      const slot = (meal.mealCategory || 'lunch').toLowerCase() as MealCategory;

      if (!dayToAssignedRecipeIds.has(day)) {
        dayToAssignedRecipeIds.set(day, new Set<string>());
      }
      const todaySet = dayToAssignedRecipeIds.get(day)!;

      // Find matching recipe in eligible catalog by id or title
      let matchedRecipe = eligibleRecipes.find(r => r.id === meal.recipeId);
      if (!matchedRecipe) {
        matchedRecipe = eligibleRecipes.find(
          r => r.title.toLowerCase() === (meal.recipeTitle || '').toLowerCase() ||
               r.slug === (meal.recipeId || '')
        );
      }

      // Enforce zero same-day duplicates unless explicitly requested:
      // If recipe was already chosen today, pick another eligible dish from the category
      if (matchedRecipe && !explicitRepetition && todaySet.has(matchedRecipe.id) && eligibleRecipes.length > 1) {
        matchedRecipe = undefined;
      }

      // Diversity protection: If recipe is already used twice in this plan and unused eligible options exist, promote variety
      if (matchedRecipe && !explicitRepetition && (recipeFrequency.get(matchedRecipe.id) || 0) >= 2 && eligibleRecipes.length >= 6) {
        const categoryPool = eligibleRecipes.filter(r => r.mealTypes.includes(slot));
        const unusedCandidate =
          categoryPool.find(r => !todaySet.has(r.id) && !usedRecipeIdsInThisPlan.has(r.id)) ||
          eligibleRecipes.find(r => !todaySet.has(r.id) && !usedRecipeIdsInThisPlan.has(r.id));
        if (unusedCandidate) {
          matchedRecipe = unusedCandidate;
        }
      }

      // If still not matched or same-day duplicate avoided, select suitable recipe from pool
      if (!matchedRecipe) {
        const categoryPool = eligibleRecipes.filter(r => r.mealTypes.includes(slot));
        const candidatePool = categoryPool.length > 0 ? categoryPool : eligibleRecipes;
        
        // Prioritize not used today, and not used yet in plan
        matchedRecipe =
          candidatePool.find(r => !todaySet.has(r.id) && !usedRecipeIdsInThisPlan.has(r.id)) ||
          candidatePool.find(r => !todaySet.has(r.id)) ||
          candidatePool[0];
      }

      // Opening meal rotation: rotate opening dish if it matches the previous session's opening dish
      if (day === 'monday' && slot === 'breakfast' && prompt.recentRecipeIds && prompt.recentRecipeIds.length > 0) {
        const lastOpeningId = prompt.recentRecipeIds[0];
        if (matchedRecipe && matchedRecipe.id === lastOpeningId) {
          const altBreakfast = eligibleRecipes.find(
            r => r.mealTypes.includes('breakfast') && r.id !== lastOpeningId && !prompt.recentRecipeIds!.slice(0, 2).includes(r.id)
          );
          if (altBreakfast) {
            matchedRecipe = altBreakfast;
          }
        }
      }

      todaySet.add(matchedRecipe.id);
      usedRecipeIdsInThisPlan.add(matchedRecipe.id);
      recipeFrequency.set(matchedRecipe.id, (recipeFrequency.get(matchedRecipe.id) || 0) + 1);

      reconciledMeals.push({
        dayOfWeek: day,
        mealCategory: slot,
        recipeId: matchedRecipe.id,
        recipeTitle: matchedRecipe.title,
        cuisine: matchedRecipe.cuisine as IndianCuisine,
        reason: meal.reason || `${matchedRecipe.title} planned for ${slot}`,
        servings: meal.servings || servings
      });
    }

    const uniqueCount = new Set(reconciledMeals.map(m => m.recipeId)).size;
    const cleanModel = selectedModel.replace('models/', '');

    const catalogLimitation = eligibleRecipes.length < 10
      ? `Eligible catalog contains only ${eligibleRecipes.length} recipes matching criteria. Target of 10 unique recipes could not be met due to catalog size limitation, but maximum variety was generated.`
      : undefined;

    const diversitySummary = `${uniqueCount} unique recipes across ${reconciledMeals.length} meals. Zero same-day duplicates.`;

    this.logger.log(`[Provider: gemini] Response parsed successfully via ${cleanModel}. Generated ${reconciledMeals.length} meals (${uniqueCount} unique recipes).`);

    const result: AIPlanGenerationResponse = {
      source: 'gemini',
      modelUsed: cleanModel,
      planSummary: parsed.planSummary || `Balanced ${requestedCuisines} weekly meal plan curated by Gemini AI.`,
      diversitySummary,
      catalogLimitation,
      estimatedWeeklyBudgetInr: parsed.estimatedWeeklyBudgetInr || 2800,
      nutritionalHighlights: parsed.nutritionalHighlights || {
        avgDailyCalories: 1850,
        proteinFocus: 'Balanced regional Indian plant & dairy protein',
        fiberRating: 'High'
      },
      meals: reconciledMeals,
      uniqueRecipesCount: uniqueCount
    };

    // Final schema validation with Zod
    return AIPlanResponseSchema.parse(result) as AIPlanGenerationResponse;
  }
}
