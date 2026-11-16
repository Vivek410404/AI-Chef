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

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // When accessed from LAN IP or second device, use relative /api proxy
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api';
    }
  }
  return 'http://localhost:4000/api';
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rasoi_auth_token') : null;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
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
  async register(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
    acceptTerms: boolean;
  }) {
    return fetchJson<{ success: boolean; message: string; emailPreviewUrl?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async verifyEmail(token: string) {
    const res = await fetchJson<{ success: boolean; message: string; token?: string; user?: any }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    if (res?.token && typeof window !== 'undefined') {
      localStorage.setItem('rasoi_auth_token', res.token);
    }
    return res;
  },

  async resendVerification(email: string) {
    return fetchJson<{ success: boolean; message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async forgotPassword(email: string) {
    return fetchJson<{ success: boolean; message: string; emailPreviewUrl?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token: string, newPassword: string, confirmPassword?: string) {
    return fetchJson<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword })
    });
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword?: string) {
    return fetchJson<{ success: boolean; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
  },

  async getMe() {
    return fetchJson<{ user: any; memberships: any[] }>('/auth/me');
  },

  async getSessions() {
    return fetchJson<{ sessions: any[] }>('/auth/sessions');
  },

  async revokeSession(sessionId: string) {
    return fetchJson<{ success: boolean; message: string }>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE'
    });
  },

  async logoutAll() {
    return fetchJson<{ success: boolean; message: string }>('/auth/logout-all', {
      method: 'POST'
    });
  },

  async getDemoSession(role: 'CUSTOMER' | 'RETAILER' | 'ADMIN' = 'CUSTOMER', body?: any) {
    const res = await fetchJson<{ token: string; user: any }>('/auth/demo-session', {
      method: 'POST',
      body: JSON.stringify({ role, ...(body || {}) })
    });
    if (res?.token && typeof window !== 'undefined') {
      localStorage.setItem('rasoi_auth_token', res.token);
    }
    return res;
  },

  async login(email: string, password?: string) {
    const res = await fetchJson<{ token: string; user: any; refreshToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res?.token && typeof window !== 'undefined') {
      localStorage.setItem('rasoi_auth_token', res.token);
    }
    return res;
  },

  async logout() {
    try {
      await fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network failure on logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rasoi_auth_token');
      }
    }
  },

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rasoi_auth_token');
    }
    return null;
  },

  // Households (Multi-Tenant & Invitations)
  async createHousehold(data: {
    name: string;
    country?: string;
    state?: string;
    city?: string;
    locality?: string;
    size?: number;
    dietaryPreference?: string;
    cuisinePreference?: string;
    weeklyBudgetInr?: number;
  }): Promise<Household> {
    return fetchJson<Household>('/households', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMyHouseholds(): Promise<Household[]> {
    return fetchJson<Household[]>('/households/my');
  },

  async createInvitation(householdId: string, invitedEmail: string, role: 'MEMBER' | 'COOK' = 'MEMBER') {
    return fetchJson<{ success: boolean; invitation: any; emailPreviewUrl?: string }>(`/households/${householdId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ invitedEmail, role })
    });
  },

  async getInvitations(householdId: string) {
    return fetchJson<{ invitations: any[] }>(`/households/${householdId}/invitations`);
  },

  async revokeInvitation(householdId: string, invitationId: string) {
    return fetchJson<{ success: boolean }>(`/households/${householdId}/invitations/${invitationId}`, {
      method: 'DELETE'
    });
  },

  async validateInvitation(token: string) {
    return fetchJson<{ valid: boolean; householdName: string; role: string; invitedEmail: string }>(`/households/invitations/validate?token=${encodeURIComponent(token)}`);
  },

  async acceptInvitation(token: string) {
    return fetchJson<{ success: boolean; message: string; household: Household }>('/households/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  // Retailer Application
  async applyRetailer(data: {
    businessName: string;
    contactName: string;
    contactPhone: string;
    operatingCities: string[];
    catalogSizeEstimate?: number;
  }) {
    return fetchJson<{ success: boolean; message: string; application: any }>('/marketplace/retailer/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getRetailerApplicationStatus() {
    return fetchJson<{ hasApplication: boolean; application?: any }>('/marketplace/retailer/application/status');
  },

  // Health
  async getHealth() {
    return fetchJson<any>('/health');
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

  async getMaharajSummary(day: DayOfWeek = 'monday', householdId?: string): Promise<any> {
    const query = new URLSearchParams({ day, ...(householdId ? { householdId } : {}) });
    return fetchJson<any>(`/meal-plans/maharaj-summary?${query.toString()}`);
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
