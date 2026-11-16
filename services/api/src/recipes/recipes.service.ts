import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { Recipe, IndianCuisine, DietaryTag, MealCategory } from '@rasoi/shared-types';

@Injectable()
export class RecipesService {
  constructor(private readonly store: StoreService) {}

  async findAll(filters?: {
    search?: string;
    cuisine?: IndianCuisine;
    dietaryTag?: DietaryTag;
    mealCategory?: MealCategory;
    isJainFriendly?: boolean;
    maxCookTime?: number;
  }): Promise<Recipe[]> {
    let result = [...this.store.recipes];

    if (!filters) return result;

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.ingredient.name.toLowerCase().includes(q))
      );
    }

    if (filters.cuisine) {
      result = result.filter(r => r.cuisine === filters.cuisine);
    }

    if (filters.dietaryTag) {
      result = result.filter(r => r.dietaryTags.includes(filters.dietaryTag!));
    }

    if (filters.mealCategory) {
      result = result.filter(r => r.mealTypes.includes(filters.mealCategory!));
    }

    if (filters.isJainFriendly !== undefined && filters.isJainFriendly) {
      result = result.filter(r => r.isJainFriendly);
    }

    if (filters.maxCookTime) {
      result = result.filter(r => (r.prepTimeMinutes + r.cookTimeMinutes) <= filters.maxCookTime!);
    }

    return result;
  }

  async findById(id: string): Promise<Recipe> {
    const rec = this.store.recipes.find(r => r.id === id || r.slug === id);
    if (!rec) {
      throw new NotFoundException(`Recipe with ID/Slug "${id}" not found.`);
    }
    return rec;
  }
}
