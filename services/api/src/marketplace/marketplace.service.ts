import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { StoreService } from '../data/store.service';
import { Retailer, ProductVariant } from '@rasoi/shared-types';
import { evaluateInventoryAvailability } from '../grocery/grocery.service';

@Injectable()
export class MarketplaceService {
  get orders(): any[] {
    return this.store.orders;
  }
  set orders(val: any[]) {
    this.store.orders = val;
  }
  private readonly idempotencyRecords: Map<string, { order: any; timestamp: number }> = new Map();

  constructor(private readonly store: StoreService) { }

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
    retailerId?: string;
    retailerName?: string;
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

    const rawRetailerId = orderData.retailerId || (orderData.retailerName ? `ret-${orderData.retailerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'ret-blinkit');
    const retailer = this.store.retailers.find(
      r => r.id === rawRetailerId || r.slug === rawRetailerId || r.id === rawRetailerId.replace('retailer-', 'ret-') || (orderData.retailerName && r.name.toLowerCase() === orderData.retailerName.toLowerCase())
    );
    if (!retailer) {
      throw new NotFoundException(`Retailer ${orderData.retailerId || orderData.retailerName} not found`);
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

    // Phase 6.2.2: Strict Fail-Closed Inventory Verification during Checkout
    const unverifiedOrUnavailableItems: any[] = [];
    for (const item of orderData.items) {
      const vId = item.productVariantId || item.variantId || item.id;
      let variant: any = null;
      if (this.store.isPrismaConnected && vId) {
        variant = await this.store.prisma.productVariant.findUnique({
          where: { id: vId },
          include: { product: true }
        });
      }
      if (!variant && vId) {
        variant = this.store.productVariants.find(v => v.id === vId);
      }
      if (!variant) {
        unverifiedOrUnavailableItems.push({
          productVariantId: vId || 'unknown',
          productName: item.title || item.name || 'Unknown item',
          status: 'UNKNOWN_AVAILABILITY',
          reason: `Catalog record for variant "${vId}" could not be verified in store inventory.`
        });
      } else {
        const avail = evaluateInventoryAvailability(variant, item.quantityPacks || item.quantity || 1);
        if (!avail.isAvailable) {
          unverifiedOrUnavailableItems.push({
            productVariantId: variant.id,
            productName: variant.title,
            status: avail.status,
            reason: avail.reason
          });
        }
      }
    }

    if (unverifiedOrUnavailableItems.length > 0) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'UNAVAILABLE_ITEMS_IN_CHECKOUT',
        message: `Checkout blocked: ${unverifiedOrUnavailableItems.length} item(s) in your basket are unavailable or cannot be verified.`,
        unverifiedItems: unverifiedOrUnavailableItems
      });
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
        productVariantId: item.productVariantId || item.variantId || item.id,
        variantId: item.variantId || item.productVariantId || item.id,
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
      status: 'ORDER_CONFIRMED',
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
      let userHouseholdId = currentUser.householdId;
      if (!userHouseholdId && this.store.isPrismaConnected) {
        const mem = await this.store.prisma.householdMember.findFirst({
          where: { userId: currentUser.id || currentUser.sub, status: 'ACTIVE' }
        });
        if (mem) userHouseholdId = mem.householdId;
      }
      if (!userHouseholdId) return [];

      if (this.store.isPrismaConnected) {
        const dbOrders = await this.store.prisma.order.findMany({
          where: { householdId: userHouseholdId },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });
        if (dbOrders.length > 0) return dbOrders;
      }
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
    let order: any = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order && this.store.isPrismaConnected) {
      const dbOrder = await this.store.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });
      if (dbOrder) {
        order = {
          ...dbOrder,
          householdId: dbOrder.householdId
        };
      }
    }
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (currentUser && currentUser.role === 'CUSTOMER') {
      const userId = currentUser.id || currentUser.sub;
      let authorized = false;
      if (order.householdId && order.householdId === currentUser.householdId) {
        authorized = true;
      } else if (order.householdId && this.store.isPrismaConnected) {
        const isMember = await this.store.prisma.householdMember.findFirst({
          where: { householdId: order.householdId, userId, status: 'ACTIVE' }
        });
        if (isMember) {
          authorized = true;
        } else {
          const isOwner = await this.store.prisma.household.findFirst({
            where: { id: order.householdId, userId }
          });
          if (isOwner) authorized = true;
        }
      } else if (order.userId === userId) {
        authorized = true;
      }

      if (!authorized) {
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
    let retailer: any = this.store.retailers.find(
      r => r.id === retailerId || r.slug === retailerId || r.id === retailerId.replace('retailer-', 'ret-')
    );

    if (!retailer && this.store.isPrismaConnected) {
      retailer = await this.store.prisma.retailer.findFirst({
        where: {
          OR: [
            { id: retailerId },
            { slug: retailerId },
            { name: { equals: retailerId, mode: 'insensitive' } }
          ]
        }
      });
    }

    if (!retailer) {
      throw new NotFoundException(`Retailer ${retailerId} not found`);
    }

    // Retailer A vs Retailer B resource isolation
    if (currentUser && currentUser.role === 'RETAILER') {
      let userRetailerId = currentUser.retailerId;
      if (!userRetailerId && this.store.isPrismaConnected && (currentUser.id || currentUser.sub)) {
        try {
          const app = await (this.store.prisma as any).retailerApplication.findFirst({
            where: { userId: currentUser.id || currentUser.sub, applicationStatus: 'APPROVED' }
          });
          if (app) {
            userRetailerId = app.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          }
        } catch { }
      }
      userRetailerId = userRetailerId || 'ret-blinkit';

      const isMatch =
        userRetailerId === retailer.id ||
        userRetailerId === retailer.slug ||
        userRetailerId === retailer.id.replace('retailer-', 'ret-') ||
        retailer.slug.includes(userRetailerId) ||
        userRetailerId.includes(retailer.slug);

      if (!isMatch) {
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

      if (app.userId === reviewedBy) {
        throw new ForbiddenException('Staff members are strictly prohibited from reviewing or approving their own retailer application.');
      }

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

  // Canonical state transition machine for orders
  static readonly CANONICAL_MAP: Record<string, string> = {
    'ORDER_CONFIRMED': 'ORDER_CONFIRMED',
    'CONFIRMED': 'ORDER_CONFIRMED',
    'PLACED': 'ORDER_CONFIRMED',
    'DEMO ORDER CONFIRMED': 'ORDER_CONFIRMED',
    'HUB_PACKING': 'HUB_PACKING',
    'PREPARING': 'HUB_PACKING',
    'PACKED': 'HUB_PACKING',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DISPATCHED': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED'
  };

  static readonly CANONICAL_TRANSITIONS: Record<string, string[]> = {
    'ORDER_CONFIRMED': ['HUB_PACKING', 'CANCELLED'],
    'HUB_PACKING': ['OUT_FOR_DELIVERY', 'CANCELLED'],
    'OUT_FOR_DELIVERY': ['DELIVERED'],
    'DELIVERED': [], // Terminal state
    'CANCELLED': []  // Terminal state
  };

  async updateOrderStatus(
    orderId: string,
    dto: { status: string; statusReason?: string; substitutionNotes?: string; fulfillmentNotes?: string },
    currentUser?: any
  ) {
    if (!currentUser) {
      throw new ForbiddenException('Authentication required to modify order status.');
    }

    // 1. Fetch order (from memory or DB)
    let order = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order && this.store.isPrismaConnected) {
      const dbOrder = await this.store.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, statusHistory: true }
      });
      if (dbOrder) {
        order = dbOrder;
        if (!this.orders.find(o => o.id === order.id)) {
          this.orders.unshift(order);
        }
      }
    }

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    // 2. Validate canonical state transition
    const rawTarget = (dto.status || '').toUpperCase().trim();
    const targetCanonical = MarketplaceService.CANONICAL_MAP[rawTarget];
    if (!targetCanonical) {
      throw new BadRequestException(
        `Invalid order status "${dto.status}". Allowed statuses: ORDER_CONFIRMED, HUB_PACKING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED`
      );
    }

    const rawCurrent = (order.status || 'ORDER_CONFIRMED').toUpperCase().trim();
    const currentCanonical = MarketplaceService.CANONICAL_MAP[rawCurrent] || 'ORDER_CONFIRMED';

    // 3. Mandatory cancellation reason (>= 3 non-whitespace characters)
    if (targetCanonical === 'CANCELLED') {
      if (!dto.statusReason || dto.statusReason.trim().length < 3) {
        throw new BadRequestException('A cancellation reason of at least 3 characters is mandatory.');
      }
    }

    // 4. Role-based authorization & cancellation window
    if (currentUser.role === 'CUSTOMER') {
      if (targetCanonical !== 'CANCELLED') {
        throw new ForbiddenException('Access denied. Customers are not authorized to advance order delivery status.');
      }
      const userHouseholdId = currentUser.householdId || currentUser.household_id;
      if (userHouseholdId && order.householdId && order.householdId !== userHouseholdId) {
        throw new ForbiddenException('Access denied. You can only cancel orders placed by your household.');
      }
      if (currentCanonical !== 'ORDER_CONFIRMED') {
        throw new BadRequestException(
          `Customer order cancellation is only permitted when the order is in ORDER_CONFIRMED status. Current status is "${currentCanonical}". Please contact customer support for assistance.`
        );
      }
    } else if (currentUser.role === 'RETAILER') {
      const userRetailerId = currentUser.retailerId || 'ret-blinkit';
      if (order.retailerId && order.retailerId !== userRetailerId) {
        throw new ForbiddenException(
          `Access denied. Retailer "${userRetailerId}" is not authorized to modify status for "${order.retailerId}" order.`
        );
      }
      if (targetCanonical === 'CANCELLED' && currentCanonical !== 'ORDER_CONFIRMED' && currentCanonical !== 'HUB_PACKING') {
        throw new BadRequestException(
          `Retailers may only cancel orders in ORDER_CONFIRMED or HUB_PACKING status. Current status: "${currentCanonical}".`
        );
      }
    } else if (currentUser.role === 'SYSTEM_WORKER') {
      // Authorized internal worker follows canonical state transitions
    } else if (!['ADMIN', 'SUPER_ADMIN', 'OPERATIONS'].includes(currentUser.role)) {
      throw new ForbiddenException(`Role "${currentUser.role}" is not authorized to modify order status.`);
    }

    // Duplicate transition handling: Idempotent no-op
    if (currentCanonical === targetCanonical) {
      const history = this.store.isPrismaConnected
        ? await this.store.prisma.orderStatusHistory.findMany({
          where: { orderId: order.id },
          orderBy: { createdAt: 'desc' }
        })
        : [];
      return {
        success: true,
        isDuplicate: true,
        message: `Order #${order.id} is already in status "${targetCanonical}". Duplicate transition ignored.`,
        order: { ...order, status: targetCanonical },
        statusHistory: history
      };
    }

    const legalNext = MarketplaceService.CANONICAL_TRANSITIONS[currentCanonical] || [];
    if (!legalNext.includes(targetCanonical)) {
      throw new BadRequestException(
        `Illegal state transition from "${currentCanonical}" to "${targetCanonical}". Legal next transitions from "${currentCanonical}" are: ${legalNext.length > 0 ? legalNext.join(', ') : 'None (Order is in terminal state)'
        }`
      );
    }

    // 5. Apply status transition in PostgreSQL and in-memory
    const updatedBy = currentUser.role === 'SYSTEM_WORKER' ? 'system-worker' : (currentUser.email || currentUser.id || 'system');
    const reason = dto.statusReason || `Transitioned from ${currentCanonical} to ${targetCanonical}`;

    if (this.store.isPrismaConnected) {
      try {
        await this.store.prisma.$transaction(async (tx) => {
          // Phase 6.2.5: Concurrency Hardening with Row-Level Exclusive Lock (SELECT ... FOR UPDATE)
          const lockedOrders: any = await tx.$queryRawUnsafe(
            'SELECT id, status FROM "Order" WHERE id = $1 FOR UPDATE',
            order.id
          );
          if (!lockedOrders || lockedOrders.length === 0) {
            throw new NotFoundException(`Order ${order.id} not found in database.`);
          }
          const lockedOrder = lockedOrders[0];
          const dbCurrentRaw = (lockedOrder.status || 'ORDER_CONFIRMED').toUpperCase().trim();
          const dbCurrentCanonical = MarketplaceService.CANONICAL_MAP[dbCurrentRaw] || dbCurrentRaw;

          // If another concurrent request already transitioned this order to targetCanonical:
          if (dbCurrentCanonical === targetCanonical) {
            return;
          }

          // Validate legal state transition under exclusive row lock
          const legalNextUnderLock = MarketplaceService.CANONICAL_TRANSITIONS[dbCurrentCanonical] || [];
          if (!legalNextUnderLock.includes(targetCanonical)) {
            throw new BadRequestException(
              `Illegal concurrent state transition: Order has already transitioned to "${dbCurrentCanonical}". Cannot jump to "${targetCanonical}".`
            );
          }

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: targetCanonical,
              statusReason: reason,
              substitutionNotes: dto.substitutionNotes || (order.substitutionNotes ?? null),
              fulfillmentNotes: dto.fulfillmentNotes || (order.fulfillmentNotes ?? null),
              updatedBy
            }
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              fromStatus: dbCurrentCanonical,
              toStatus: targetCanonical,
              reason,
              changedBy: updatedBy
            }
          });
        });
      } catch (err: any) {
        if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
        throw new BadRequestException(`Failed to persist order transition in database: ${err.message}`);
      }
    }

    // Update in-memory order
    order.status = targetCanonical;
    if (dto.statusReason) order.statusReason = dto.statusReason;
    if (dto.substitutionNotes) order.substitutionNotes = dto.substitutionNotes;
    if (dto.fulfillmentNotes) order.fulfillmentNotes = dto.fulfillmentNotes;
    order.updatedBy = updatedBy;
    order.updatedAt = new Date().toISOString();

    const statusHistory = this.store.isPrismaConnected
      ? await this.store.prisma.orderStatusHistory.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: 'desc' }
      })
      : [];

    return {
      success: true,
      orderId: order.id,
      fromStatus: currentCanonical,
      toStatus: targetCanonical,
      transitionTimestamp: new Date().toISOString(),
      order,
      statusHistory
    };
  }

  async getOrderStatusHistory(orderId: string, currentUser?: any) {
    const order = await this.getOrderById(orderId, currentUser);
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (this.store.isPrismaConnected) {
      return this.store.prisma.orderStatusHistory.findMany({
        where: { orderId: order.id },
        orderBy: { createdAt: 'asc' }
      });
    }
    return [];
  }
}
