// Indian Regional Cuisines
// Indian Regional Cuisines & Geographic Groupings
export type IndianRegion =
  | 'ALL_INDIAN'
  | 'North Indian'
  | 'South Indian'
  | 'West Indian'
  | 'East Indian'
  | 'Central Indian';

export const ALL_INDIAN_CUISINE = 'ALL_INDIAN';

// Canonical Dietary Modes
export type DietaryPreference =
  | 'VEGETARIAN'
  | 'NON_VEGETARIAN'
  | 'EGGETARIAN'
  | 'VEGAN'
  | 'JAIN';

export type IndianCuisine =
  | 'North Indian'
  | 'South Indian'
  | 'West Indian'
  | 'East Indian'
  | 'Central Indian'
  | 'Punjabi'
  | 'Gujarati'
  | 'Kathiyawadi'
  | 'Tamil'
  | 'Kerala'
  | 'Andhra'
  | 'Bengali'
  | 'Maharashtrian'
  | 'Rajasthani'
  | 'Goan'
  | 'Indo-Chinese'
  | 'Pan-Indian';

// Dietary Classifications
export type DietaryTag =
  | 'Pure Vegetarian'
  | 'Vegetarian'
  | 'Jain Friendly' // No onion, garlic, root vegetables
  | 'Vegan'
  | 'Eggetarian'
  | 'Non-Vegetarian'
  | 'Gluten-Free'
  | 'High-Protein'
  | 'Diabetic-Friendly'
  | 'Kid-Friendly';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type StandardUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'piece'
  | 'tbsp'
  | 'tsp'
  | 'cup'
  | 'pinch'
  | 'bunch';

export interface Ingredient {
  id: string;
  name: string; // e.g. "Paneer", "Basmati Rice", "Turmeric Powder"
  hindiName?: string; // e.g. "पनीर", "बासमती चावल", "हल्दी"
  category: 'Produce' | 'Dairy & Eggs' | 'Grains & Atta' | 'Lentils & Pulses' | 'Spices & Masalas' | 'Oils & Ghee' | 'Meat & Poultry' | 'Snacks & Bakery' | 'Pantry Staples';
  standardUnit: StandardUnit;
  shelfLifeDays?: number;
  isJainPermissible: boolean; // false for onion, garlic, potatoes, etc.
  isVerified?: boolean; // Set to true when ingredient metadata is verified
  containsEggs?: boolean;
  containsDairy?: boolean;
  containsMeat?: boolean;
  containsPoultry?: boolean;
  containsFish?: boolean;
  containsSeafood?: boolean;
  isOnionGarlic?: boolean;
  isRootVegetable?: boolean;
  containsNuts?: boolean;
  containsGluten?: boolean;
  allergens?: string[];
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  ingredient: Ingredient;
  quantity: number;
  unit: StandardUnit;
  notes?: string; // e.g. "cubed", "finely chopped", "soaked for 2 hrs"
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
  durationMinutes?: number;
}

// Nutritional Analytics Types
export type NutritionDataSource = 'IFCT_2017' | 'USDA' | 'ESTIMATE' | 'MANUFACTURER';

export type ProteinSource =
  | 'paneer'
  | 'dal'
  | 'chickpeas'
  | 'rajma'
  | 'soy'
  | 'curd'
  | 'eggs'
  | 'chicken'
  | 'fish'
  | 'mixed-veg';

export interface MacroNutrients {
  calories: number; // kcal
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sugar: number; // g
  sodium: number; // mg
}

export interface IngredientNutritionalProfile {
  ingredientId: string;
  ingredientName: string;
  perAmount: number; // usually 100
  perUnit: 'g' | 'ml' | 'piece';
  calories: number; // kcal per 100g/ml
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber: number; // g
  sugar: number; // g
  sodium: number; // mg
  source: NutritionDataSource;
  sourceAttribution: string; // e.g. "Indian Food Composition Tables (IFCT 2017), ICMR-NIN"
  confidence: 'exact' | 'close-match' | 'estimate';
  notes?: string;
}

export interface RecipeIngredientNutrition {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: StandardUnit;
  normalizedGrams: number;
  nutrients: MacroNutrients;
  rawNutrients?: MacroNutrients; // unrounded high-precision values
  source: NutritionDataSource;
  sourceAttribution: string;
  isEstimate: boolean;
  confidence?: 'exact' | 'close-match' | 'estimate';
}

export interface RecipeNutritionBreakdown {
  total: MacroNutrients;
  perServing: MacroNutrients;
  rawTotal?: MacroNutrients; // unrounded internal total
  rawPerServing?: MacroNutrients; // unrounded internal per serving
  servings: number;
  dataCompletenessPercent: number; // % of ingredients backed by catalog nutritional data
  sources: Array<{ source: NutritionDataSource; attribution: string }>;
  ingredients: RecipeIngredientNutrition[];
  dominantProteinSource?: ProteinSource;
}

