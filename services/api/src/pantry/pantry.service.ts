import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { PantryItem, StandardUnit } from '@rasoi/shared-types';

@Injectable()
export class PantryService {
  constructor(private readonly store: StoreService) {}

  async getPantryItems(householdId = 'hh-sharma-family'): Promise<PantryItem[]> {
    return this.store.pantryItems.get(householdId) || [];
  }

  async addOrUpdatePantryItem(
    householdId = 'hh-sharma-family',
    item: {
      ingredientId: string;
      quantity: number;
      unit: StandardUnit;
      isLowStock?: boolean;
      lowStockThreshold?: number;
    }
  ): Promise<PantryItem> {
    const list = this.store.pantryItems.get(householdId) || [];
    const ingredient = this.store.ingredients.find(i => i.id === item.ingredientId);
    if (!ingredient) {
      throw new NotFoundException(`Ingredient ${item.ingredientId} not found`);
    }

    const existing = list.find(p => p.ingredientId === item.ingredientId);
    if (existing) {
      existing.currentQuantity = item.quantity;
      existing.unit = item.unit;
      existing.isLowStock = item.isLowStock ?? existing.isLowStock;
      if (item.lowStockThreshold !== undefined) {
        (existing as any).lowStockThreshold = item.lowStockThreshold;
      }
      existing.updatedAt = new Date().toISOString();
      this.store.pantryItems.set(householdId, list);
      await this.store.persistPantryItem(householdId, existing);
      return existing;
    }

    const newItem: PantryItem = {
      id: `pantry-${Date.now()}`,
      householdId,
      ingredientId: item.ingredientId,
      ingredient,
      currentQuantity: item.quantity,
      unit: item.unit,
      isLowStock: item.isLowStock ?? false,
      updatedAt: new Date().toISOString()
    };
    if (item.lowStockThreshold !== undefined) {
      (newItem as any).lowStockThreshold = item.lowStockThreshold;
    }
    list.push(newItem);
    this.store.pantryItems.set(householdId, list);
    await this.store.persistPantryItem(householdId, newItem);
    return newItem;
  }

  async removePantryItem(householdId = 'hh-sharma-family', id: string): Promise<{ success: boolean }> {
    const list = this.store.pantryItems.get(householdId) || [];
    const filtered = list.filter(p => p.id !== id && p.ingredientId !== id);
    this.store.pantryItems.set(householdId, filtered);
    await this.store.persistPantryItemDelete(householdId, id);
    return { success: true };
  }
}
