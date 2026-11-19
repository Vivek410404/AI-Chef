import { Controller, Get, Post, Put, Body, Query, Param, Headers, Req, ForbiddenException, NotFoundException, UnauthorizedException, HttpCode } from '@nestjs/common';
import { GroceryService } from './grocery.service';
import { AuthService } from '../auth/auth.service';
import { ScaledIngredientRequirement, GroceryBasket } from '@rasoi/shared-types';

@Controller('grocery')
export class GroceryController {
  constructor(
    private readonly groceryService: GroceryService,
    private readonly authService: AuthService
  ) { }

  private async resolveHouseholdId(authHeader?: string, requestedHouseholdId?: string, req?: any): Promise<string> {
    const hasAuthHeader = authHeader !== undefined && authHeader !== null;
    const cookieToken = req?.cookies?.rasoi_access_token;

    if (hasAuthHeader) {
      const cleanHeader = authHeader.trim();
      if (!cleanHeader.startsWith('Bearer ') && !cleanHeader.startsWith('bearer ')) {
        throw new UnauthorizedException('Malformed authorization header. Expected Bearer scheme.');
      }
      const token = cleanHeader.replace(/^Bearer\s+/i, '').trim();
      if (!token) {
        throw new UnauthorizedException('Authentication token required.');
      }
      return this.verifyAndResolveUserHousehold(token, requestedHouseholdId);
    }

    if (cookieToken) {
      const token = typeof cookieToken === 'string' ? cookieToken.trim() : '';
      if (!token) {
        throw new UnauthorizedException('Authentication token required.');
      }
      return this.verifyAndResolveUserHousehold(token, requestedHouseholdId);
    }

    // Neither authHeader nor cookieToken provided: reject unauthenticated access to household resources
    throw new UnauthorizedException('Authentication required to access household resources.');
  }

  private async verifyAndResolveUserHousehold(token: string, requestedHouseholdId?: string): Promise<string> {
    const user: any = await this.authService.verifyToken(token);
    if (user.role === 'RETAILER') {
      throw new ForbiddenException('Access denied. Retailers cannot access household grocery baskets.');
    }
    if (user.role === 'CUSTOMER') {
      const userId = user.id || user.sub;
      if (requestedHouseholdId) {
        if (requestedHouseholdId === user.householdId) {
          return requestedHouseholdId;
        }
        if (this.authService.store.isPrismaConnected) {
          const member = await this.authService.store.prisma.householdMember.findFirst({
            where: { householdId: requestedHouseholdId, userId, status: 'ACTIVE' }
          });
          if (member) return requestedHouseholdId;
          const hh = await this.authService.store.prisma.household.findUnique({
            where: { id: requestedHouseholdId }
          });
          if (hh && hh.userId === userId) return requestedHouseholdId;
        }

        throw new ForbiddenException(`Access denied. You are not an active member of household "${requestedHouseholdId}".`);
      }
      if (user.householdId) {
        return user.householdId;
      }
      if (this.authService.store.isPrismaConnected) {
        const userMem = await this.authService.store.prisma.householdMember.findFirst({
          where: { userId, status: 'ACTIVE' }
        }) || await this.authService.store.prisma.household.findFirst({
          where: { userId }
        });
        if (userMem) {
          return (userMem as any).householdId || userMem.id;
        }
      }
      throw new ForbiddenException('No active household membership found for authenticated customer.');
    }
    if (['ADMIN', 'SUPER_ADMIN', 'OPERATIONS'].includes(user.role)) {
      return requestedHouseholdId || user.householdId || 'hh-sharma-family';
    }

    throw new ForbiddenException(`Access denied for role "${user.role}".`);
  }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Direct Grocery Marketplace Endpoints
  // ---------------------------------------------------------------------------
  @Get('categories')
  async getCategories() {
    return this.groceryService.getCategories();
  }

  @Get('products')
  async getProducts(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('retailerId') retailerId?: string,
    @Query('available') available?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.groceryService.getProducts({
      q,
      category,
      brand,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      retailerId,
      available: available !== undefined ? available === 'true' : undefined,
      sort,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });
  }

