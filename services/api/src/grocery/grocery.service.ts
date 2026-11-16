import { Injectable } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import {
  calculateMealPlanRequirements,
  buildGroceryBasket
} from '@rasoi/grocery-engine';
import {
  ScaledIngredientRequirement,
  GroceryBasket,
  BasketItem
} from '@rasoi/shared-types';

@Injectable()
export class GroceryService {
  private activeBasketItems: Map<string, BasketItem[]> = new Map();
  private selectedRetailers: Map<string, string> = new Map();

  constructor(private readonly store: StoreService) {}

  async getRequirements(householdId = 'hh-sharma-family'): Promise<ScaledIngredientRequirement[]> {
    const mealPlanItems = this.store.mealPlanItems.get(householdId) || [];
    const pantryItems = this.store.pantryItems.get(householdId) || [];
    return calculateMealPlanRequirements(mealPlanItems, pantryItems);
  }

  async getBasket(householdId = 'hh-sharma-family', retailerId?: string): Promise<GroceryBasket> {
    const requirements = await this.getRequirements(householdId);
    const existing = this.activeBasketItems.get(householdId) || [];

    if (retailerId) {
      this.selectedRetailers.set(householdId, retailerId);
    }
    const currentRetailerId = this.selectedRetailers.get(householdId) || this.store.retailers[0]?.id || 'ret-blinkit';

    const basketResult = buildGroceryBasket(
      requirements,
      this.store.productVariants,
      this.store.retailers,
      currentRetailerId,
      existing
    );

    // Save basket items state
    this.activeBasketItems.set(householdId, basketResult.items);

    return {
      id: `basket-${householdId}`,
      householdId,
      selectedRetailerId: currentRetailerId,
      items: basketResult.items,
      subtotalInr: basketResult.subtotalInr,
      deliveryFeeInr: basketResult.deliveryFeeInr,
      totalInr: basketResult.totalInr,
      mrpTotalInr: basketResult.mrpTotalInr,
      discountInr: basketResult.discountInr,
      comparisons: basketResult.comparisons
    };
  }

  async toggleBasketItem(
    householdId = 'hh-sharma-family',
    ingredientId: string,
    isSelected: boolean
  ): Promise<GroceryBasket> {
    const items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.ingredientId === ingredientId);
    if (item) {
      item.isSelectedForPurchase = isSelected;
    }
    this.activeBasketItems.set(householdId, items);
    return this.getBasket(householdId);
  }

  async swapProductVariant(
    householdId = 'hh-sharma-family',
    ingredientId: string,
    variantId: string
  ): Promise<GroceryBasket> {
    const items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.ingredientId === ingredientId);
    const newVariant = this.store.productVariants.find(v => v.id === variantId);

    if (item && newVariant) {
      item.productVariantId = newVariant.id;
      item.productVariant = newVariant;
      item.totalPriceInr = item.quantityPacks * newVariant.sellingPriceInr;
    }

    this.activeBasketItems.set(householdId, items);
    return this.getBasket(householdId);
  }

  async updateItemPacks(
    householdId = 'hh-sharma-family',
    ingredientId: string,
    packs: number
  ): Promise<GroceryBasket> {
    const items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.ingredientId === ingredientId);
    if (item) {
      item.quantityPacks = Math.max(0, packs);
      item.totalPriceInr = item.quantityPacks * item.productVariant.sellingPriceInr;
    }
    this.activeBasketItems.set(householdId, items);
    return this.getBasket(householdId);
  }
}
