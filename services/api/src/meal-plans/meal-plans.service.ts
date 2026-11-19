import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { MealPlanItem, DayOfWeek, MealCategory, AISuggestedMeal, MaharajPreparationSummary } from '@rasoi/shared-types';

@Injectable()
export class MealPlansService {
  constructor(private readonly store: StoreService) {}

  async getCurrentPlan(householdId = 'hh-sharma-family'): Promise<MealPlanItem[]> {
    return this.store.mealPlanItems.get(householdId) || [];
  }

  async addMealItem(
    householdId: string,
    item: {
      dayOfWeek: DayOfWeek;
      mealCategory: MealCategory;
      recipeId: string;
      servings?: number;
    }
  ): Promise<MealPlanItem> {
    const recipe = this.store.recipes.find(r => r.id === item.recipeId);
    if (!recipe) {
      throw new NotFoundException(`Recipe ${item.recipeId} not found`);
    }

    const items = this.store.mealPlanItems.get(householdId) || [];
    
    // Replace if meal slot already occupied
    const existingIndex = items.findIndex(
      i => i.dayOfWeek === item.dayOfWeek && i.mealCategory === item.mealCategory
    );

    const newItem: MealPlanItem = {
      id: `plan-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      mealPlanId: 'mp-current',
      dayOfWeek: item.dayOfWeek,
      mealCategory: item.mealCategory,
      recipeId: item.recipeId,
      recipe,
      servings: item.servings || recipe.defaultServings || 4
    };

    if (existingIndex >= 0) {
      items[existingIndex] = newItem;
    } else {
      items.push(newItem);
    }

    this.store.mealPlanItems.set(householdId, items);
    await this.store.persistMealPlanItem(householdId, newItem);
    return newItem;
  }

  async updateMealItem(
    householdId: string,
    itemId: string,
    updates: { servings?: number; recipeId?: string }
  ): Promise<MealPlanItem> {
    const items = this.store.mealPlanItems.get(householdId) || [];
    const item = items.find(i => i.id === itemId);
    if (!item) {
      throw new NotFoundException(`Meal plan item ${itemId} not found`);
    }

    if (updates.servings !== undefined) {
      item.servings = updates.servings;
    }

    if (updates.recipeId) {
      const rec = this.store.recipes.find(r => r.id === updates.recipeId);
      if (rec) {
        item.recipeId = rec.id;
        item.recipe = rec;
      }
    }

    this.store.mealPlanItems.set(householdId, items);
    await this.store.persistMealPlanItem(householdId, item);
    return item;
  }

  async removeMealItem(householdId: string, itemId: string): Promise<{ success: boolean }> {
    const items = this.store.mealPlanItems.get(householdId) || [];
    const filtered = items.filter(i => i.id !== itemId);
    this.store.mealPlanItems.set(householdId, filtered);
    await this.store.persistMealPlanItemDelete(itemId);
    return { success: true };
  }

  async applyAiPlan(householdId: string, aiMeals?: AISuggestedMeal[]): Promise<MealPlanItem[]> {
    const newItems: MealPlanItem[] = [];
    const defaultServings = this.store.households.get(householdId)?.members?.length || 1;
    const mealsToProcess = Array.isArray(aiMeals) && aiMeals.length > 0
      ? aiMeals
      : this.getDefaultSuggestedMeals(householdId);

    for (const suggested of mealsToProcess) {
      let rec = this.store.recipes.find(r => r.id === suggested.recipeId || r.slug === suggested.recipeId);
      if (!rec && this.store.isPrismaConnected) {
        try {
          const dbRec = await this.store.prisma.recipe.findFirst({
            where: { OR: [{ id: suggested.recipeId }, { slug: suggested.recipeId }] },
            include: { ingredients: { include: { ingredient: true } }, steps: true }
          });
          if (dbRec) {
            rec = {
              id: dbRec.id,
              title: dbRec.title,
              slug: dbRec.slug,
              description: dbRec.description || '',
              cuisine: dbRec.cuisine as any,
              dietaryTags: (dbRec.dietaryTags as any) || [],
              mealTypes: (dbRec.mealTypes as any) || [],
              prepTimeMinutes: dbRec.prepTimeMinutes,
              cookTimeMinutes: dbRec.cookTimeMinutes,
              defaultServings: dbRec.defaultServings,
              difficulty: dbRec.difficulty as any,
              caloriesPerServing: dbRec.caloriesPerServing,
              proteinGrams: dbRec.proteinGrams,
              carbsGrams: dbRec.carbsGrams,
              fatGrams: dbRec.fatGrams,
              fiberGrams: dbRec.fiberGrams,
              imageUrl: dbRec.imageUrl || '',
              estimatedCostInr: dbRec.estimatedCostInr,
              isJainFriendly: dbRec.isJainFriendly,
              jainAlternativeNotes: dbRec.jainAlternativeNotes || undefined,
              ingredients: (dbRec.ingredients || []).map((di: any, idx: number) => ({
                id: di.id || `rec-ing-${dbRec.id}-${idx}`,
                recipeId: dbRec.id,
                ingredientId: di.ingredientId,
                ingredient: di.ingredient || { id: di.ingredientId, name: di.ingredientId, category: 'Pantry Staples', standardUnit: di.unit, isJainPermissible: true },
                quantity: di.quantity,
                unit: di.unit as any,
                notes: di.notes || undefined
              })),
              instructions: (dbRec.steps || []).map((s: any) => ({
                stepNumber: s.stepNumber,
                instruction: s.instruction,
                timerSeconds: s.timerSeconds || undefined,
                ingredientNotes: s.ingredientNotes || undefined
              })),
              rating: 4.8,
              ratingCount: 100
            };
          }
        } catch {}
      }
      if (!rec) continue;

      const item: MealPlanItem = {
        id: `plan-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        mealPlanId: 'mp-current',
        dayOfWeek: suggested.dayOfWeek,
        mealCategory: suggested.mealCategory,
        recipeId: rec.id,
        recipe: rec,
        servings: suggested.servings || defaultServings,
        notes: suggested.reason
      };
      newItems.push(item);
    }

