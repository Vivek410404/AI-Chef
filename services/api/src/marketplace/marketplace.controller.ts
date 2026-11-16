import { Controller, Get, Post, Put, Body, Param, UseGuards, Headers, Req, ForbiddenException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { Retailer, ProductVariant } from '@rasoi/shared-types';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthService } from '../auth/auth.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly authService: AuthService
  ) {}

  @Get('retailers')
  async getRetailers(): Promise<Retailer[]> {
    return this.marketplaceService.getRetailers();
  }

  @Get('products')
  async getProducts(): Promise<ProductVariant[]> {
    return this.marketplaceService.getProducts();
  }

  @Get('products/by-ingredient/:id')
  async getProductsByIngredient(@Param('id') ingredientId: string): Promise<ProductVariant[]> {
    return this.marketplaceService.getProductsByIngredient(ingredientId);
  }

  @Post('checkout')
  async checkout(
    @Body() body: { retailerId: string; items: any[]; totalInr: number; deliveryAddress?: string; idempotencyKey?: string; householdId?: string },
    @Headers('idempotency-key') idempotencyHeader?: string,
    @Headers('authorization') authHeader?: string
  ) {
    let currentUser: any;
    if (authHeader) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        currentUser = await this.authService.verifyToken(token);
      } catch {}
    }
    return this.marketplaceService.placeOrder({
      ...body,
      idempotencyKey: idempotencyHeader || body.idempotencyKey,
      userId: currentUser?.id,
      householdId: currentUser?.householdId || body.householdId || 'hh-sharma-family'
    });
  }

  @Get('orders')
  async getOrders(@Headers('authorization') authHeader?: string) {
    let currentUser: any;
    if (authHeader) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        currentUser = await this.authService.verifyToken(token);
      } catch {}
    }
    return this.marketplaceService.getOrders(currentUser);
  }

  @Get('orders/:id')
  async getOrderById(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string
  ) {
    let currentUser: any;
    if (authHeader) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        currentUser = await this.authService.verifyToken(token);
      } catch {}
    }
    return this.marketplaceService.getOrderById(id, currentUser);
  }

  // Protected Administrative & Partner Portal Endpoints
  @Get('admin/metrics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'RETAILER')
  async getAdminMetrics() {
    return this.marketplaceService.getAdminMetrics();
  }

  @Get('retailer/:id/inventory')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'RETAILER')
  async getRetailerInventory(@Param('id') id: string, @Req() req: any) {
    return this.marketplaceService.getRetailerInventory(id, req.user);
  }

  @Put('retailer/:id/product/:variantId')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'RETAILER')
  async updateRetailerProduct(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() body: { inStock?: boolean; customPriceInr?: number; itemStatus?: string },
    @Req() req: any
  ) {
    if (req.user.role === 'RETAILER') {
      const userRetailerId = req.user.retailerId || 'ret-blinkit';
      if (userRetailerId !== id && userRetailerId !== id.replace('retailer-', 'ret-')) {
        throw new ForbiddenException(
          `Access denied. Retailer "${userRetailerId}" is not authorized to modify inventory for "${id}".`
        );
      }
    }
    return this.marketplaceService.updateRetailerProduct(id, variantId, body);
  }

  @Post('retailer/apply')
  async applyRetailer(
    @Body() body: { businessName: string; contactInformation?: any },
    @Headers('authorization') authHeader: string
  ) {
    if (!authHeader) {
      throw new ForbiddenException('Authentication required to submit retailer application');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const user: any = await this.authService.verifyToken(token);
    return this.marketplaceService.applyForRetailer(user.id || user.sub, {
      businessName: body.businessName,
      contactInformation: body.contactInformation || {}
    });
  }

  @Get('retailer/application/status')
  async getRetailerApplicationStatus(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new ForbiddenException('Authentication required');
    }
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const user: any = await this.authService.verifyToken(token);
    return this.marketplaceService.getRetailerApplicationStatus(user.id || user.sub);
  }

  @Get('admin/retailer-applications')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getRetailerApplications() {
    return this.marketplaceService.getRetailerApplications();
  }

  @Post('admin/retailer-applications/:id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async reviewRetailerApplication(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
    @Req() req: any
  ) {
    return this.marketplaceService.reviewRetailerApplication(id, body.status, req.user?.id || req.user?.sub || 'admin');
  }
}
