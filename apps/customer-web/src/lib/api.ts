import {
  Recipe,
  Household,
  MealPlanItem,
  ScaledIngredientRequirement,
  GroceryBasket,
  PantryItem,
  AIPlanGenerationPrompt,
  AIPlanGenerationResponse,
  Retailer,
  AISuggestedMeal,
  DayOfWeek,
  MealCategory
} from '@rasoi/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`Fetch error for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  async getDemoSession() {
    return fetchJson<{ token: string; user: any }>('/auth/demo-session', { method: 'POST' });
  },

  // Household
  async getHousehold(): Promise<Household> {
    return fetchJson<Household>('/households/me');
  },

  async updateHousehold(updates: Partial<Household>): Promise<Household> {
    return fetchJson<Household>('/households/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Recipes
  async getRecipes(params?: Record<string, string>): Promise<Recipe[]> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return fetchJson<Recipe[]>(`/recipes${query}`);
  },

  async getRecipe(id: string): Promise<Recipe> {
    return fetchJson<Recipe>(`/recipes/${id}`);
  },

  // Meal Plans
  async getCurrentPlan(): Promise<MealPlanItem[]> {
    return fetchJson<MealPlanItem[]>('/meal-plans/current');
  },

  async addMealItem(data: {
    dayOfWeek: DayOfWeek;
    mealCategory: MealCategory;
    recipeId: string;
    servings?: number;
  }): Promise<MealPlanItem> {
    return fetchJson<MealPlanItem>('/meal-plans/item', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateMealItem(id: string, data: { servings?: number; recipeId?: string }): Promise<MealPlanItem> {
    return fetchJson<MealPlanItem>(`/meal-plans/item/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async removeMealItem(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/meal-plans/item/${id}`, {
      method: 'DELETE'
    });
  },

  async applyAiPlan(meals: AISuggestedMeal[]): Promise<MealPlanItem[]> {
    return fetchJson<MealPlanItem[]>('/meal-plans/apply-ai-plan', {
      method: 'POST',
      body: JSON.stringify({ meals })
    });
  },

  async clearPlan(): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/meal-plans/clear', {
      method: 'POST'
    });
  },

  // Grocery & Basket
  async getRequirements(): Promise<ScaledIngredientRequirement[]> {
    return fetchJson<ScaledIngredientRequirement[]>('/grocery/requirements');
  },

  async getBasket(retailerId?: string): Promise<GroceryBasket> {
    const query = retailerId ? `?retailerId=${retailerId}` : '';
    return fetchJson<GroceryBasket>(`/grocery/basket${query}`);
  },

  async toggleBasketItem(ingredientId: string, isSelected: boolean): Promise<GroceryBasket> {
    return fetchJson<GroceryBasket>('/grocery/basket/toggle', {
      method: 'POST',
      body: JSON.stringify({ ingredientId, isSelected })
    });
  },

  async swapBasketVariant(ingredientId: string, variantId: string): Promise<GroceryBasket> {
    return fetchJson<GroceryBasket>('/grocery/basket/swap-variant', {
      method: 'PUT',
      body: JSON.stringify({ ingredientId, variantId })
    });
  },

  async updateBasketPacks(ingredientId: string, packs: number): Promise<GroceryBasket> {
    return fetchJson<GroceryBasket>('/grocery/basket/update-packs', {
      method: 'PUT',
      body: JSON.stringify({ ingredientId, packs })
    });
  },

  // Pantry
  async getPantry(): Promise<PantryItem[]> {
    return fetchJson<PantryItem[]>('/pantry');
  },

  async updatePantryItem(data: { ingredientId: string; quantity: number; unit: string; isLowStock?: boolean }): Promise<PantryItem> {
    return fetchJson<PantryItem>('/pantry', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async removePantryItem(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/pantry/${id}`, {
      method: 'DELETE'
    });
  },

  // Marketplace & Retailers
  async getRetailers(): Promise<Retailer[]> {
    return fetchJson<Retailer[]>('/marketplace/retailers');
  },

  async getOrders(): Promise<any[]> {
    return fetchJson<any[]>('/marketplace/orders');
  },

  async checkout(data: { retailerId: string; items: any[]; totalInr: number; deliveryAddress?: string }) {
    return fetchJson<any>('/marketplace/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // AI
  async generateAiPlan(promptData: AIPlanGenerationPrompt): Promise<AIPlanGenerationResponse> {
    return fetchJson<AIPlanGenerationResponse>('/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify(promptData)
    });
  }
};
