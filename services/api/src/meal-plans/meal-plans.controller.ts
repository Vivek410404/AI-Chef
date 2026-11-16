import { Controller, Get, Post, Put, Delete, Body, Param, Headers, Query, ForbiddenException } from '@nestjs/common';
import { MealPlansService } from './meal-plans.service';
import { AuthService } from '../auth/auth.service';
import { MealPlanItem, DayOfWeek, MealCategory, AISuggestedMeal, MaharajPreparationSummary } from '@rasoi/shared-types';

@Controller('meal-plans')
export class MealPlansController {
  constructor(
    private readonly mealPlansService: MealPlansService,
    private readonly authService: AuthService
  ) {}

  private async resolveHouseholdId(authHeader?: string, requestedHouseholdId?: string): Promise<string> {
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const user: any = await this.authService.verifyToken(token);
      if (user.role === 'RETAILER') {
        throw new ForbiddenException('Access denied. Retailers cannot access household meal plans.');
      }
      if (user.role === 'CUSTOMER') {
        if (requestedHouseholdId) {
          if (requestedHouseholdId === user.householdId) {
            return requestedHouseholdId;
          }
          if (this.authService.store.isPrismaConnected) {
            const member = await this.authService.store.prisma.householdMember.findFirst({
              where: { householdId: requestedHouseholdId, userId: user.id || user.sub }
            });
            if (member) return requestedHouseholdId;
          }
          throw new ForbiddenException(`Access denied. Customer is not authorized to access household "${requestedHouseholdId}".`);
        }
        return user.householdId || 'hh-sharma-family';
      }
      if (user.role === 'ADMIN') {
        return requestedHouseholdId || user.householdId || 'hh-sharma-family';
      }
    }
    return requestedHouseholdId || 'hh-sharma-family';
  }

  @Get()
  async getMealPlans(
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<MealPlanItem[]> {
    return this.getCurrentPlan(queryHouseholdId, authHeader);
  }

  @Get('current')
  async getCurrentPlan(
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<MealPlanItem[]> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.mealPlansService.getCurrentPlan(householdId);
  }

  @Get('maharaj-summary')
  async getMaharajSummary(
    @Query('day') day?: DayOfWeek,
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<MaharajPreparationSummary> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.mealPlansService.getMaharajSummary(householdId, day || 'monday');
  }

  @Post(['item', 'items'])
  async addMealItem(
    @Body() body: {
      dayOfWeek: DayOfWeek;
      mealCategory: MealCategory;
      recipeId: string;
      servings?: number;
      householdId?: string;
    },
    @Headers('authorization') authHeader?: string
  ): Promise<MealPlanItem> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.mealPlansService.addMealItem(householdId, body);
  }

  @Put('item/:id')
  async updateMealItem(
    @Param('id') id: string,
    @Body() body: { servings?: number; recipeId?: string; householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<MealPlanItem> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.mealPlansService.updateMealItem(householdId, id, body);
  }

  @Delete('item/:id')
  async removeMealItem(
    @Param('id') id: string,
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<{ success: boolean }> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.mealPlansService.removeMealItem(householdId, id);
  }

  @Post('apply-ai-plan')
  async applyAiPlan(
    @Body() body: { meals: AISuggestedMeal[]; householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<MealPlanItem[]> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.mealPlansService.applyAiPlan(householdId, body.meals);
  }

  @Post('clear')
  async clearPlan(
    @Body() body?: { householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<{ success: boolean }> {
    const householdId = await this.resolveHouseholdId(authHeader, body?.householdId);
    return this.mealPlansService.clearPlan(householdId);
  }
}
