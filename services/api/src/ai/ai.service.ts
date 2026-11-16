import { Injectable, Logger } from '@nestjs/common';
import { AIPlanGenerationPrompt, AIPlanGenerationResponse } from '@rasoi/shared-types';
import { StoreService } from '../data/store.service';
import { GeminiProvider } from './gemini.provider';
import { DeterministicProvider } from './deterministic.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  // Rolling generation history per household to penalize repeats across consecutive generations
  private recentPlanHistory: Map<string, string[]> = new Map();

  constructor(
    private readonly store: StoreService,
    private readonly geminiProvider: GeminiProvider,
    private readonly deterministicProvider: DeterministicProvider
  ) {}

  async generatePlan(prompt: AIPlanGenerationPrompt): Promise<AIPlanGenerationResponse> {
    const householdId = prompt.householdId;
    const household = householdId ? this.store.households.get(householdId) : undefined;

    // Retrieve active plan recipe IDs
    const activePlanItems = householdId ? (this.store.mealPlanItems.get(householdId) || []) : [];
    const activeRecipeIds = activePlanItems.map(i => i.recipeId);

    // Retrieve recent generation history for this household (keep max 5 most recent to prevent catalog starvation)
    const historyRecipeIds = householdId ? (this.recentPlanHistory.get(householdId) || []) : [];
    const trimmedHistory = historyRecipeIds.slice(0, 5);

    // Combine recent recipe IDs to avoid immediate repeats
    const combinedRecent = Array.from(new Set([...activeRecipeIds, ...trimmedHistory]));
    
    // Enrich prompt with household defaults (Default: Vegetarian + All Indian) and member restrictions
    const enrichedPrompt: AIPlanGenerationPrompt = {
      ...prompt,
      dietaryPreference: prompt.dietaryPreference || household?.dietaryPreference || 'VEGETARIAN',
      cuisinePreference: prompt.cuisinePreference || household?.cuisinePreference || 'ALL_INDIAN',
      cuisinePreferences: prompt.cuisinePreferences?.length
        ? prompt.cuisinePreferences
        : [prompt.cuisinePreference || household?.cuisinePreference || 'ALL_INDIAN'],
      members: prompt.members !== undefined ? prompt.members : household?.members,
      recentRecipeIds: prompt.recentRecipeIds !== undefined ? prompt.recentRecipeIds : combinedRecent
    };

    const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');

    const historyKey = householdId || 'default-session';

    if (hasApiKey) {
      this.logger.log(`[AiService] Provider selected: gemini. Request initiated with ${enrichedPrompt.recentRecipeIds?.length || 0} history recipes to avoid.`);
      try {
        const response = await this.geminiProvider.generateMealPlan(enrichedPrompt, this.store.recipes);
        
        // Record newly generated recipe IDs in sliding history
        this.updateHistory(historyKey, response.meals.map(m => m.recipeId));
        return response;
      } catch (err: any) {
        const fallbackReason = err.message || 'Unknown error';
        this.logger.warn(`[AiService] Fallback activated. Reason: ${fallbackReason}. Seamlessly switching to deterministic engine.`);

        const fallbackResponse = await this.deterministicProvider.generateMealPlan(enrichedPrompt, this.store.recipes);
        fallbackResponse.fallbackReason = fallbackReason;
        this.updateHistory(historyKey, fallbackResponse.meals.map(m => m.recipeId));
        return fallbackResponse;
      }
    } else {
      this.logger.log('[AiService] Provider selected: deterministic-fallback. Reason: GEMINI_API_KEY not configured.');
      const response = await this.deterministicProvider.generateMealPlan(enrichedPrompt, this.store.recipes);
      response.fallbackReason = 'GEMINI_API_KEY not configured';
      this.updateHistory(historyKey, response.meals.map(m => m.recipeId));
      return response;
    }
  }

  // Update sliding window of recent recipes (max 21 items)
  private updateHistory(householdId: string, newRecipeIds: string[]) {
    const existing = this.recentPlanHistory.get(householdId) || [];
    const updated = Array.from(new Set([...newRecipeIds, ...existing])).slice(0, 21);
    this.recentPlanHistory.set(householdId, updated);
  }

  // Helper for tests to clear history
  clearHistory(householdId = 'hh-sharma-family') {
    this.recentPlanHistory.delete(householdId);
  }
}
