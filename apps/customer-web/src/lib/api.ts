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
  if (typeof window !== 'undefined') {
    // In browser, always use relative /api proxy to avoid CORS and Incognito cookie partitioning
    return '/api';
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return process.env.INTERNAL_API_URL || 'http://localhost:4000/api';
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)rasoi_csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfPromise: Promise<string | null> | null = null;

async function getOrFetchCsrfToken(): Promise<string | null> {
  const existing = getCsrfTokenFromCookie();
  if (existing) return existing;
  if (typeof window === 'undefined') return null;

  if (!csrfPromise) {
    csrfPromise = (async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/auth/csrf`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          return data?.csrfToken || getCsrfTokenFromCookie();
        }
      } catch {}
      return getCsrfTokenFromCookie();
    })().finally(() => {
      csrfPromise = null;
    });
  }
  return await csrfPromise;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function fetchJson<T>(endpoint: string, options?: RequestInit, isRetry = false): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  try {
    const method = (options?.method || 'GET').toUpperCase();
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const csrfToken = isStateChanging ? await getOrFetchCsrfToken() : null;

    const csrfHeaders: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest'
    };
    if (csrfToken) {
      csrfHeaders['X-CSRF-Token'] = csrfToken;
    }

    const res = await fetch(url, {
      ...options,
      credentials: 'include', // Ensure HttpOnly cookies are automatically and consistently sent
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
        ...(options?.headers || {})
      }
    });

    if (
      res.status === 401 &&
      !isRetry &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/refresh') &&
      !endpoint.startsWith('/auth/logout')
    ) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = (async () => {
            try {
              const csrfForRefresh = await getOrFetchCsrfToken();
              const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest',
                  ...(csrfForRefresh ? { 'X-CSRF-Token': csrfForRefresh } : {})
                },
                body: JSON.stringify({})
              });
              return refreshRes.ok;
            } catch {
              return false;
            } finally {
              isRefreshing = false;
            }
          })();
        }
        const refreshed = await refreshPromise;
        if (refreshed) {
          return fetchJson<T>(endpoint, options, true);
        }
      } catch {
        // Refresh failed; proceed to throw 401
      }
    }

    if (!res.ok) {
      const errText = await res.text();
      let parsedMessage = errText;
      try {
        const json = JSON.parse(errText);
        parsedMessage = json.message || errText;
      } catch {}
      throw new Error(`API ${res.status}: ${parsedMessage}`);
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
    return fetchJson<{ success: boolean; message: string; user?: any }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
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
    const res = await fetchJson<any>('/auth/me');
    return {
      user: res?.user || res,
      memberships: res?.memberships || []
    };
  },

  async getProfile() {
    return fetchJson<any>('/auth/profile');
  },

  async updateProfile(data: { fullName?: string; phoneNumber?: string }) {
    return fetchJson<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async getSessions() {
    const res = await fetchJson<any>('/auth/sessions');
    return {
      sessions: res?.sessions || (Array.isArray(res) ? res : [])
    };
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
    return fetchJson<{ user: any }>('/auth/demo-session', {
      method: 'POST',
      body: JSON.stringify({ role, ...(body || {}) })
    });
  },

  async login(email: string, password?: string) {
    return fetchJson<{ user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async adminLogin(email: string, password: string) {
    return fetchJson<{
      requiresMfa: boolean;
      mfaSessionId: string;
      maskedEmail: string;
      expiresInSeconds: number;
    }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async adminVerifyOtp(mfaSessionId: string, otp: string) {
    return fetchJson<{ user: any }>('/auth/admin/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mfaSessionId, otp })
    });
  },

  async adminResendOtp(mfaSessionId: string) {
    return fetchJson<{ success: boolean; message: string }>('/auth/admin/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ mfaSessionId })
    });
  },

  async logout() {
    try {
      await fetchJson<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network failure on logout
    }
  },

  getAuthToken(): string | null {
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

  // Grocery Shop & Discovery (Phase 6.1)
  async getGroceryCategories(): Promise<any[]> {
    return fetchJson<any[]>('/grocery/categories');
  },

  async getGroceryProducts(params: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    retailerId?: string;
    available?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<any> {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.category) sp.set('category', params.category);
    if (params.brand) sp.set('brand', params.brand);
    if (params.minPrice !== undefined) sp.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) sp.set('maxPrice', String(params.maxPrice));
    if (params.retailerId) sp.set('retailerId', params.retailerId);
    if (params.available !== undefined) sp.set('available', String(params.available));
    if (params.sort) sp.set('sort', params.sort);
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJson<any>(`/grocery/products${qs}`);
  },

  async getProductBySlug(slug: string): Promise<any> {
    return fetchJson<any>(`/grocery/products/${encodeURIComponent(slug)}`);
  },

  async getSearchSuggestions(q: string): Promise<any[]> {
    if (!q || !q.trim()) return [];
    return fetchJson<any[]>(`/grocery/search/suggestions?q=${encodeURIComponent(q.trim())}`);
  },

  async addToCart(data: { productVariantId: string; quantity?: number; retailerId?: string }): Promise<any> {
    return fetchJson<any>('/grocery/cart/add', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async switchRetailer(retailerId: string): Promise<any> {
    return fetchJson<any>('/grocery/cart/switch-retailer', {
      method: 'POST',
      body: JSON.stringify({ retailerId })
    });
  },

  async updateCartItem(productVariantId: string, quantity: number): Promise<any> {
    return fetchJson<any>('/grocery/cart/update-item', {
      method: 'POST',
      body: JSON.stringify({ productVariantId, quantity })
    });
  },

  async removeCartItem(productVariantId: string): Promise<any> {
    return fetchJson<any>('/grocery/cart/remove-item', {
      method: 'POST',
      body: JSON.stringify({ productVariantId })
    });
  },

  async clearCart(): Promise<any> {
    return fetchJson<any>('/grocery/cart/clear', {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  async reorderOrder(data: { orderId: string; targetRetailerId?: string; replaceCart?: boolean }): Promise<any> {
    return fetchJson<any>('/grocery/cart/reorder', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getPantryRestockSuggestions(): Promise<any> {
    return fetchJson<any>('/grocery/pantry-restock-suggestions');
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
  },

  // Admin Platform Management
  admin: {
    async getOverview() {
      return fetchJson<any>('/admin/overview');
    },

    async getTrends(days = 14) {
      return fetchJson<any>(`/admin/trends?days=${days}`);
    },

    async getUsers(params?: { page?: number; limit?: number; q?: string; role?: string; status?: string }) {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.q) query.set('q', params.q);
      if (params?.role) query.set('role', params.role);
      if (params?.status) query.set('status', params.status);
      return fetchJson<any>(`/admin/users?${query.toString()}`);
    },

    async getUserById(id: string) {
      return fetchJson<any>(`/admin/users/${id}`);
    },

    async updateUserStatus(id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string) {
      return fetchJson<any>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      });
    },

    async revokeUserSessions(id: string, reason?: string) {
      return fetchJson<any>(`/admin/users/${id}/revoke-sessions`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
    },

    async resendUserVerification(id: string) {
      return fetchJson<any>(`/admin/users/${id}/resend-verification`, {
        method: 'POST'
      });
    },

    async getHouseholds(params?: { page?: number; limit?: number; q?: string; dietaryPreference?: string }) {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.q) query.set('q', params.q);
      if (params?.dietaryPreference) query.set('dietaryPreference', params.dietaryPreference);
      return fetchJson<any>(`/admin/households?${query.toString()}`);
    },

    async getHouseholdById(id: string) {
      return fetchJson<any>(`/admin/households/${id}`);
    },

    async getRetailerApplications(params?: { status?: string; page?: number; limit?: number }) {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      return fetchJson<any>(`/admin/retailers/applications?${query.toString()}`);
    },

    async reviewRetailerApplication(id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
      return fetchJson<any>(`/admin/retailers/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason })
      });
    },

    async getRetailers() {
      return fetchJson<any>('/admin/retailers');
    },

    async updateRetailerStatus(id: string, status: 'ACTIVE' | 'SUSPENDED', reason?: string) {
      return fetchJson<any>(`/admin/retailers/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      });
    },

    async getOrders(params?: { page?: number; limit?: number; status?: string; q?: string; startDate?: string; endDate?: string }) {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.status) query.set('status', params.status);
      if (params?.q) query.set('q', params.q);
      if (params?.startDate) query.set('startDate', params.startDate);
      if (params?.endDate) query.set('endDate', params.endDate);
      return fetchJson<any>(`/admin/orders?${query.toString()}`);
    },

    async getOrderById(id: string) {
      return fetchJson<any>(`/admin/orders/${id}`);
    },

    async updateOrderStatus(id: string, status: string, options?: { statusReason?: string; substitutionNotes?: string; fulfillmentNotes?: string }) {
      return fetchJson<any>(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...options })
      });
    },

    async getRecipes(params?: { page?: number; limit?: number; q?: string; cuisine?: string; dietaryTag?: string; isArchived?: boolean }) {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.q) query.set('q', params.q);
      if (params?.cuisine) query.set('cuisine', params.cuisine);
      if (params?.dietaryTag) query.set('dietaryTag', params.dietaryTag);
      if (params?.isArchived !== undefined) query.set('isArchived', String(params.isArchived));
      return fetchJson<any>(`/admin/recipes?${query.toString()}`);
    },

    async getRecipeById(id: string) {
      return fetchJson<any>(`/admin/recipes/${id}`);
    },

    async createRecipe(recipeData: any) {
      return fetchJson<any>('/admin/recipes', {
        method: 'POST',
        body: JSON.stringify(recipeData)
      });
    },

    async updateRecipe(id: string, recipeData: any) {
      return fetchJson<any>(`/admin/recipes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(recipeData)
      });
    },

    async archiveRecipe(id: string, isArchived: boolean) {
      return fetchJson<any>(`/admin/recipes/${id}/archive`, {
        method: 'PATCH',
        body: JSON.stringify({ isArchived })
      });
    },

    async getAuditLogs(params?: { page?: number; limit?: number; action?: string; userId?: string; q?: string; startDate?: string; endDate?: string }) {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.action) query.set('action', params.action);
      if (params?.userId) query.set('userId', params.userId);
      if (params?.q) query.set('q', params.q);
      if (params?.startDate) query.set('startDate', params.startDate);
      if (params?.endDate) query.set('endDate', params.endDate);
      return fetchJson<any>(`/admin/audit-logs?${query.toString()}`);
    },

    async getStaffList() {
      return fetchJson<any>('/admin/staff');
    },

    async createStaffMember(staffData: { email: string; fullName: string; role: string; password: string }) {
      return fetchJson<any>('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(staffData)
      });
    },

    async updateStaffRole(id: string, role: string) {
      return fetchJson<any>(`/admin/staff/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
    },

    async getSettings() {
      return fetchJson<any>('/admin/settings');
    },

    async updateSetting(key: string, value: string, description?: string) {
      return fetchJson<any>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ key, value, description })
      });
    },

    async getSystemHealth() {
      return fetchJson<any>('/admin/health');
    }
  }
};