    this.store.mealPlanItems.set(householdId, newItems);
    await this.store.persistMealPlanBatch(householdId, newItems);
    return newItems;
  }

  private getDefaultSuggestedMeals(householdId: string): AISuggestedMeal[] {
    const hh = this.store.households.get(householdId);
    const pref = ((hh as any)?.dietaryPreference || 'VEGETARIAN').toUpperCase();
    const isJain = pref.includes('JAIN');

    let matching = this.store.recipes.filter(r => {
      if (isJain) return (r as any).dietaryCategory === 'JAIN' || r.isJainFriendly;
      return true;
    });
    if (matching.length === 0) matching = this.store.recipes;

    const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const cats: MealCategory[] = ['breakfast', 'lunch', 'dinner'];
    const results: AISuggestedMeal[] = [];
    let idx = 0;
    for (const d of days) {
      for (const c of cats) {
        const rec = matching[idx % matching.length];
        idx++;
        results.push({
          dayOfWeek: d,
          mealCategory: c,
          recipeId: rec.id,
          recipeTitle: rec.title,
          cuisine: (rec.cuisine as any) || 'NORTH_INDIAN',
          servings: hh?.members?.length || 2,
          reason: `Balanced ${c} suggestion honoring household preferences`
        });
      }
    }
    return results;
  }

  async clearPlan(householdId: string): Promise<{ success: boolean }> {
    this.store.mealPlanItems.set(householdId, []);
    await this.store.persistMealPlanClear(householdId);
    return { success: true };
  }

  async getMaharajSummary(householdId = 'hh-sharma-family', targetDay: DayOfWeek = 'monday'): Promise<MaharajPreparationSummary> {
    const household = this.store.households.get(householdId) || this.store.households.get('hh-sharma-family')!;
    const planItems = this.store.mealPlanItems.get(householdId) || [];
    const dayMeals = planItems.filter(item => item.dayOfWeek.toLowerCase() === targetDay.toLowerCase());

    const SOAK_INGREDIENTS = ['ing-kabuli-chana', 'ing-rajma', 'ing-chana-dal', 'ing-urad-dal', 'ing-toor-dal'];
    const overnightSoaking: any[] = [];
    const advancePrep: any[] = [];

    const householdServings = household?.members?.length || (dayMeals.length > 0 ? (dayMeals[0]?.servings || 1) : 1);
    const plannedMeals = dayMeals.map(m => {
      if (m.recipe?.ingredients) {
        for (const ing of m.recipe.ingredients) {
          if (SOAK_INGREDIENTS.includes(ing.ingredientId)) {
            overnightSoaking.push({
              ingredientId: ing.ingredientId,
              ingredientName: ing.ingredient?.name || ing.ingredientId,
              quantity: Math.round(ing.quantity * (m.servings / (m.recipe.defaultServings || 4))),
              unit: ing.unit,
              forMeal: `${m.mealCategory.toUpperCase()}: ${m.recipe.title}`,
              notes: 'Soak in clean water for 6-8 hours overnight before boiling.'
            });
          }
        }
      }

      if (m.recipe?.title.toLowerCase().includes('rotlo') || m.recipe?.title.toLowerCase().includes('thepla')) {
        advancePrep.push({
          task: `Dough Preparation for ${m.recipe.title}`,
          ingredients: ['Flour', 'Spices', 'Warm Water'],
          forMeal: m.mealCategory.toUpperCase(),
          instructions: 'Knead fresh dough 30 minutes before meal time and rest under damp cloth.'
        });
      } else if (m.recipe?.title.toLowerCase().includes('kadhi')) {
        advancePrep.push({
          task: `Whisk Buttermilk/Curd for Kadhi`,
          ingredients: ['Curd / Buttermilk', 'Besan', 'Jaggery'],
          forMeal: m.mealCategory.toUpperCase(),
          instructions: 'Whisk curd and besan with water until completely lump-free.'
        });
      } else if (m.recipe?.title.toLowerCase().includes('undhiyu') || m.recipe?.title.toLowerCase().includes('olo')) {
        advancePrep.push({
          task: `Vegetable Peeling & Slitting for ${m.recipe.title}`,
          ingredients: ['Vegetables', 'Herbs'],
          forMeal: m.mealCategory.toUpperCase(),
          instructions: 'String surti papdi, slit baby eggplants, and roast eggplant.'
        });
      }

      return {
        mealCategory: m.mealCategory,
        recipeTitle: m.recipe?.title || m.recipeId,
        cuisine: m.recipe?.cuisine || 'Gujarati',
        servings: m.servings || 4,
        prepTimeMinutes: m.recipe?.prepTimeMinutes || 15,
        cookTimeMinutes: m.recipe?.cookTimeMinutes || 20,
        isJainFriendly: m.recipe?.isJainFriendly ?? true
      };
    });

    const householdDietaryRestrictions = household.members.map(m => ({
      memberName: m.name,
      dietaryPreference: String(m.dietaryPreference),
      allergies: m.allergies || [],
      dislikedIngredients: m.dislikedIngredients || []
    }));

    const whatsAppSummaryText = [
      `🍲 *RASOIIQ MAHARAJ COOK DIGEST*`,
      `🏠 *Household:* ${household.name}`,
      `📅 *Day:* ${targetDay.toUpperCase()}`,
      `👥 *Servings:* ${householdServings} ${householdServings === 1 ? 'serving per meal' : 'servings per meal'}`,
      ``,
      `🍽️ *SCHEDULED MEALS:*`,
      ...plannedMeals.map(m => `  • [${m.mealCategory.toUpperCase()}] ${m.recipeTitle} (${m.servings} portions, ${m.cuisine})`),
      ...(overnightSoaking.length > 0 ? [``, `💧 *OVERNIGHT SOAKING:*`, ...overnightSoaking.map(s => `  • ${s.ingredientName} (${s.quantity}${s.unit}) - ${s.notes}`)] : []),
      ...(advancePrep.length > 0 ? [``, `🔪 *ADVANCE PREP:*`, ...advancePrep.map(p => `  • ${p.task} (${p.forMeal}): ${p.instructions}`)] : []),
      ``,
      `⚠️ *DIETARY & ALLERGY ALERTS:*`,
      ...householdDietaryRestrictions.map(r => `  • ${r.memberName}: ${r.dietaryPreference.toUpperCase()}${r.allergies.length ? ` (Allergies: ${r.allergies.join(', ')})` : ''}`)
    ].join('\n');

    return {
      householdId: household.id,
      householdName: household.name,
      targetDay,
      totalServings: householdServings,
      plannedMeals,
      overnightSoaking,
      advancePreparation: advancePrep,
      householdDietaryRestrictions,
      whatsAppSummaryText,
      generatedAt: new Date().toISOString()
    };
  }
}