export interface HouseholdNutritionGoals {
  memberId?: string;
  memberName?: string;
  dailyCalories?: number; // target kcal (optional)
  dailyProteinGrams?: number; // target g (optional)
  dailyCarbsGrams?: number; // target g (optional)
  dailyFatGrams?: number; // target g (optional)
  dailyFiberGrams?: number; // target g (optional)
}

export interface DailyNutritionSummary {
  dayOfWeek: DayOfWeek;
  total: MacroNutrients;
  rawTotal?: MacroNutrients;
  byMeal: Record<MealCategory, MacroNutrients>;
  mealCount: number;
  proteinProgressPercent?: number;
}

export interface WeeklyNutritionAnalytics {
  dailySummaries: Record<DayOfWeek, DailyNutritionSummary>;
  weeklyTotal: MacroNutrients;
  weeklyDailyAverage: MacroNutrients; // Alias for calendarDayAverage
  calendarDayAverage: MacroNutrients; // weeklyTotal / 7 (all 7 calendar days)
  plannedDayAverage: MacroNutrients;  // weeklyTotal / plannedDaysCount (only days with meals)
  plannedDaysCount: number;           // count of days with >= 1 planned meal
  emptyDaysCount: number;             // 7 - plannedDaysCount
  byMealAverage: Record<MealCategory, MacroNutrients>;
  highProteinMealsCount: number; // meals >= 15g protein
  proteinGoalGrams?: number;
  avgDailyProteinProgressPercent?: number;
  proteinSourcesDetected: ProteinSource[];
  proteinDiversityScore: number; // 0 - 100 based on variety of protein sources
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  cuisine: IndianCuisine;
  dietaryTags: DietaryTag[];
  mealTypes: MealCategory[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  defaultServings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  proteinSource?: ProteinSource;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sugarGrams?: number;
  sodiumMg?: number;
  nutritionBreakdown?: RecipeNutritionBreakdown;
  imageUrl: string;
  estimatedCostInr: number; // approximate ingredient cost for default servings
  isJainFriendly: boolean;
  jainAlternativeNotes?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  rating: number;
  ratingCount: number;
}

// Household Configuration
export interface HouseholdMember {
  id: string;
  name: string;
  ageGroup: 'adult' | 'child' | 'toddler' | 'senior';
  dietaryPreference: DietaryPreference | 'vegetarian' | 'non-vegetarian' | 'jain' | 'vegan' | 'eggetarian';
  allergies: string[]; // e.g. ["Peanuts", "Lactose", "Gluten", "Mustard"]
  dislikedIngredients: string[];
  nutritionGoals?: HouseholdNutritionGoals;
  role?: 'OWNER' | 'MEMBER' | 'COOK';
  userId?: string;
  status?: string;
}

export interface Household {
  id: string;
  userId: string;
  name: string;
  dietaryPreference?: DietaryPreference;
  cuisinePreference?: string; // 'ALL_INDIAN' or regional/specific cuisine
  members: HouseholdMember[];
  primaryCuisines: IndianCuisine[];
  spiceTolerance: 'Mild' | 'Medium' | 'Spicy' | 'Desi Teekha';
  weeklyBudgetInr: number;
  cookingFrequency: 'Daily Fresh' | 'Batch Cook Weekend' | 'Quick Weekdays';
  nutritionGoals?: HouseholdNutritionGoals;
}

// Meal Planning
export interface MealPlanItem {
  id: string;
  mealPlanId: string;
  dayOfWeek: DayOfWeek;
  mealCategory: MealCategory;
  recipeId: string;
  recipe: Recipe;
  servings: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  householdId: string;
  weekStartDate: string; // ISO date format YYYY-MM-DD
  items: MealPlanItem[];
}

// Pantry Management
export interface PantryItem {
  id: string;
  householdId: string;
  ingredientId: string;
  ingredient: Ingredient;
  currentQuantity: number;
  unit: StandardUnit;
  isLowStock: boolean;
  lowStockThreshold?: number;
  updatedAt: string;
}

// Grocery Intelligence Models
export interface ScaledIngredientRequirement {
  ingredientId: string;
  ingredientName: string;
  hindiName?: string;
  category: string;
  standardUnit: StandardUnit;
  totalRequiredQuantity: number;
  recipeSources: Array<{
    recipeId: string;
    recipeTitle: string;
    day: DayOfWeek;
    meal: MealCategory;
    quantity: number;
    unit: StandardUnit;
  }>;
  availableInPantryQuantity: number;
  netShoppingQuantity: number; // Max(0, totalRequired - availableInPantry)
}

// Retailer & Marketplace
export interface Retailer {
  id: string;
  name: string; // "Blinkit", "Zepto", "DMart Ready", "BigBasket", "Swiggy Instamart"
  slug: string;
  logoUrl: string;
  deliveryTimeEstimate: string; // "10-15 mins", "Same Day", "Next Morning"
  deliveryFeeInr: number;
  freeDeliveryThresholdInr: number;
  minOrderValueInr: number;
  rating: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  brand: string; // "Amul", "Aashirvaad", "Tata Sampann", "Everest", "Fortune"
  title: string; // "Amul Fresh Malai Paneer, 200 g"
  packQuantity: number;
  packUnit: StandardUnit;
  mrpInr: number;
  sellingPriceInr: number;
  imageUrl: string;
  ingredientId: string; // Mapped back to canonical culinary ingredient
}

export type ItemFulfillmentStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'SUBSTITUTED';

export interface BasketItem {
  id: string;
  ingredientId: string;
  productVariantId: string;
  productVariant: ProductVariant;
  quantityPacks: number; // e.g. 2 packs of 200g for 350g requirement
  totalQuantity: number; // 400g
  totalPriceInr: number;
  isSelectedForPurchase: boolean; // Can be toggled without deleting recipe requirement
  availableAtHome: boolean;
  associatedRecipeIds: string[];
  associatedRecipeNames?: string[];
  effectivePricePerPackInr?: number;
  itemStatus?: ItemFulfillmentStatus;
  substitutionNotes?: string;
}

export interface MaharajPreparationSummary {
  householdId: string;
  householdName: string;
  targetDay: DayOfWeek;
  totalServings: number;
  plannedMeals: Array<{
    mealCategory: MealCategory;
    recipeTitle: string;
    cuisine: IndianCuisine;
    servings: number;
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    isJainFriendly: boolean;
  }>;
  overnightSoaking: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: StandardUnit;
    forMeal: string;
    notes?: string;
  }>;
  advancePreparation: Array<{
    task: string;
    ingredients: string[];
    forMeal: string;
    instructions: string;
  }>;
  householdDietaryRestrictions: Array<{
    memberName: string;
    dietaryPreference: string;
    allergies: string[];
    dislikedIngredients: string[];
  }>;
  whatsAppSummaryText?: string;
  generatedAt: string;
}

