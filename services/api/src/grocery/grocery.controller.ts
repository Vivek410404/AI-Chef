import { Controller, Get, Post, Put, Body, Query, Headers, ForbiddenException } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { AuthService } from '../auth/auth.service';
import { ScaledIngredientRequirement, GroceryBasket } from '@rasoi/shared-types';

@Controller('grocery')
export class GroceryController {
  constructor(
    private readonly groceryService: GroceryService,
    private readonly authService: AuthService
  ) {}

  private async resolveHouseholdId(authHeader?: string, requestedHouseholdId?: string): Promise<string> {
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const user: any = await this.authService.verifyToken(token);
      if (user.role === 'RETAILER') {
        throw new ForbiddenException('Access denied. Retailers cannot access household grocery baskets.');
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

  @Get('requirements')
  async getRequirements(
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<ScaledIngredientRequirement[]> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.groceryService.getRequirements(householdId);
  }

  @Get('basket')
  async getBasket(
    @Query('retailerId') retailerId?: string,
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId);
    return this.groceryService.getBasket(householdId, retailerId);
  }

  @Post('basket/toggle')
  async toggleBasketItem(
    @Body() body: { ingredientId: string; isSelected: boolean; householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.groceryService.toggleBasketItem(householdId, body.ingredientId, body.isSelected);
  }

  @Put('basket/swap-variant')
  async swapVariant(
    @Body() body: { ingredientId: string; variantId: string; householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.groceryService.swapProductVariant(householdId, body.ingredientId, body.variantId);
  }

  @Put('basket/update-packs')
  async updatePacks(
    @Body() body: { ingredientId: string; packs: number; householdId?: string },
    @Headers('authorization') authHeader?: string
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId);
    return this.groceryService.updateItemPacks(householdId, body.ingredientId, body.packs);
  }
}
