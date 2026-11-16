import { AIPlanGenerationPrompt, AIPlanGenerationResponse, Recipe } from '@rasoi/shared-types';

export interface IAiPlannerProvider {
  name: string;
  generateMealPlan(
    prompt: AIPlanGenerationPrompt,
    availableRecipes: Recipe[]
  ): Promise<AIPlanGenerationResponse>;
}