export interface RetailerBasketComparison {
  retailer: Retailer;
  totalItems: number;
  itemsAvailableCount: number;
  subtotalInr: number;
  deliveryFeeInr: number;
  estimatedTotalInr: number;
  isLowestPrice: boolean;
  estimatedSavingsInr: number;
  priceComparisonNote?: string;
  isServiceable?: boolean;
}

export interface GroceryBasket {
  id: string;
  householdId: string;
  selectedRetailerId: string;
  items: BasketItem[];
  subtotalInr: number;
  deliveryFeeInr: number;
  totalInr: number;
  comparisons: RetailerBasketComparison[];
  mrpTotalInr?: number;
  discountInr?: number;
  baselineComparisonRetailer?: string;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Office' | 'Parents' | 'Other';
  flat: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

// AI Meal Planning Request & Response
export interface AIPlanGenerationPrompt {
  prompt?: string;
  householdId?: string;
  dietaryPreference?: DietaryPreference;
  cuisinePreference?: string;
  cuisinePreferences?: (IndianCuisine | IndianRegion | string)[];
  dietaryRestrictions?: (DietaryTag | DietaryPreference)[];
  daysCount?: number;
  budgetInr?: number;
  servingsPerMeal?: number;
  recentRecipeIds?: string[];
  excludeRecipeIds?: string[];
  excludeIngredients?: string[];
  seed?: number;
  maxPrepTimeMinutes?: number;
  proteinPreference?: 'standard' | 'high-protein' | 'moderate';
  targetDailyProteinGrams?: number;
  targetDailyCalories?: number;
  members?: HouseholdMember[];
}

export interface AISuggestedMeal {
  dayOfWeek: DayOfWeek;
  mealCategory: MealCategory;
  recipeId: string;
  recipeTitle: string;
  cuisine: IndianCuisine;
  reason: string;
  servings: number;
}

export interface AIPlanGenerationResponse {
  source: 'gemini' | 'deterministic-fallback';
  planSummary: string;
  diversitySummary?: string;
  catalogLimitation?: string;
  estimatedWeeklyBudgetInr: number;
  nutritionalHighlights: {
    avgDailyCalories: number;
    proteinFocus: string;
    fiberRating: string;
  };
  meals: AISuggestedMeal[];
  modelUsed?: string;
  generationSeed?: number;
  uniqueRecipesCount?: number;
  fallbackReason?: string;
}
