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

  async applyAiPlan(householdId: string, aiMeals: AISuggestedMeal[]): Promise<MealPlanItem[]> {
    const newItems: MealPlanItem[] = [];

    for (const suggested of aiMeals) {
      const rec = this.store.recipes.find(r => r.id === suggested.recipeId);
      if (!rec) continue;

      const item: MealPlanItem = {
        id: `plan-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        mealPlanId: 'mp-current',
        dayOfWeek: suggested.dayOfWeek,
        mealCategory: suggested.mealCategory,
        recipeId: rec.id,
        recipe: rec,
        servings: suggested.servings || 4,
        notes: suggested.reason
      };
      newItems.push(item);
    }

    this.store.mealPlanItems.set(householdId, newItems);
    await this.store.persistMealPlanBatch(householdId, newItems);
    return newItems;
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

    let totalServings = 0;
    const plannedMeals = dayMeals.map(m => {
      totalServings += m.servings || 4;
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
      `👥 *Total Servings:* ${totalServings}`,
      ``,
      `🍽️ *SCHEDULED MEALS:*`,
      ...plannedMeals.map(m => `  • [${m.mealCategory.toUpperCase()}] ${m.recipeTitle} (${m.servings} servings, ${m.cuisine})`),
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
      totalServings,
      plannedMeals,
      overnightSoaking,
      advancePreparation: advancePrep,
      householdDietaryRestrictions,
      whatsAppSummaryText,
      generatedAt: new Date().toISOString()
    };
  }
}
