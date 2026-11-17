import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards, Headers, Req, ForbiddenException } from '@nestjs/common';
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
  ) { }

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
      } catch { }
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
      } catch { }
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
      } catch { }
    }
    return this.marketplaceService.getOrderById(id, currentUser);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; statusReason?: string; substitutionNotes?: string; fulfillmentNotes?: string },
    @Headers('authorization') authHeader?: string,
    @Headers('x-internal-worker-key') internalWorkerKey?: string
  ) {
    let currentUser: any;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      currentUser = await this.authService.verifyToken(token);
    }

    // Phase 6.2.5: Secure Server-Side System Worker Verification & Role Purity
    // Callers must present EITHER a valid worker key OR an authenticated ADMIN token.
    if (internalWorkerKey) {
      const isValidWorker = this.authService.verifyInternalWorker(internalWorkerKey);
      if (!isValidWorker) {
        throw new ForbiddenException('Invalid internal system worker credential.');
      }
      if (currentUser && (currentUser.role === 'CUSTOMER' || currentUser.role === 'RETAILER')) {
        throw new ForbiddenException(
          'Privilege escalation blocked: Authenticated customer and retailer sessions cannot assume SYSTEM_WORKER authority.'
        );
      }
      if (currentUser && ['ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'].includes(currentUser.role)) {
        // ADMIN identity is preserved; do NOT mutate admin account into SYSTEM_WORKER
      } else {
        currentUser = {
          id: 'system-worker',
          email: 'system-worker@internal.rasoiiq.in',
          role: 'SYSTEM_WORKER',
          isSystemWorker: true
        };
      }
    } else {
      // No worker key: validate role permissions
      if (!currentUser) {
        throw new ForbiddenException('Authentication required to update order status.');
      }
      const rawTarget = (body?.status || '').toUpperCase().trim();
      if (currentUser.role === 'CUSTOMER') {
        if (rawTarget !== 'CANCELLED') {
          throw new ForbiddenException('Access denied. Customers are not authorized to advance order delivery status.');
        }
      } else if (currentUser.role === 'RETAILER') {
        if (rawTarget !== 'CANCELLED') {
          throw new ForbiddenException('Access denied. Retailers cannot advance order delivery status without worker credentials.');
        }
      } else {
        const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'OPERATIONS', 'SUPPORT'];
        if (!allowedRoles.includes(currentUser.role)) {
          throw new ForbiddenException(`Access denied. Role "${currentUser.role}" is not authorized for order status updates.`);
        }
      }
    }

    return this.marketplaceService.updateOrderStatus(id, body, currentUser);
  }

  @Post('orders/:id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() body: { reason?: string; statusReason?: string },
    @Headers('authorization') authHeader?: string
  ) {
    let currentUser: any;
    if (authHeader) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        currentUser = await this.authService.verifyToken(token);
      } catch { }
    }
    const statusReason = body.reason || body.statusReason || 'Customer requested order cancellation.';
    return this.marketplaceService.updateOrderStatus(id, { status: 'CANCELLED', statusReason }, currentUser);
  }

  @Get('orders/:id/history')
  async getOrderStatusHistory(
    @Param('id') id: string,
    @Headers('authorization') authHeader?: string
  ) {
    let currentUser: any;
    if (authHeader) {
      try {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        currentUser = await this.authService.verifyToken(token);
      } catch { }
    }
    return this.marketplaceService.getOrderStatusHistory(id, currentUser);
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
      let userRetailerId = req.user.retailerId;
      if (!userRetailerId && req.user.id) {
        try {
          const app = await (this.marketplaceService as any).getRetailerApplicationStatus(req.user.id);
          if (app && app.businessName) {
            userRetailerId = app.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          }
        } catch { }
      }
      userRetailerId = userRetailerId || 'ret-custom-merchant';

      const isMatch =
        userRetailerId === id ||
        userRetailerId === id.replace('retailer-', 'ret-') ||
        id.includes(userRetailerId) ||
        userRetailerId.includes(id);

      if (!isMatch) {
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
