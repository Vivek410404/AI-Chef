import { z } from 'zod';

export const IndianCuisinesEnum = z.enum([
  'North Indian',
  'Punjabi',
  'Gujarati',
  'Kathiyawadi',
  'South Indian',
  'Tamil',
  'Kerala',
  'Andhra',
  'Bengali',
  'Maharashtrian',
  'Rajasthani',
  'Goan',
  'Indo-Chinese',
  'Pan-Indian',
  'West Indian',
  'East Indian',
  'Central Indian',
  'ALL_INDIAN'
]);

export const DietaryTagsEnum = z.enum([
  'Pure Vegetarian',
  'Vegetarian',
  'Jain Friendly',
  'Vegan',
  'Eggetarian',
  'Non-Vegetarian',
  'Gluten-Free',
  'High-Protein',
  'Diabetic-Friendly',
  'Kid-Friendly'
]);

export const DayOfWeekEnum = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
]);

export const MealCategoryEnum = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snack'
]);

// Household Nutrition Goals Schema
export const HouseholdNutritionGoalsSchema = z.object({
  memberId: z.string().optional(),
  memberName: z.string().optional(),
  dailyCalories: z.number().optional(),
  dailyProteinGrams: z.number().optional(),
  dailyCarbsGrams: z.number().optional(),
  dailyFatGrams: z.number().optional(),
  dailyFiberGrams: z.number().optional()
});

// Household Member Schema
export const HouseholdMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  ageGroup: z.enum(['adult', 'child', 'toddler', 'senior']).default('adult'),
  dietaryPreference: z.enum(['vegetarian', 'non-vegetarian', 'jain', 'vegan', 'eggetarian']),
  allergies: z.array(z.string()).default([]),
  dislikedIngredients: z.array(z.string()).default([]),
  nutritionGoals: HouseholdNutritionGoalsSchema.optional()
});

// Household Profile Schema
export const HouseholdSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Household name is required'),
  members: z.array(HouseholdMemberSchema).min(1, 'At least one member is required'),
  primaryCuisines: z.array(IndianCuisinesEnum).min(1, 'Select at least one preferred cuisine'),
  spiceTolerance: z.enum(['Mild', 'Medium', 'Spicy', 'Desi Teekha']).default('Medium'),
  weeklyBudgetInr: z.number().min(500, 'Minimum budget is ₹500').max(50000).default(3000),
  cookingFrequency: z.enum(['Daily Fresh', 'Batch Cook Weekend', 'Quick Weekdays']).default('Daily Fresh'),
  nutritionGoals: HouseholdNutritionGoalsSchema.optional()
});

// Recipe Filter Schema
export const RecipeFilterSchema = z.object({
  query: z.string().optional(),
  cuisine: IndianCuisinesEnum.optional(),
  dietaryTag: DietaryTagsEnum.optional(),
  mealCategory: MealCategoryEnum.optional(),
  maxCookTime: z.number().optional(),
  isJainFriendly: z.boolean().optional(),
  maxBudgetInr: z.number().optional()
});

// AI Plan Generation Input Schema
export const AIPlanRequestSchema = z.object({
  prompt: z.string().optional(),
  householdId: z.string().optional(),
  cuisinePreferences: z.array(IndianCuisinesEnum).optional(),
  dietaryRestrictions: z.array(DietaryTagsEnum).optional(),
  daysCount: z.number().min(1).max(7).default(7),
  budgetInr: z.number().optional(),
  servingsPerMeal: z.number().min(1).max(20).default(4),
  recentRecipeIds: z.array(z.string()).optional(),
  excludeRecipeIds: z.array(z.string()).optional(),
  seed: z.number().optional(),
  maxPrepTimeMinutes: z.number().optional(),
  proteinPreference: z.enum(['standard', 'high-protein', 'moderate']).optional(),
  targetDailyProteinGrams: z.number().optional(),
  targetDailyCalories: z.number().optional()
});

// Schema for Gemini Structured Meal suggestion
export const AISuggestedMealSchema = z.object({
  dayOfWeek: DayOfWeekEnum,
  mealCategory: MealCategoryEnum,
  recipeId: z.string(),
  recipeTitle: z.string(),
  cuisine: IndianCuisinesEnum,
  reason: z.string(),
  servings: z.number().min(1)
});

// Schema for validating AI Gemini Response
export const AIPlanResponseSchema = z.object({
  source: z.enum(['gemini', 'deterministic-fallback']),
  planSummary: z.string(),
  estimatedWeeklyBudgetInr: z.number(),
  nutritionalHighlights: z.object({
    avgDailyCalories: z.number(),
    proteinFocus: z.string(),
    fiberRating: z.string()
  }),
  meals: z.array(AISuggestedMealSchema),
  modelUsed: z.string().optional(),
  generationSeed: z.number().optional(),
  uniqueRecipesCount: z.number().optional(),
  fallbackReason: z.string().optional(),
  catalogLimitation: z.string().optional(),
  diversitySummary: z.string().optional()
});

// Pantry Item Schema
export const PantryItemSchema = z.object({
  ingredientId: z.string(),
  currentQuantity: z.number().min(0),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp', 'cup', 'pinch', 'bunch']),
  isLowStock: z.boolean().default(false),
  lowStockThreshold: z.number().optional()
});

// Basket Item update Schema
export const BasketItemUpdateSchema = z.object({
  productVariantId: z.string().optional(),
  quantityPacks: z.number().min(0).optional(),
  isSelectedForPurchase: z.boolean().optional()
});
