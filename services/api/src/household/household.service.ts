import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { Household, HouseholdMember } from '@rasoi/shared-types';

@Injectable()
export class HouseholdService {
  constructor(private readonly store: StoreService) {}

  async getHousehold(id = 'hh-sharma-family'): Promise<Household> {
    const hh = this.store.households.get(id);
    if (!hh) {
      throw new NotFoundException(`Household with ID ${id} not found.`);
    }
    return hh;
  }

  async createHousehold(data: Partial<Household>): Promise<Household> {
    const id = data.id || `hh-${Date.now()}`;
    const newHousehold: Household = {
      id,
      userId: data.userId || 'usr-default',
      name: data.name || 'My Family',
      // Default: Vegetarian and All Indian Cuisines
      dietaryPreference: data.dietaryPreference || 'VEGETARIAN',
      cuisinePreference: data.cuisinePreference || 'ALL_INDIAN',
      primaryCuisines: data.primaryCuisines || ['North Indian', 'South Indian', 'West Indian', 'East Indian', 'Central Indian'],
      spiceTolerance: data.spiceTolerance || 'Medium',
      weeklyBudgetInr: data.weeklyBudgetInr || 3500,
      cookingFrequency: data.cookingFrequency || 'Daily Fresh',
      members: data.members || [
        {
          id: `mem-${Date.now()}-1`,
          name: 'Primary User',
          ageGroup: 'adult',
          dietaryPreference: 'VEGETARIAN',
          allergies: [],
          dislikedIngredients: []
        }
      ],
      nutritionGoals: data.nutritionGoals
    };
    this.store.households.set(id, newHousehold);
    return newHousehold;
  }

  async updateHousehold(id: string, updates: Partial<Household>): Promise<Household> {
    const current = await this.getHousehold(id);
    const updated: Household = {
      ...current,
      ...updates
    };
    this.store.households.set(id, updated);
    await this.store.persistHouseholdUpdate(id, updates);
    return updated;
  }

  async addMember(householdId: string, member: Omit<HouseholdMember, 'id'>): Promise<Household> {
    const hh = await this.getHousehold(householdId);
    const newMember: HouseholdMember = {
      id: `mem-${Date.now()}`,
      ...member
    };
    hh.members.push(newMember);
    this.store.households.set(householdId, hh);
    await this.store.persistMemberAdd(householdId, newMember);
    return hh;
  }

  async removeMember(householdId: string, memberId: string): Promise<Household> {
    const hh = await this.getHousehold(householdId);
    hh.members = hh.members.filter(m => m.id !== memberId);
    this.store.households.set(householdId, hh);
    await this.store.persistMemberRemove(memberId);
    return hh;
  }
}