  @Get('search/suggestions')
  async getSearchSuggestions(@Query('q') q?: string) {
    return this.groceryService.getSearchSuggestions(q || '');
  }

  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const product = await this.groceryService.getProductBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product with slug or ID "${slug}" not found.`);
    }
    return product;
  }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Direct Cart Shopping & Single Retailer Conflict
  // ---------------------------------------------------------------------------
  @Post('cart/add')
  async addToCart(
    @Body() body: { productVariantId: string; quantity?: number; retailerId?: string; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.addToCart(householdId, {
      productVariantId: body.productVariantId,
      quantity: body.quantity,
      retailerId: body.retailerId
    });
  }

  @Post('cart/switch-retailer')
  async switchRetailer(
    @Body() body: { retailerId: string; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.switchRetailer(householdId, body.retailerId);
  }

  @Post('cart/update-item')
  async updateCartItem(
    @Body() body: { productVariantId: string; quantity: number; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.updateCartItem(householdId, body.productVariantId, body.quantity);
  }

  @Post('cart/remove-item')
  async removeCartItem(
    @Body() body: { productVariantId: string; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.updateCartItem(householdId, body.productVariantId, 0);
  }

  @Post('cart/clear')
  async clearCart(
    @Body() body: { householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, body?.householdId, req);
    return this.groceryService.clearCart(householdId);
  }

  @Post('basket/reset-for-plan')
  async resetBasketForPlan(
    @Body() body?: { householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, body?.householdId, req);
    return this.groceryService.resetBasketForPlan(householdId);
  }

  @Post('cart/reorder')
  @HttpCode(200)
  async reorderBasket(
    @Body() body: { orderId: string; targetRetailerId?: string; replaceCart?: boolean; householdId?: string; idempotencyKey?: string },
    @Headers('authorization') authHeader?: string,
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Req() req?: any
  ) {
    const rawToken = authHeader?.replace(/^Bearer\s+/i, '') || req?.cookies?.rasoi_access_token;
    if (!rawToken) {
      throw new UnauthorizedException('Authentication required to reorder.');
    }
    const user: any = await this.authService.verifyToken(rawToken);
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);

    return this.groceryService.reorderBasket(
      householdId,
      {
        orderId: body.orderId,
        targetRetailerId: body.targetRetailerId,
        replaceCart: body.replaceCart,
        idempotencyKey: idempotencyHeader || body.idempotencyKey
      },
      user
    );
  }

  @Get('pantry-restock-suggestions')
  async getPantryRestockSuggestions(
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ) {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId, req);
    return this.groceryService.getPantryRestockSuggestions(householdId);
  }

  @Post('pantry/evaluate')
  async evaluatePantry(
    @Body() body: { currentQuantity: any; currentUnit: string; thresholdQuantity?: any; thresholdUnit?: string; piecesPerPack?: number; densityKgPerL?: number }
  ) {
    return this.groceryService.evaluatePantryStockLevel(
      body.currentQuantity,
      body.currentUnit,
      body.thresholdQuantity,
      body.thresholdUnit,
      body.piecesPerPack,
      body.densityKgPerL
    );
  }

  @Post('inventory/evaluate')
  async evaluateInventory(
    @Body() body: { variant: any; requestedQuantity?: number }
  ) {
    return this.groceryService.evaluateInventoryAvailability(
      body.variant,
      body.requestedQuantity
    );
  }

  // ---------------------------------------------------------------------------
  // Existing Meal-Plan Basket Endpoints (Preserved 100%)
  // ---------------------------------------------------------------------------
  @Get('requirements')
  async getRequirements(
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ): Promise<ScaledIngredientRequirement[]> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId, req);
    return this.groceryService.getRequirements(householdId);
  }

  @Get('basket')
  async getBasket(
    @Query('retailerId') retailerId?: string,
    @Query('householdId') queryHouseholdId?: string,
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, queryHouseholdId, req);
    return this.groceryService.getBasket(householdId, retailerId);
  }

  @Post('basket/toggle')
  async toggleBasketItem(
    @Body() body: { ingredientId: string; isSelected: boolean; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.toggleBasketItem(householdId, body.ingredientId, body.isSelected);
  }

  @Put('basket/swap-variant')
  async swapVariant(
    @Body() body: { ingredientId: string; variantId: string; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.swapProductVariant(householdId, body.ingredientId, body.variantId);
  }

  @Put('basket/update-packs')
  async updatePacks(
    @Body() body: { ingredientId: string; packs: number; householdId?: string },
    @Headers('authorization') authHeader?: string,
    @Req() req?: any
  ): Promise<GroceryBasket> {
    const householdId = await this.resolveHouseholdId(authHeader, body.householdId, req);
    return this.groceryService.updateItemPacks(householdId, body.ingredientId, body.packs);
  }
}
