import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { Retailer, ProductVariant } from '@rasoi/shared-types';

@Injectable()
export class MarketplaceService {
  get orders(): any[] {
    return this.store.orders;
  }
  set orders(val: any[]) {
    this.store.orders = val;
  }
  private readonly idempotencyRecords: Map<string, { order: any; timestamp: number }> = new Map();

  constructor(private readonly store: StoreService) {}

  async getRetailers(): Promise<Retailer[]> {
    return this.store.retailers;
  }

  async getProducts(): Promise<ProductVariant[]> {
    return this.store.productVariants;
  }

  async getProductsByIngredient(ingredientId: string): Promise<ProductVariant[]> {
    return this.store.productVariants.filter(v => v.ingredientId === ingredientId);
  }

  async placeOrder(orderData: {
    retailerId: string;
    items: any[];
    totalInr: number;
    deliveryAddress?: string;
    idempotencyKey?: string;
    userId?: string;
    householdId?: string;
  }) {
    if (!orderData.items || orderData.items.length === 0) {
      throw new BadRequestException('Cannot place an order with an empty basket');
    }
    if (!orderData.deliveryAddress || orderData.deliveryAddress.trim() === '') {
      throw new BadRequestException('Delivery address is required for checkout');
    }

    // 1. Transactional Idempotency Key Check
    if (orderData.idempotencyKey) {
      const existing = this.idempotencyRecords.get(orderData.idempotencyKey);
      if (existing) {
        return existing.order;
      }
    }

    const retailer = this.store.retailers.find(
      r => r.id === orderData.retailerId || r.slug === orderData.retailerId || r.id === orderData.retailerId.replace('retailer-', 'ret-')
    );
    if (!retailer) {
      throw new NotFoundException(`Retailer ${orderData.retailerId} not found`);
    }

    // 2. Duplicate Order Submission Prevention:
    // Reject duplicate orders placed within a 5-second sliding window
    const now = Date.now();
    const isDuplicate = this.orders.some(o => {
      const orderTime = new Date(o.placedAt || o.createdAt).getTime();
      return (
        now - orderTime < 5000 &&
        o.retailerId === retailer.id &&
        o.totalAmountInr === orderData.totalInr &&
        o.deliveryAddress === orderData.deliveryAddress &&
        o.itemsCount === orderData.items.length
      );
    });

    if (isDuplicate) {
      throw new BadRequestException('Duplicate order submission detected. Please wait a moment before resubmitting.');
    }

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + (item.priceInr || 0) * (item.quantityPacks || item.quantity || 1),
      0
    );
    const deliveryFee = retailer.deliveryFeeInr || (orderData.totalInr > subtotal ? orderData.totalInr - subtotal : 0);
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `RASOI-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const order = {
      id: orderId,
      orderNumber,
      retailerId: retailer.id,
      retailerName: retailer.name,
      deliveryTimeEstimate: retailer.deliveryTimeEstimate,
      userId: orderData.userId,
      householdId: orderData.householdId || 'hh-sharma-family',
      items: orderData.items.map(item => ({
        ingredientId: item.ingredientId,
        productName: item.productName || item.productVariant?.brand || item.ingredientName || 'Pantry Essential',
        brand: item.brand || item.productVariant?.brand || 'Fresh Produce',
        packSize: item.packSize || item.productVariant?.packSize || 'Standard',
        priceInr: item.priceInr || 0,
        quantity: item.quantityPacks || item.quantity || 1,
        totalItemPriceInr: (item.priceInr || 0) * (item.quantityPacks || item.quantity || 1),
        itemStatus: item.itemStatus || 'AVAILABLE',
        substitutionNotes: item.substitutionNotes || undefined
      })),
      itemsCount: orderData.items.length,
      subtotalInr: subtotal > 0 ? subtotal : Math.max(0, orderData.totalInr - deliveryFee),
      deliveryFeeInr: deliveryFee,
      totalAmountInr: orderData.totalInr,
      status: 'DEMO ORDER CONFIRMED',
      deliveryAddress: orderData.deliveryAddress,
      placedAt: nowIso,
      createdAt: nowIso
    };

    if (orderData.idempotencyKey) {
      this.idempotencyRecords.set(orderData.idempotencyKey, { order, timestamp: now });
    }

    this.orders.unshift(order); // Keep most recent first
    await this.store.persistOrder(order);
    return order;
  }

  async getOrders(currentUser?: any) {
    if (currentUser && currentUser.role === 'CUSTOMER') {
      const userHouseholdId = currentUser.householdId || 'hh-sharma-family';
      return this.orders.filter(
        o => o.householdId === userHouseholdId || (o.userId === currentUser.id && !o.householdId)
      );
    }
    if (currentUser && currentUser.role === 'RETAILER') {
      const userRetailerId = currentUser.retailerId || 'ret-blinkit';
      return this.orders.filter(o => o.retailerId === userRetailerId);
    }
    return this.orders;
  }

  async getOrderById(orderId: string, currentUser?: any) {
    const order = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (currentUser && currentUser.role === 'CUSTOMER') {
      const userHouseholdId = currentUser.householdId || 'hh-sharma-family';
      if (order.householdId && order.householdId !== userHouseholdId) {
        throw new ForbiddenException(`Access denied. Customer is not authorized to access orders of household "${order.householdId}".`);
      }
    }

    if (currentUser && currentUser.role === 'RETAILER') {
      const userRetailerId = currentUser.retailerId || 'ret-blinkit';
      if (order.retailerId !== userRetailerId) {
        throw new ForbiddenException(`Access denied. Retailer is not authorized to access orders of retailer "${order.retailerId}".`);
      }
    }

    return order;
  }

  async updateRetailerProduct(
    retailerId: string,
    variantId: string,
    updates: { inStock?: boolean; customPriceInr?: number; itemStatus?: string }
  ) {
    const retailer = this.store.retailers.find(
      r => r.id === retailerId || r.slug === retailerId || r.id === retailerId.replace('retailer-', 'ret-')
    );
    if (!retailer) {
      throw new NotFoundException(`Retailer ${retailerId} not found`);
    }

    const variant = this.store.productVariants.find(v => v.id === variantId || v.sku === variantId);
    if (!variant) {
      throw new NotFoundException(`Product variant ${variantId} not found`);
    }

    const newPrice = updates.customPriceInr !== undefined ? updates.customPriceInr : (updates as any).priceInr;
    if (newPrice !== undefined && newPrice > 0) {
      variant.sellingPriceInr = newPrice;
    }

    return {
      success: true,
      retailerId: retailer.id,
      variantId: variant.id,
      priceInr: variant.sellingPriceInr,
      updatedPriceInr: variant.sellingPriceInr,
      inStock: updates.inStock ?? true,
      itemStatus: updates.itemStatus || 'AVAILABLE',
      message: `Product ${variant.title} updated successfully for ${retailer.name}`
    };
  }

  async getAdminMetrics() {
    const totalOrders = this.orders.length;
    const totalGmv = this.orders.reduce((sum, o) => sum + (o.totalAmountInr || 0), 0);
    const avgBasketSize = totalOrders > 0 ? Math.round(totalGmv / totalOrders) : 0;
    return {
      totalOrders,
      totalGmv,
      avgBasketSize,
      activePartnersCount: this.store.retailers.length,
      catalogProductVariantsCount: this.store.productVariants.length,
      serviceableAreas: ['Bengaluru', 'Mumbai', 'Delhi-NCR'],
      sampleDataDisclosure: 'All metrics reflect local simulated checkout orders.'
    };
  }

  async getRetailerInventory(retailerId: string, currentUser?: any) {
    const retailer = this.store.retailers.find(
      r => r.id === retailerId || r.slug === retailerId || r.id === retailerId.replace('retailer-', 'ret-')
    );
    if (!retailer) {
      throw new NotFoundException(`Retailer ${retailerId} not found`);
    }

    // Retailer A vs Retailer B resource isolation
    if (currentUser && currentUser.role === 'RETAILER') {
      const userRetailerId = currentUser.retailerId || 'ret-blinkit';
      if (userRetailerId !== retailer.id && userRetailerId !== retailer.slug) {
        throw new ForbiddenException(
          `Access denied. Retailer "${userRetailerId}" is not authorized to inspect "${retailer.id}" inventory.`
        );
      }
    }

    return {
      retailer,
      inventoryCount: this.store.productVariants.length,
      products: this.store.productVariants.slice(0, 10),
      disclosure: 'SAMPLE CATALOG DATA'
    };
  }

  async applyForRetailer(userId: string, data: { businessName: string; contactInformation: any }) {
    if (!data.businessName || data.businessName.trim().length < 2) {
      throw new BadRequestException('Business name is required');
    }

    if (this.store.isPrismaConnected) {
      const prisma = this.store.prisma as any;
      const existing = await prisma.retailerApplication.findFirst({
        where: { userId, applicationStatus: 'PENDING' }
      });
      if (existing) {
        throw new BadRequestException('You already have a pending retailer application under review.');
      }
      const app = await prisma.retailerApplication.create({
        data: {
          userId,
          businessName: data.businessName.trim(),
          contactInformation: data.contactInformation || {},
          applicationStatus: 'PENDING'
        }
      });
      return app;
    }
    return { id: `app-${Date.now()}`, userId, businessName: data.businessName, applicationStatus: 'PENDING' };
  }

  async getRetailerApplicationStatus(userId: string) {
    if (this.store.isPrismaConnected) {
      const prisma = this.store.prisma as any;
      const app = await prisma.retailerApplication.findFirst({
        where: { userId },
        orderBy: { submittedAt: 'desc' }
      });
      return app || { applicationStatus: 'NONE' };
    }
    return { applicationStatus: 'NONE' };
  }

  async getRetailerApplications() {
    if (this.store.isPrismaConnected) {
      const prisma = this.store.prisma as any;
      return prisma.retailerApplication.findMany({
        include: { user: true },
        orderBy: { submittedAt: 'desc' }
      });
    }
    return [];
  }

  async reviewRetailerApplication(id: string, status: 'APPROVED' | 'REJECTED', reviewedBy: string) {
    if (this.store.isPrismaConnected) {
      const prisma = this.store.prisma as any;
      const app = await prisma.retailerApplication.findUnique({
        where: { id }
      });
      if (!app) throw new NotFoundException('Retailer application not found');

      const updated = await prisma.retailerApplication.update({
        where: { id },
        data: {
          applicationStatus: status as any,
          reviewedAt: new Date(),
          reviewedBy
        }
      });

      if (status === 'APPROVED') {
        await this.store.prisma.user.update({
          where: { id: app.userId },
          data: { role: 'RETAILER' }
        });
      }

      return updated;
    }
    return { id, applicationStatus: status, reviewedBy };
  }
}
