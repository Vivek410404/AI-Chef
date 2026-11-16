import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { execSync } from 'child_process';
import {
  SEED_INGREDIENTS,
  SEED_RECIPES,
  SEED_RETAILERS,
  SEED_PRODUCT_VARIANTS,
  SEED_DEMO_HOUSEHOLD,
  SEED_PATEL_HOUSEHOLD,
  SEED_MEHTA_HOUSEHOLD,
  SEED_PANTRY_ITEMS,
  PrismaClient
} from '@rasoi/database';
import {
  Recipe,
  Household,
  MealPlanItem,
  PantryItem,
  Retailer,
  ProductVariant,
  Ingredient,
  HouseholdMember,
  DayOfWeek,
  MealCategory
} from '@rasoi/shared-types';

function resolveDatabaseUrl(): string {
  let host = '127.0.0.1';
  try {
    const wslIp = execSync('wsl -d Ubuntu hostname -I', { timeout: 1500 }).toString().trim().split(' ')[0];
    if (wslIp) host = wslIp;
  } catch {}

  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1')) {
      return process.env.DATABASE_URL.replace('localhost', host).replace('127.0.0.1', host);
    }
    return process.env.DATABASE_URL;
  }
  return `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;
}

@Injectable()
export class StoreService implements OnModuleInit {
  private readonly logger = new Logger(StoreService.name);
  public prisma: PrismaClient;
  public isPrismaConnected = false;

  // In-memory robust store fallback
  public ingredients: Ingredient[] = [];
  public recipes: Recipe[] = [];
  public retailers: Retailer[] = [];
  public productVariants: ProductVariant[] = [];
  public households: Map<string, Household> = new Map();
  public mealPlanItems: Map<string, MealPlanItem[]> = new Map(); // householdId -> items
  public pantryItems: Map<string, PantryItem[]> = new Map(); // householdId -> items
  public orders: any[] = [];

  constructor() {
    const dbUrl = resolveDatabaseUrl();
    this.prisma = new PrismaClient({
      datasources: { db: { url: dbUrl } }
    });
    this.initializeMemoryStore();
  }

  async onModuleInit() {
    const storageMode = process.env.STORAGE_MODE || (process.env.REQUIRE_DATABASE === 'true' ? 'postgres' : 'auto');
    const isExplicitPostgres = storageMode === 'postgres' || process.env.REQUIRE_DATABASE === 'true';

    if (storageMode === 'memory' || storageMode === 'demo') {
      this.isPrismaConnected = false;
      this.logger.log(' Active in Zero-Cost In-Memory Store Mode (explicitly selected via STORAGE_MODE).');
      return;
    }

    let connected = false;
    let lastErr: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.prisma.$connect();
        this.isPrismaConnected = true;
        this.logger.log(' Connected to PostgreSQL database via Prisma.');
        await this.syncFromDatabase();
        connected = true;
        break;
      } catch (err: any) {
        lastErr = err;
        if (attempt < 3) {
          this.logger.warn(`Prisma connect attempt ${attempt} failed (${err.message}). Retrying in 1s...`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    if (!connected) {
      this.isPrismaConnected = false;
      if (isExplicitPostgres) {
        const errorMsg = `CRITICAL: PostgreSQL is required by configuration (STORAGE_MODE=${storageMode}, REQUIRE_DATABASE=${process.env.REQUIRE_DATABASE}), but connection failed: ${lastErr?.message}. Startup halted.`;
        this.logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      this.logger.warn(' PostgreSQL connection failed or Docker not running. Active in Zero-Cost Dev Mode with In-Memory State.');
    }
  }

  private initializeMemoryStore() {
    // Populate ingredients
    this.ingredients = SEED_INGREDIENTS.map(ing => ({
      id: ing.id,
      name: ing.name,
      hindiName: ing.hindiName,
      category: ing.category,
      standardUnit: ing.standardUnit,
      shelfLifeDays: ing.shelfLifeDays,
      isJainPermissible: ing.isJainPermissible,
      isVerified: ing.isVerified ?? true,
      containsEggs: ing.containsEggs ?? false,
      containsDairy: ing.containsDairy ?? false,
      containsMeat: ing.containsMeat ?? false,
      containsPoultry: ing.containsPoultry ?? false,
      containsFish: ing.containsFish ?? false,
      containsSeafood: ing.containsSeafood ?? false,
      isOnionGarlic: ing.isOnionGarlic ?? false,
      isRootVegetable: ing.isRootVegetable ?? false,
      containsNuts: ing.containsNuts ?? false,
      containsGluten: ing.containsGluten ?? false,
      allergens: ing.allergens ?? []
    }));

    // Populate recipes
    this.recipes = SEED_RECIPES.map(rec => {
      const ingredientDetails = rec.ingredients.map((ing, idx) => {
        const fullIng = this.ingredients.find(i => i.id === ing.ingredientId) || {
          id: ing.ingredientId,
          name: ing.ingredientId,
          category: 'Pantry Staples' as const,
          standardUnit: ing.unit,
          isJainPermissible: true
        };
        return {
          id: `rec-ing-${rec.id}-${idx}`,
          recipeId: rec.id,
          ingredientId: ing.ingredientId,
          ingredient: fullIng,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        };
      });

      return {
        id: rec.id,
        title: rec.title,
        slug: rec.slug,
        description: rec.description,
        cuisine: rec.cuisine,
        dietaryTags: rec.dietaryTags,
        mealTypes: rec.mealTypes,
        prepTimeMinutes: rec.prepTimeMinutes,
        cookTimeMinutes: rec.cookTimeMinutes,
        defaultServings: rec.defaultServings,
        difficulty: rec.difficulty,
        caloriesPerServing: rec.caloriesPerServing,
        proteinGrams: rec.proteinGrams,
        carbsGrams: rec.carbsGrams,
        fatGrams: rec.fatGrams,
        fiberGrams: rec.fiberGrams,
        imageUrl: rec.imageUrl,
        estimatedCostInr: rec.estimatedCostInr,
        isJainFriendly: rec.isJainFriendly,
        jainAlternativeNotes: rec.jainAlternativeNotes,
        ingredients: ingredientDetails,
        instructions: rec.steps,
        rating: 4.8,
        ratingCount: 142
      };
    });

    // Populate retailers
    this.retailers = SEED_RETAILERS.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl,
      deliveryTimeEstimate: r.deliveryTimeEstimate,
      deliveryFeeInr: r.deliveryFeeInr,
      freeDeliveryThresholdInr: r.freeDeliveryThresholdInr,
      minOrderValueInr: r.minOrderValueInr,
      rating: r.rating
    }));

    // Populate product variants
    this.productVariants = SEED_PRODUCT_VARIANTS.map(v => ({
      id: v.id,
      productId: `prod-${v.brand}-${v.ingredientId}`,
      sku: v.sku,
      brand: v.brand,
      title: v.title,
      packQuantity: v.packQuantity,
      packUnit: v.packUnit,
      mrpInr: v.mrpInr,
      sellingPriceInr: v.sellingPriceInr,
      imageUrl: v.imageUrl,
      ingredientId: v.ingredientId
    }));

    // Demo Household
    const demoHousehold: Household = {
      id: SEED_DEMO_HOUSEHOLD.id,
      userId: SEED_DEMO_HOUSEHOLD.userId,
      name: SEED_DEMO_HOUSEHOLD.name,
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'ALL_INDIAN',
      primaryCuisines: ['North Indian', 'Gujarati', 'South Indian'],
      spiceTolerance: 'Medium',
      weeklyBudgetInr: SEED_DEMO_HOUSEHOLD.weeklyBudgetInr,
      cookingFrequency: 'Daily Fresh',
      members: SEED_DEMO_HOUSEHOLD.members.map(m => ({
        id: m.id,
        name: m.name,
        ageGroup: m.ageGroup as any,
        dietaryPreference: m.dietaryPreference as any,
        allergies: m.allergies,
        dislikedIngredients: m.dislikedIngredients
      }))
    };
    this.households.set(demoHousehold.id, demoHousehold);

    // Seed Household B: Patel Family (Jain / Gujarati, Bodakdev, Ahmedabad)
    const patelHousehold: Household = {
      id: SEED_PATEL_HOUSEHOLD.id,
      userId: SEED_PATEL_HOUSEHOLD.userId,
      name: SEED_PATEL_HOUSEHOLD.name,
      dietaryPreference: 'JAIN',
      cuisinePreference: 'Gujarati',
      primaryCuisines: ['Gujarati', 'Kathiyawadi'],
      spiceTolerance: 'Medium',
      weeklyBudgetInr: SEED_PATEL_HOUSEHOLD.weeklyBudgetInr,
      cookingFrequency: 'Daily Fresh',
      members: SEED_PATEL_HOUSEHOLD.members.map(m => ({
        id: m.id,
        name: m.name,
        ageGroup: m.ageGroup as any,
        dietaryPreference: m.dietaryPreference as any,
        allergies: m.allergies,
        dislikedIngredients: m.dislikedIngredients
      }))
    };
    this.households.set(patelHousehold.id, patelHousehold);

    // Seed Household C: Mehta Family (Kathiyawadi / Vegetarian, Navrangpura, Ahmedabad)
    const mehtaHousehold: Household = {
      id: SEED_MEHTA_HOUSEHOLD.id,
      userId: SEED_MEHTA_HOUSEHOLD.userId,
      name: SEED_MEHTA_HOUSEHOLD.name,
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'Kathiyawadi',
      primaryCuisines: ['Kathiyawadi', 'Gujarati'],
      spiceTolerance: 'Spicy',
      weeklyBudgetInr: SEED_MEHTA_HOUSEHOLD.weeklyBudgetInr,
      cookingFrequency: 'Daily Fresh',
      members: SEED_MEHTA_HOUSEHOLD.members.map(m => ({
        id: m.id,
        name: m.name,
        ageGroup: m.ageGroup as any,
        dietaryPreference: m.dietaryPreference as any,
        allergies: m.allergies,
        dislikedIngredients: m.dislikedIngredients
      }))
    };
    this.households.set(mehtaHousehold.id, mehtaHousehold);

    // Initial Pantry for Sharma Family
    const pantry: PantryItem[] = SEED_PANTRY_ITEMS.map((p, idx) => {
      const ing = this.ingredients.find(i => i.id === p.ingredientId)!;
      return {
        id: `pantry-${idx}`,
        householdId: demoHousehold.id,
        ingredientId: p.ingredientId,
        ingredient: ing,
        currentQuantity: p.currentQuantity,
        unit: p.unit as any,
        isLowStock: p.isLowStock,
        updatedAt: new Date().toISOString()
      };
    });
    this.pantryItems.set(demoHousehold.id, pantry);

    // Initial Pantry for Patel Family (Jain staples)
    const patelPantry: PantryItem[] = [
      { id: 'pantry-patel-1', householdId: patelHousehold.id, ingredientId: 'ing-besan', ingredient: this.ingredients.find(i => i.id === 'ing-besan')!, currentQuantity: 1500, unit: 'g', isLowStock: false, updatedAt: new Date().toISOString() },
      { id: 'pantry-patel-2', householdId: patelHousehold.id, ingredientId: 'ing-toor-dal', ingredient: this.ingredients.find(i => i.id === 'ing-toor-dal')!, currentQuantity: 1000, unit: 'g', isLowStock: false, updatedAt: new Date().toISOString() },
      { id: 'pantry-patel-3', householdId: patelHousehold.id, ingredientId: 'ing-ghee', ingredient: this.ingredients.find(i => i.id === 'ing-ghee')!, currentQuantity: 500, unit: 'g', isLowStock: false, updatedAt: new Date().toISOString() },
      { id: 'pantry-patel-4', householdId: patelHousehold.id, ingredientId: 'ing-jaggery', ingredient: this.ingredients.find(i => i.id === 'ing-jaggery')!, currentQuantity: 400, unit: 'g', isLowStock: false, updatedAt: new Date().toISOString() }
    ];
    this.pantryItems.set(patelHousehold.id, patelPantry);

    // Initial Pantry for Mehta Family (Kathiyawadi staples)
    const mehtaPantry: PantryItem[] = [
      { id: 'pantry-mehta-1', householdId: mehtaHousehold.id, ingredientId: 'ing-bajra-flour', ingredient: this.ingredients.find(i => i.id === 'ing-bajra-flour')!, currentQuantity: 2000, unit: 'g', isLowStock: false, updatedAt: new Date().toISOString() },
      { id: 'pantry-mehta-2', householdId: mehtaHousehold.id, ingredientId: 'ing-oil', ingredient: this.ingredients.find(i => i.id === 'ing-oil')!, currentQuantity: 1000, unit: 'ml', isLowStock: false, updatedAt: new Date().toISOString() },
      { id: 'pantry-mehta-3', householdId: mehtaHousehold.id, ingredientId: 'ing-garlic', ingredient: this.ingredients.find(i => i.id === 'ing-garlic')!, currentQuantity: 250, unit: 'g', isLowStock: false, updatedAt: new Date().toISOString() }
    ];
    this.pantryItems.set(mehtaHousehold.id, mehtaPantry);

    // Initial Meal Plan for Sharma Family (Prepopulated for demo)
    const initialPlan: MealPlanItem[] = [
      {
        id: 'plan-item-1',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'monday',
        mealCategory: 'breakfast',
        recipeId: 'recipe-methi-thepla',
        recipe: this.recipes.find(r => r.id === 'recipe-methi-thepla')!,
        servings: 4
      },
      {
        id: 'plan-item-2',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'monday',
        mealCategory: 'lunch',
        recipeId: 'recipe-paneer-butter-masala',
        recipe: this.recipes.find(r => r.id === 'recipe-paneer-butter-masala')!,
        servings: 4
      },
      {
        id: 'plan-item-3',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'monday',
        mealCategory: 'dinner',
        recipeId: 'recipe-gujarati-khatti-meethi-dal',
        recipe: this.recipes.find(r => r.id === 'recipe-gujarati-khatti-meethi-dal')!,
        servings: 4
      },
      {
        id: 'plan-item-4',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'tuesday',
        mealCategory: 'breakfast',
        recipeId: 'recipe-kanda-poha',
        recipe: this.recipes.find(r => r.id === 'recipe-kanda-poha')!,
        servings: 4
      },
      {
        id: 'plan-item-5',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'tuesday',
        mealCategory: 'lunch',
        recipeId: 'recipe-rajma-chawal',
        recipe: this.recipes.find(r => r.id === 'recipe-rajma-chawal')!,
        servings: 4
      },
      {
        id: 'plan-item-6',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'wednesday',
        mealCategory: 'dinner',
        recipeId: 'recipe-palak-paneer',
        recipe: this.recipes.find(r => r.id === 'recipe-palak-paneer')!,
        servings: 4
      },
      {
        id: 'plan-item-7',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'thursday',
        mealCategory: 'breakfast',
        recipeId: 'recipe-masala-dosa',
        recipe: this.recipes.find(r => r.id === 'recipe-masala-dosa')!,
        servings: 4
      },
      {
        id: 'plan-item-8',
        mealPlanId: 'mp-week-1',
        dayOfWeek: 'thursday',
        mealCategory: 'dinner',
        recipeId: 'recipe-moong-dal-khichdi',
        recipe: this.recipes.find(r => r.id === 'recipe-moong-dal-khichdi')!,
        servings: 4
      }
    ];
    this.mealPlanItems.set(demoHousehold.id, initialPlan);

    // Initial Meal Plan for Patel Family (Jain authentic weekly plan)
    const patelPlan: MealPlanItem[] = [
      {
        id: 'plan-patel-1',
        mealPlanId: 'mp-patel-1',
        dayOfWeek: 'monday',
        mealCategory: 'breakfast',
        recipeId: 'recipe-methi-thepla',
        recipe: this.recipes.find(r => r.id === 'recipe-methi-thepla')!,
        servings: 3
      },
      {
        id: 'plan-patel-2',
        mealPlanId: 'mp-patel-1',
        dayOfWeek: 'monday',
        mealCategory: 'lunch',
        recipeId: 'recipe-gujarati-dal-dhokli',
        recipe: this.recipes.find(r => r.id === 'recipe-gujarati-dal-dhokli')!,
        servings: 3
      },
      {
        id: 'plan-patel-3',
        mealPlanId: 'mp-patel-1',
        dayOfWeek: 'monday',
        mealCategory: 'dinner',
        recipeId: 'recipe-sev-tameta-nu-shaak',
        recipe: this.recipes.find(r => r.id === 'recipe-sev-tameta-nu-shaak')!,
        servings: 3
      },
      {
        id: 'plan-patel-4',
        mealPlanId: 'mp-patel-1',
        dayOfWeek: 'tuesday',
        mealCategory: 'dinner',
        recipeId: 'recipe-vaghireli-khichdi',
        recipe: this.recipes.find(r => r.id === 'recipe-vaghireli-khichdi')!,
        servings: 3
      }
    ];
    this.mealPlanItems.set(patelHousehold.id, patelPlan);

    // Initial Meal Plan for Mehta Family (Kathiyawadi weekly plan)
    const mehtaPlan: MealPlanItem[] = [
      {
        id: 'plan-mehta-1',
        mealPlanId: 'mp-mehta-1',
        dayOfWeek: 'monday',
        mealCategory: 'breakfast',
        recipeId: 'recipe-methi-na-gota',
        recipe: this.recipes.find(r => r.id === 'recipe-methi-na-gota')!,
        servings: 5
      },
      {
        id: 'plan-mehta-2',
        mealPlanId: 'mp-mehta-1',
        dayOfWeek: 'monday',
        mealCategory: 'lunch',
        recipeId: 'recipe-ringna-no-olo',
        recipe: this.recipes.find(r => r.id === 'recipe-ringna-no-olo')!,
        servings: 5
      },
      {
        id: 'plan-mehta-3',
        mealPlanId: 'mp-mehta-1',
        dayOfWeek: 'monday',
        mealCategory: 'dinner',
        recipeId: 'recipe-bajra-no-rotlo',
        recipe: this.recipes.find(r => r.id === 'recipe-bajra-no-rotlo')!,
        servings: 5
      }
    ];
    this.mealPlanItems.set(mehtaHousehold.id, mehtaPlan);
    this.logger.log(` Initialized In-Memory Store with ${this.recipes.length} recipes, ${this.ingredients.length} ingredients, and demo meal plan.`);
  }

  public async syncFromDatabase() {
    if (!this.isPrismaConnected) return;

    try {
      // 1. Sync Households & Members
      const dbHouseholds = await this.prisma.household.findMany({
        include: { members: true }
      });
      if (dbHouseholds.length > 0) {
        for (const dh of dbHouseholds) {
          const existing = this.households.get(dh.id);
          this.households.set(dh.id, {
            id: dh.id,
            userId: dh.userId,
            name: dh.name,
            dietaryPreference: ((dh as any).dietaryPreference as any) || existing?.dietaryPreference || 'VEGETARIAN',
            cuisinePreference: existing?.cuisinePreference || 'ALL_INDIAN',
            primaryCuisines: existing?.primaryCuisines || ['North Indian', 'Gujarati'],
            spiceTolerance: (dh.spiceTolerance as any) || 'Medium',
            weeklyBudgetInr: dh.weeklyBudgetInr,
            cookingFrequency: (dh.cookingFrequency as any) || 'Daily Fresh',
            members: dh.members.map(m => ({
              id: m.id,
              name: m.name,
              ageGroup: m.ageGroup as any,
              dietaryPreference: (m.dietaryPreference.toLowerCase() as any),
              allergies: m.allergies,
              dislikedIngredients: m.dislikedIngredients
            }))
          });
        }
      }

      // 2. Sync Pantry Items
      const dbPantry = await this.prisma.pantryItem.findMany({
        include: { ingredient: true }
      });
      if (dbPantry.length > 0) {
        const byHousehold = new Map<string, PantryItem[]>();
        for (const p of dbPantry) {
          const ing = this.ingredients.find(i => i.id === p.ingredientId) || {
            id: p.ingredientId,
            name: p.ingredient?.name || p.ingredientId,
            category: 'Pantry Staples' as const,
            standardUnit: p.unit as any,
            isJainPermissible: true
          };
          const item: PantryItem = {
            id: p.id,
            householdId: p.householdId,
            ingredientId: p.ingredientId,
            ingredient: ing,
            currentQuantity: p.currentQuantity,
            unit: p.unit as any,
            isLowStock: p.isLowStock,
            updatedAt: p.updatedAt.toISOString()
          };
          if (!byHousehold.has(p.householdId)) byHousehold.set(p.householdId, []);
          byHousehold.get(p.householdId)!.push(item);
        }
        for (const [hhId, items] of byHousehold.entries()) {
          this.pantryItems.set(hhId, items);
        }
      }

      // 3. Sync Meal Plans
      const dbMealPlans = await this.prisma.mealPlan.findMany({
        include: {
          items: {
            include: { recipe: true }
          }
        }
      });
      if (dbMealPlans.length > 0) {
        for (const mp of dbMealPlans) {
          const items: MealPlanItem[] = mp.items.map(mi => {
            const recipe = this.recipes.find(r => r.id === mi.recipeId);
            return {
              id: mi.id,
              mealPlanId: mi.mealPlanId,
              dayOfWeek: mi.dayOfWeek as any,
              mealCategory: mi.mealCategory as any,
              recipeId: mi.recipeId,
              recipe,
              servings: mi.servings
            };
          });
          if (items.length > 0) {
            this.mealPlanItems.set(mp.householdId, items);
          }
        }
      }

      // 4. Sync Orders
      const dbOrders = await this.prisma.order.findMany({
        include: {
          items: {
            include: { productVariant: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      if (dbOrders.length > 0) {
        this.orders = dbOrders.map(o => ({
          id: o.id,
          orderNumber: o.id.startsWith('RASOI-') ? o.id : `RASOI-${o.id.slice(-6).toUpperCase()}`,
          retailerId: o.retailerName?.toLowerCase().includes('zepto') ? 'ret-zepto' : 'ret-blinkit',
          retailerName: o.retailerName,
          deliveryTimeEstimate: '15-20 mins',
          userId: o.userId,
          householdId: o.userId === 'user-demo-patel' ? 'hh-patel-family' : o.userId === 'user-demo-mehta' ? 'hh-mehta-family' : 'hh-sharma-family',
          items: o.items.map(it => ({
            productName: it.productVariant?.title || 'Product Item',
            priceInr: it.unitPriceInr,
            quantity: it.quantityPacks,
            totalItemPriceInr: it.unitPriceInr * it.quantityPacks,
            itemStatus: 'AVAILABLE'
          })),
          itemsCount: o.items.length,
          subtotalInr: Math.max(0, o.totalAmountInr - o.deliveryFeeInr),
          deliveryFeeInr: o.deliveryFeeInr,
          totalAmountInr: o.totalAmountInr,
          status: o.status,
          deliveryAddress: o.deliveryAddress,
          placedAt: o.createdAt.toISOString(),
          createdAt: o.createdAt.toISOString()
        }));
      }

      this.logger.log(` Synced state with PostgreSQL: ${dbHouseholds.length} households, ${dbPantry.length} pantry items, ${dbOrders.length} orders.`);
    } catch (syncErr: any) {
      this.logger.error(` Error synchronizing with PostgreSQL: ${syncErr.message}`);
    }
  }

  public async persistHouseholdUpdate(id: string, updates: Partial<Household>) {
    if (!this.isPrismaConnected) return;
    try {
      const dataToUpdate: any = {};
      if (updates.name !== undefined) dataToUpdate.name = updates.name;
      if (updates.weeklyBudgetInr !== undefined) dataToUpdate.weeklyBudgetInr = updates.weeklyBudgetInr;
      if (updates.cookingFrequency !== undefined) dataToUpdate.cookingFrequency = updates.cookingFrequency;
      if (updates.dietaryPreference !== undefined) dataToUpdate.dietaryPreference = String(updates.dietaryPreference).toUpperCase();
      if (updates.cuisinePreference !== undefined) dataToUpdate.cuisinePreference = updates.cuisinePreference;

      await this.prisma.household.update({
        where: { id },
        data: dataToUpdate
      });
    } catch (e: any) {
      this.logger.warn(`Failed to persist household update to PostgreSQL: ${e.message}`);
    }
  }

  public async persistMemberAdd(householdId: string, member: HouseholdMember) {
    if (!this.isPrismaConnected) return;
    try {
      await this.prisma.householdMember.create({
        data: {
          id: member.id,
          householdId,
          name: member.name,
          ageGroup: member.ageGroup || 'adult',
          dietaryPreference: (member.dietaryPreference?.toUpperCase() as any) || 'VEGETARIAN',
          allergies: member.allergies || [],
          dislikedIngredients: member.dislikedIngredients || []
        }
      });
    } catch (e: any) {
      this.logger.warn(`Failed to persist member add to PostgreSQL: ${e.message}`);
    }
  }

  public async persistMemberRemove(memberId: string) {
    if (!this.isPrismaConnected) return;
    try {
      await this.prisma.householdMember.delete({
        where: { id: memberId }
      });
    } catch (e: any) {
      this.logger.warn(`Failed to persist member remove to PostgreSQL: ${e.message}`);
    }
  }

  public async persistMealPlanItem(householdId: string, item: MealPlanItem) {
    if (!this.isPrismaConnected) return;
    try {
      let mp = await this.prisma.mealPlan.findFirst({ where: { householdId } });
      if (!mp) {
        mp = await this.prisma.mealPlan.create({
          data: {
            id: `mp-${householdId}`,
            householdId,
            weekStartDate: new Date()
          }
        });
      }
      const existing = await this.prisma.mealPlanItem.findFirst({
        where: {
          mealPlanId: mp.id,
          dayOfWeek: item.dayOfWeek,
          mealCategory: item.mealCategory
        }
      });
      if (existing) {
        await this.prisma.mealPlanItem.delete({ where: { id: existing.id } });
      }
      await this.prisma.mealPlanItem.create({
        data: {
          id: item.id,
          mealPlanId: mp.id,
          dayOfWeek: item.dayOfWeek,
          mealCategory: item.mealCategory,
          recipeId: item.recipeId,
          servings: item.servings
        }
      });
    } catch (e: any) {
      this.logger.warn(`Failed to persist meal plan item to PostgreSQL: ${e.message}`);
    }
  }

  public async persistMealPlanItemDelete(itemId: string) {
    if (!this.isPrismaConnected) return;
    try {
      await this.prisma.mealPlanItem.deleteMany({ where: { id: itemId } });
    } catch (e: any) {
      this.logger.warn(`Failed to delete meal plan item from PostgreSQL: ${e.message}`);
    }
  }

  public async persistMealPlanClear(householdId: string) {
    if (!this.isPrismaConnected) return;
    try {
      const mp = await this.prisma.mealPlan.findFirst({ where: { householdId } });
      if (mp) {
        await this.prisma.mealPlanItem.deleteMany({ where: { mealPlanId: mp.id } });
      }
    } catch (e: any) {
      this.logger.warn(`Failed to clear meal plan in PostgreSQL: ${e.message}`);
    }
  }

  public async persistMealPlanBatch(householdId: string, items: MealPlanItem[]) {
    if (!this.isPrismaConnected) return;
    try {
      await this.prisma.$transaction(async (tx) => {
        let mp = await tx.mealPlan.findFirst({ where: { householdId } });
        if (!mp) {
          mp = await tx.mealPlan.create({
            data: {
              id: `mp-${householdId}`,
              householdId,
              weekStartDate: new Date()
            }
          });
        }
        await tx.mealPlanItem.deleteMany({ where: { mealPlanId: mp.id } });
        if (items.length > 0) {
          await tx.mealPlanItem.createMany({
            data: items.map(item => ({
              id: item.id,
              mealPlanId: mp.id,
              dayOfWeek: item.dayOfWeek,
              mealCategory: item.mealCategory,
              recipeId: item.recipeId,
              servings: item.servings
            }))
          });
        }
      }, { maxWait: 15000, timeout: 20000 });
    } catch (e: any) {
      this.logger.warn(`Failed to batch persist meal plan in PostgreSQL: ${e.message}`);
    }
  }

  public async persistPantryItem(householdId: string, item: PantryItem) {
    if (!this.isPrismaConnected) return;
    try {
      const existing = await this.prisma.pantryItem.findFirst({
        where: { householdId, ingredientId: item.ingredientId }
      });
      if (existing) {
        await this.prisma.pantryItem.update({
          where: { id: existing.id },
          data: {
            currentQuantity: item.currentQuantity,
            unit: item.unit,
            isLowStock: item.isLowStock
          }
        });
      } else {
        await this.prisma.pantryItem.create({
          data: {
            id: item.id,
            householdId,
            ingredientId: item.ingredientId,
            currentQuantity: item.currentQuantity,
            unit: item.unit,
            isLowStock: item.isLowStock
          }
        });
      }
    } catch (e: any) {
      this.logger.warn(`Failed to persist pantry item to PostgreSQL: ${e.message}`);
    }
  }

  public async persistPantryItemDelete(householdId: string, idOrIngId: string) {
    if (!this.isPrismaConnected) return;
    try {
      await this.prisma.pantryItem.deleteMany({
        where: {
          householdId,
          OR: [{ id: idOrIngId }, { ingredientId: idOrIngId }]
        }
      });
    } catch (e: any) {
      this.logger.warn(`Failed to delete pantry item from PostgreSQL: ${e.message}`);
    }
  }

  public async persistOrder(order: any) {
    if (!this.isPrismaConnected) return;
    try {
      const userId = order.householdId === 'hh-patel-family' ? 'user-demo-patel' : order.householdId === 'hh-mehta-family' ? 'user-demo-mehta' : (order.userId || 'user-demo-1');

      await this.prisma.order.create({
        data: {
          id: order.id,
          userId,
          retailerName: order.retailerName || 'Blinkit',
          status: order.status || 'DEMO ORDER CONFIRMED',
          totalAmountInr: order.totalAmountInr || 0,
          deliveryFeeInr: order.deliveryFeeInr || 0,
          deliveryAddress: order.deliveryAddress || 'Sample Address'
        }
      });
    } catch (e: any) {
      this.logger.warn(`Failed to persist order to PostgreSQL: ${e.message}`);
    }
  }
}
