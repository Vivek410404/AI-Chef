import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { StoreService } from '../data/store.service';
import {
  calculateMealPlanRequirements,
  buildGroceryBasket,
  getRetailerMultiplier
} from '@rasoi/grocery-engine';
import {
  ScaledIngredientRequirement,
  GroceryBasket,
  BasketItem,
  ProductVariant,
  Retailer,
  PantryItem
} from '@rasoi/shared-types';

export interface CategoryMetadata {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
}

export const GROCERY_CATEGORIES: Array<Omit<CategoryMetadata, 'productCount'>> = [
  { id: 'fruits', slug: 'fruits', name: 'Fruits', description: 'Fresh seasonal and imported fruits', icon: 'Apple' },
  { id: 'vegetables', slug: 'vegetables', name: 'Vegetables', description: 'Fresh farm vegetables, leafy greens and herbs', icon: 'Carrot' },
  { id: 'dairy-bakery', slug: 'dairy-bakery', name: 'Dairy & Bakery', description: 'Milk, butter, paneer, curd, cheese and fresh bread', icon: 'Milk' },
  { id: 'rice-atta-grains', slug: 'rice-atta-grains', name: 'Rice, Atta & Grains', description: 'Chakki atta, basmati rice, poha, sooji and millets', icon: 'Wheat' },
  { id: 'pulses-lentils', slug: 'pulses-lentils', name: 'Pulses & Lentils', description: 'Unpolished toor, moong, chana, urad dal and rajma', icon: 'CircleDot' },
  { id: 'spices-masalas', slug: 'spices-masalas', name: 'Spices & Masalas', description: 'Pure ground spices, whole spices and blended masalas', icon: 'Flame' },
  { id: 'oil-ghee', slug: 'oil-ghee', name: 'Oil & Ghee', description: 'Desi cow ghee, mustard oil, sunflower and groundnut oil', icon: 'Droplets' },
  { id: 'snacks-biscuits', slug: 'snacks-biscuits', name: 'Snacks & Biscuits', description: 'Khakhra, bhujia, sev, namkeen, cookies and chips', icon: 'Cookie' },
  { id: 'beverages', slug: 'beverages', name: 'Beverages', description: 'Premium CTC tea, roasted coffee, juices and syrups', icon: 'Coffee' },
  { id: 'breakfast-cereals', slug: 'breakfast-cereals', name: 'Breakfast & Cereals', description: 'Cornflakes, oats, instant poha, idli and dosa mixes', icon: 'Sun' },
  { id: 'frozen-packaged-foods', slug: 'frozen-packaged-foods', name: 'Frozen & Packaged Foods', description: 'Ready-to-cook snacks, frozen peas, noodles and sauces', icon: 'Snowflake' },
  { id: 'personal-care', slug: 'personal-care', name: 'Personal Care', description: 'Bathing soaps, oral care, shampoos, oils and creams', icon: 'Sparkles' },
  { id: 'household-cleaning', slug: 'household-cleaning', name: 'Household Cleaning', description: 'Detergents, dishwash liquids, floor and toilet cleaners', icon: 'SprayCan' },
  { id: 'baby-care', slug: 'baby-care', name: 'Baby Care', description: 'Diaper pants, gentle baby soaps, wipes and baby powder', icon: 'Heart' }
];

export const REGIONAL_SYNONYMS: Record<string, string[]> = {
  haldi: ['turmeric', 'haldi'],
  turmeric: ['haldi', 'turmeric'],
  atta: ['wheat flour', 'atta', 'chakki'],
  wheat: ['atta', 'wheat flour'],
  chawal: ['rice', 'basmati', 'chawal'],
  rice: ['chawal', 'rice', 'basmati'],
  toor: ['toor', 'arhar', 'tuver', 'pigeon pea'],
  arhar: ['toor', 'arhar', 'tuver'],
  tuver: ['toor', 'arhar', 'tuver'],
  moong: ['moong', 'mung', 'green gram'],
  mung: ['moong', 'mung'],
  chana: ['chana', 'chole', 'chickpea'],
  chole: ['chana', 'chole', 'chickpea'],
  urad: ['urad', 'black gram'],
  rajma: ['rajma', 'kidney bean'],
  paneer: ['paneer', 'cottage cheese'],
  dahi: ['dahi', 'curd', 'yogurt'],
  curd: ['dahi', 'curd', 'yogurt'],
  yogurt: ['dahi', 'curd', 'yogurt'],
  doodh: ['milk', 'doodh'],
  milk: ['doodh', 'milk'],
  makhan: ['butter', 'makhan'],
  butter: ['makhan', 'butter'],
  ghee: ['ghee', 'clarified butter'],
  tel: ['oil', 'tel'],
  oil: ['oil', 'tel'],
  'sing tel': ['groundnut', 'peanut oil', 'sing tel'],
  singtel: ['groundnut', 'peanut oil', 'sing tel'],
  groundnut: ['sing tel', 'groundnut', 'peanut'],
  besan: ['gram flour', 'besan'],
  'gram flour': ['besan', 'gram flour'],
  sooji: ['semolina', 'sooji', 'suji', 'rava'],
  suji: ['semolina', 'sooji', 'suji', 'rava'],
  rava: ['semolina', 'sooji', 'suji', 'rava'],
  semolina: ['sooji', 'suji', 'rava', 'semolina'],
  poha: ['flattened rice', 'poha', 'aval'],
  jeera: ['cumin', 'jeera'],
  cumin: ['jeera', 'cumin'],
  dhaniya: ['coriander', 'dhaniya'],
  coriander: ['dhaniya', 'coriander'],
  mirch: ['chilli', 'chili', 'mirch'],
  chilli: ['mirch', 'chilli'],
  chili: ['mirch', 'chili'],
  adrak: ['ginger', 'adrak'],
  ginger: ['adrak', 'ginger'],
  lahsun: ['garlic', 'lahsun', 'lasan'],
  garlic: ['lahsun', 'garlic'],
  pyaaz: ['onion', 'pyaaz', 'kanda'],
  kanda: ['onion', 'pyaaz', 'kanda'],
  onion: ['pyaaz', 'kanda', 'onion'],
  aloo: ['potato', 'aloo', 'batata'],
  batata: ['potato', 'aloo', 'batata'],
  potato: ['aloo', 'batata', 'potato'],
  tamatar: ['tomato', 'tamatar'],
  tomato: ['tamatar', 'tomato'],
  namkeen: ['snacks', 'namkeen', 'farsan', 'bhujia', 'sev'],
  farsan: ['snacks', 'namkeen', 'farsan', 'bhujia', 'sev'],
  bhujia: ['namkeen', 'bhujia', 'sev'],
  khakhra: ['khakhra', 'snacks'],
  chai: ['tea', 'chai'],
  tea: ['tea', 'chai'],
  surf: ['detergent', 'surf', 'washing powder'],
  sabun: ['soap', 'sabun', 'detergent'],
  diaper: ['diaper', 'pampers', 'baby care']
};

@Injectable()
export class GroceryService {
  private readonly logger = new Logger(GroceryService.name);
  private activeBasketItems: Map<string, BasketItem[]> = new Map();
  private selectedRetailers: Map<string, string> = new Map();
  private readonly reorderIdempotencyRecords: Map<string, { response: any; fingerprint: string; timestamp: number }> = new Map();
  private readonly householdReorderLocks: Map<string, boolean> = new Map();

  constructor(private readonly store: StoreService) { }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Category Discovery
  // ---------------------------------------------------------------------------
  async getCategories(): Promise<CategoryMetadata[]> {
    let countMap: Record<string, number> = {};

    if (this.store.isPrismaConnected) {
      try {
        const groups = await this.store.prisma.product.groupBy({
          by: ['category'],
          _count: { _all: true }
        });
        for (const g of groups) {
          countMap[g.category] = g._count._all;
        }
      } catch (err: any) {
        this.logger.warn(`Could not fetch category counts from Prisma: ${err.message}`);
      }
    }

    return GROCERY_CATEGORIES.map(cat => ({
      ...cat,
      productCount: countMap[cat.name] || 0
    }));
  }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Product Search & Discovery (Parametric & Regional Synonyms)
  // ---------------------------------------------------------------------------
  async getProducts(params: {
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    retailerId?: string;
    available?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const retailerId = params.retailerId || 'ret-blinkit';
    const activeRetailer = this.store.retailers.find(r => r.id === retailerId) || this.store.retailers[0] || {
      id: 'ret-blinkit',
      name: 'Blinkit'
    };
    const multiplier = getRetailerMultiplier(activeRetailer.name);

    if (this.store.isPrismaConnected) {
      try {
        const where: any = {};

        // 1. Category Matching (by slug or name)
        if (params.category && params.category !== 'all') {
          const matchedCat = GROCERY_CATEGORIES.find(
            c => c.slug === params.category || c.id === params.category || c.name.toLowerCase() === params.category!.toLowerCase()
          );
          if (matchedCat) {
            where.category = matchedCat.name;
          } else {
            where.category = { equals: params.category, mode: 'insensitive' };
          }
        }

        // 2. Brand Matching
        if (params.brand && params.brand !== 'all') {
          where.brand = { equals: params.brand, mode: 'insensitive' };
        }

        // 3. Availability Filter
        if (params.available !== undefined) {
          where.status = params.available ? 'ACTIVE' : undefined;
        }

        // 4. Indian/Regional Synonym Search
        if (params.q && params.q.trim().length > 0) {
          const rawQuery = params.q.trim().toLowerCase();
          const searchTokens = new Set<string>([rawQuery]);

          // Expand synonyms
          for (const [key, synList] of Object.entries(REGIONAL_SYNONYMS)) {
            if (rawQuery.includes(key) || key.includes(rawQuery)) {
              for (const s of synList) searchTokens.add(s);
            }
          }

          const orClauses: any[] = [];
          for (const token of searchTokens) {
            orClauses.push({ title: { contains: token, mode: 'insensitive' } });
            orClauses.push({ brand: { contains: token, mode: 'insensitive' } });
            orClauses.push({ category: { contains: token, mode: 'insensitive' } });
            orClauses.push({ description: { contains: token, mode: 'insensitive' } });
            orClauses.push({ tags: { has: token } });
          }
          where.OR = orClauses;
        }

        // 5. Price filtering
        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
          const variantFilter: any = {};
          if (params.minPrice !== undefined) variantFilter.gte = Number(params.minPrice);
          if (params.maxPrice !== undefined) variantFilter.lte = Number(params.maxPrice);
          where.variants = {
            some: {
              sellingPriceInr: variantFilter
            }
          };
        }

        // Sorting
        let orderBy: any = { createdAt: 'desc' };
        if (params.sort === 'name-asc') {
          orderBy = { title: 'asc' };
        } else if (params.sort === 'brand-asc') {
          orderBy = { brand: 'asc' };
        }

        const [total, dbProducts, distinctBrands] = await Promise.all([
          this.store.prisma.product.count({ where }),
          this.store.prisma.product.findMany({
            where,
            include: {
              variants: {
                orderBy: { sellingPriceInr: 'asc' }
              }
            },
            skip,
            take: limit,
            orderBy
          }),
          this.store.prisma.product.findMany({
            select: { brand: true },
            distinct: ['brand']
          })
        ]);

        // Map and attach retailer pricing
        let products = dbProducts.map((p: any) => {
          const primaryVariant = p.variants[0];
          const mrpInr = primaryVariant ? primaryVariant.mrpInr : 0;
          const basePriceInr = primaryVariant ? primaryVariant.sellingPriceInr : 0;
          const displayPriceInr = Math.round(basePriceInr * multiplier);
          const discountInr = Math.max(0, mrpInr - displayPriceInr);

          return {
            id: p.id,
            slug: p.slug || p.id,
            title: p.title,
            brand: p.brand,
            category: p.category,
            imageUrl: p.imageUrl,
            description: p.description,
            tags: p.tags,
            status: p.status,
            isSampleData: p.isSampleData,
            variants: p.variants.map((v: any) => ({
              id: v.id,
              sku: v.sku,
              title: v.title,
              packQuantity: v.packQuantity,
              packUnit: v.packUnit,
              mrpInr: v.mrpInr,
              sellingPriceInr: Math.round(v.sellingPriceInr * multiplier),
              baseSellingPriceInr: v.sellingPriceInr,
              inStock: v.inStock
            })),
            primaryVariant: primaryVariant ? {
              ...primaryVariant,
              sellingPriceInr: displayPriceInr
            } : null,
            retailerInfo: {
              retailerId: activeRetailer.id,
              retailerName: activeRetailer.name,
              priceInr: displayPriceInr,
              mrpInr,
              discountInr,
              deliveryTimeEstimate: (activeRetailer as any).deliveryTimeEstimate || '10-15 mins'
            }
          };
        });

        // Price in-memory sorting if requested (since pricing is computed per variant & multiplier)
        if (params.sort === 'price-asc') {
          products.sort((a: any, b: any) => (a.primaryVariant?.sellingPriceInr || 0) - (b.primaryVariant?.sellingPriceInr || 0));
        } else if (params.sort === 'price-desc') {
          products.sort((a: any, b: any) => (b.primaryVariant?.sellingPriceInr || 0) - (a.primaryVariant?.sellingPriceInr || 0));
        }

        return {
          products,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          },
          availableBrands: distinctBrands.map((b: any) => b.brand).filter(Boolean).sort(),
          activeRetailer: {
            id: activeRetailer.id,
            name: activeRetailer.name
          }
        };
      } catch (err: any) {
        this.logger.error(`Error querying products from Prisma: ${err.message}`);
      }
    }

    // Fallback: in-memory / empty if DB down
    return {
      products: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
      availableBrands: [],
      activeRetailer: { id: activeRetailer.id, name: activeRetailer.name }
    };
  }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Product Details & Multi-Retailer Variant Comparison
  // ---------------------------------------------------------------------------
  async getProductBySlug(slugOrId: string) {
    if (!this.store.isPrismaConnected) {
      return null;
    }

    const product = await this.store.prisma.product.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }]
      },
      include: {
        variants: {
          include: {
            storeProducts: {
              include: {
                store: {
                  include: {
                    retailer: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!product) return null;

    // Available retailers in system
    const allRetailers: Retailer[] = this.store.retailers;

    // Build multi-retailer price matrix for each variant
    const variantsWithRetailers = product.variants.map((v: any) => {
      const comparisons = allRetailers.map(ret => {
        const factor = getRetailerMultiplier(ret.name);
        const storeMatch = v.storeProducts.find((sp: any) => sp.store?.retailerId === ret.id);
        const priceInr = storeMatch ? Math.round(storeMatch.localPriceInr) : Math.round(v.sellingPriceInr * factor);
        const inStock = storeMatch ? storeMatch.inStock : v.inStock;

        return {
          retailerId: ret.id,
          retailerName: ret.name,
          retailerSlug: ret.slug,
          logoUrl: ret.logoUrl,
          deliveryTimeEstimate: ret.deliveryTimeEstimate,
          priceInr,
          mrpInr: v.mrpInr,
          discountInr: Math.max(0, v.mrpInr - priceInr),
          inStock,
          isLowestPrice: false
        };
      });

      const lowestPrice = Math.min(...comparisons.map(c => c.priceInr));
      for (const c of comparisons) {
        if (c.priceInr === lowestPrice) c.isLowestPrice = true;
      }

      return {
        id: v.id,
        sku: v.sku,
        title: v.title,
        packQuantity: v.packQuantity,
        packUnit: v.packUnit,
        mrpInr: v.mrpInr,
        basePriceInr: v.sellingPriceInr,
        inStock: v.inStock,
        retailerComparisons: comparisons
      };
    });

    // Related products in the same category
    const relatedProducts = await this.store.prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id }
      },
      take: 4,
      include: {
        variants: true
      }
    });

    return {
      id: product.id,
      slug: product.slug || product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl,
      description: product.description,
      tags: product.tags,
      status: product.status,
      isSampleData: product.isSampleData,
      variants: variantsWithRetailers,
      relatedProducts: relatedProducts.map((rp: any) => ({
        id: rp.id,
        slug: rp.slug || rp.id,
        title: rp.title,
        brand: rp.brand,
        category: rp.category,
        imageUrl: rp.imageUrl,
        startingPriceInr: rp.variants[0]?.sellingPriceInr || 0
      }))
    };
  }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Search Autocomplete Suggestions
  // ---------------------------------------------------------------------------
  async getSearchSuggestions(query: string) {
    if (!query || query.trim().length === 0) return [];
    const term = query.trim().toLowerCase();

    // Check regional synonyms
    const searchTerms = [term];
    for (const [key, syns] of Object.entries(REGIONAL_SYNONYMS)) {
      if (term.includes(key) || key.includes(term)) {
        searchTerms.push(...syns);
      }
    }

    const suggestions: Array<{ type: 'product' | 'brand' | 'category'; label: string; slug?: string; category?: string }> = [];

    // 1. Categories
    for (const cat of GROCERY_CATEGORIES) {
      if (cat.name.toLowerCase().includes(term) || cat.slug.includes(term)) {
        suggestions.push({ type: 'category', label: cat.name, slug: cat.slug });
      }
    }

    if (this.store.isPrismaConnected) {
      try {
        const orClauses = searchTerms.map(t => ({ title: { contains: t, mode: 'insensitive' } }));
        const matchedProducts = await this.store.prisma.product.findMany({
          where: { OR: orClauses },
          select: { title: true, slug: true, category: true, brand: true },
          take: 6
        });

        for (const p of matchedProducts) {
          suggestions.push({
            type: 'product',
            label: p.title,
            slug: p.slug || undefined,
            category: p.category
          });
        }

        // Distinct matching brands
        const matchedBrands = await this.store.prisma.product.findMany({
          where: { brand: { contains: term, mode: 'insensitive' } },
          select: { brand: true },
          distinct: ['brand'],
          take: 3
        });
        for (const b of matchedBrands) {
          if (!suggestions.some(s => s.label.toLowerCase() === b.brand.toLowerCase())) {
            suggestions.push({ type: 'brand', label: b.brand });
          }
        }
      } catch (err: any) {
        this.logger.warn(`Search suggestions query error: ${err.message}`);
      }
    }

    return suggestions.slice(0, 8);
  }

  // ---------------------------------------------------------------------------
  // Phase 6.1: Direct Cart Shopping & Single Retailer Conflict Enforcement
  // ---------------------------------------------------------------------------
  async addToCart(
    householdId = 'hh-sharma-family',
    body: { productVariantId: string; quantity?: number; retailerId?: string }
  ) {
    const qty = Math.max(1, Number(body.quantity) || 1);
    let variant: any = null;

    if (this.store.isPrismaConnected) {
      variant = await this.store.prisma.productVariant.findUnique({
        where: { id: body.productVariantId },
        include: { product: true }
      });
    }

    if (!variant) {
      variant = this.store.productVariants.find(v => v.id === body.productVariantId);
    }

    if (!variant) {
      throw new NotFoundException(`Product variant "${body.productVariantId}" not found.`);
    }

    // Phase 6.2.2: Strict Fail-Closed Inventory Availability Check
    const avail = evaluateInventoryAvailability(variant, qty);
    if (!avail.isAvailable) {
      throw new BadRequestException(
        `Cannot add "${variant.title}" to cart: ${avail.reason} (Status: ${avail.status})`
      );
    }

    const currentRetailerId = this.selectedRetailers.get(householdId) || this.store.retailers[0]?.id || 'ret-blinkit';
    const currentRetailer = this.store.retailers.find(r => r.id === currentRetailerId) || { id: currentRetailerId, name: 'Blinkit' };

    // Retailer conflict detection: If requested retailer differs from cart's current retailer
    if (body.retailerId && body.retailerId !== currentRetailerId) {
      const activeItems = (this.activeBasketItems.get(householdId) || []).filter(i => i.isSelectedForPurchase && i.quantityPacks > 0);
      if (activeItems.length > 0) {
        const newRetailer = this.store.retailers.find(r => r.id === body.retailerId) || { id: body.retailerId, name: body.retailerId };
        return {
          conflict: true,
          currentRetailer: currentRetailer.name,
          currentRetailerId: currentRetailer.id,
          newRetailer: newRetailer.name,
          newRetailerId: newRetailer.id,
          currentItemCount: activeItems.length,
          incomingVariantId: body.productVariantId,
          incomingQuantity: qty,
          message: `Your shopping cart contains ${activeItems.length} items from ${currentRetailer.name}. RasoiIQ supports one retailer per checkout to ensure single-trip delivery.`
        };
      }
      // If basket was empty, seamlessly set retailer
      this.selectedRetailers.set(householdId, body.retailerId);
    }

    // Add or increment item
    let items = this.activeBasketItems.get(householdId) || [];
    const existingIdx = items.findIndex(i => i.productVariantId === variant.id);

    if (existingIdx >= 0) {
      items[existingIdx].quantityPacks += qty;
      items[existingIdx].isSelectedForPurchase = true;
      items[existingIdx].totalPriceInr = items[existingIdx].quantityPacks * items[existingIdx].productVariant.sellingPriceInr;
    } else {
      const directItem: BasketItem = {
        id: `direct-${variant.id}-${Date.now()}`,
        ingredientId: variant.ingredientId || variant.id,
        productVariantId: variant.id,
        productVariant: {
          id: variant.id,
          productId: variant.productId,
          sku: variant.sku,
          brand: variant.brand,
          title: variant.title,
          packQuantity: variant.packQuantity,
          packUnit: variant.packUnit as any,
          mrpInr: variant.mrpInr,
          sellingPriceInr: variant.sellingPriceInr,
          imageUrl: variant.imageUrl,
          ingredientId: variant.ingredientId || ''
        },
        quantityPacks: qty,
        totalQuantity: qty * variant.packQuantity,
        totalPriceInr: qty * variant.sellingPriceInr,
        isSelectedForPurchase: true,
        availableAtHome: false,
        associatedRecipeIds: [],
        associatedRecipeNames: [],
        itemStatus: 'AVAILABLE'
      };
      items.push(directItem);
    }

    this.activeBasketItems.set(householdId, items);
    const basket = await this.getBasket(householdId, this.selectedRetailers.get(householdId));
    return { success: true, conflict: false, basket };
  }

  async switchRetailer(householdId = 'hh-sharma-family', newRetailerId: string) {
    let validRetailer = this.store.retailers.find(r => r.id === newRetailerId);
    if (!validRetailer && this.store.isPrismaConnected) {
      const dbRet = await this.store.prisma.retailer.findUnique({ where: { id: newRetailerId } });
      if (dbRet) {
        validRetailer = dbRet as any;
      }
    }
    if (!validRetailer) {
      throw new Error(`Invalid retailer "${newRetailerId}".`);
    }
    this.selectedRetailers.set(householdId, newRetailerId);
    const basket = await this.getBasket(householdId, newRetailerId);

    // Phase 6.2.7: Persist selected retailer and basket totals to PostgreSQL
    if (this.store.isPrismaConnected) {
      try {
        const hhExists = await this.store.prisma.household.findUnique({ where: { id: householdId } });
        if (hhExists) {
          const existing = await this.store.prisma.basket.findFirst({ where: { householdId } });
          if (existing) {
            await this.store.prisma.basket.update({
              where: { id: existing.id },
              data: {
                selectedRetailerId: newRetailerId,
                subtotalInr: basket.subtotalInr,
                deliveryFeeInr: basket.deliveryFeeInr,
                totalInr: basket.totalInr
              }
            });
          } else {
            await this.store.prisma.basket.create({
              data: {
                householdId,
                selectedRetailerId: newRetailerId,
                subtotalInr: basket.subtotalInr,
                deliveryFeeInr: basket.deliveryFeeInr,
                totalInr: basket.totalInr
              }
            });
          }
        }
      } catch (e: any) {
        this.logger.warn(`Failed to persist basket to PostgreSQL: ${e.message}`);
      }
    }

    return { success: true, basket };
  }

  async updateCartItem(householdId = 'hh-sharma-family', variantId: string, quantity: number) {
    let items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.productVariantId === variantId || i.ingredientId === variantId);

    if (item) {
      if (quantity <= 0) {
        items = items.filter(i => i !== item);
      } else {
        item.quantityPacks = quantity;
        item.isSelectedForPurchase = true;
        item.totalPriceInr = item.quantityPacks * item.productVariant.sellingPriceInr;
      }
      this.activeBasketItems.set(householdId, items);
    }

    return this.getBasket(householdId);
  }

  async clearCart(householdId = 'hh-sharma-family') {
    let existing = this.activeBasketItems.get(householdId);
    if (!existing || existing.length === 0) {
      const current = await this.getBasket(householdId);
      existing = current.items || [];
    }
    // 1. Mark all existing basket items as deselected with 0 quantity
    const items = existing.map(i => ({
      ...i,
      isSelectedForPurchase: false,
      quantityPacks: 0,
      totalPriceInr: 0
    }));
    this.activeBasketItems.set(householdId, items);

    // 2. Clear persisted basket items in database
    if (this.store.isPrismaConnected) {
      try {
        const dbBasket = await this.store.prisma.basket.findFirst({ where: { householdId } });
        if (dbBasket) {
          await this.store.prisma.basketItem.deleteMany({ where: { basketId: dbBasket.id } });
          await this.store.prisma.basket.update({
            where: { id: dbBasket.id },
            data: { subtotalInr: 0, deliveryFeeInr: 0, totalInr: 0 }
          });
        }
      } catch {}
    }

    const currentRetailerId = this.selectedRetailers.get(householdId) || this.store.retailers[0]?.id || 'ret-blinkit';
    const retailers = this.store.retailers;

    return {
      id: `basket-${householdId}`,
      householdId,
      selectedRetailerId: currentRetailerId,
      items,
      subtotalInr: 0,
      deliveryFeeInr: 0,
      totalInr: 0,
      mrpTotalInr: 0,
      discountInr: 0,
      comparisons: retailers.map(r => ({
        retailer: r,
        subtotalInr: 0,
        deliveryFeeInr: 0,
        estimatedTotalInr: 0,
        missingItemsCount: 0,
        isCheapest: false,
        isFastest: false
      }))
    };
  }

  async resetBasketForPlan(householdId = 'hh-sharma-family') {
    this.activeBasketItems.delete(householdId);
    return this.getBasket(householdId);
  }

  // ---------------------------------------------------------------------------
  // Existing Meal-Plan Basket Methods (Preserved 100%)
  // ---------------------------------------------------------------------------
  async getRequirements(householdId = 'hh-sharma-family'): Promise<ScaledIngredientRequirement[]> {
    const mealPlanItems = this.store.mealPlanItems.get(householdId) || [];
    const pantryItems = this.store.pantryItems.get(householdId) || [];
    return calculateMealPlanRequirements(mealPlanItems, pantryItems);
  }

  async getBasket(householdId = 'hh-sharma-family', retailerId?: string): Promise<GroceryBasket> {
    const requirements = await this.getRequirements(householdId);
    const existing = this.activeBasketItems.get(householdId) || [];

    if (retailerId) {
      this.selectedRetailers.set(householdId, retailerId);
    } else if (!this.selectedRetailers.has(householdId) && this.store.isPrismaConnected) {
      try {
        const dbBasket = await this.store.prisma.basket.findFirst({ where: { householdId } });
        if (dbBasket?.selectedRetailerId) {
          this.selectedRetailers.set(householdId, dbBasket.selectedRetailerId);
        }
      } catch {}
    }
    const currentRetailerId = this.selectedRetailers.get(householdId) || this.store.retailers[0]?.id || 'ret-blinkit';

    const basketResult = buildGroceryBasket(
      requirements,
      this.store.productVariants,
      this.store.retailers,
      currentRetailerId,
      existing
    );

    // Save basket items state
    this.activeBasketItems.set(householdId, basketResult.items);

    return {
      id: `basket-${householdId}`,
      householdId,
      selectedRetailerId: currentRetailerId,
      items: basketResult.items,
      subtotalInr: basketResult.subtotalInr,
      deliveryFeeInr: basketResult.deliveryFeeInr,
      totalInr: basketResult.totalInr,
      mrpTotalInr: basketResult.mrpTotalInr,
      discountInr: basketResult.discountInr,
      comparisons: basketResult.comparisons
    };
  }

  async toggleBasketItem(
    householdId = 'hh-sharma-family',
    ingredientId: string,
    isSelected: boolean
  ): Promise<GroceryBasket> {
    const items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.ingredientId === ingredientId || i.productVariantId === ingredientId);
    if (item) {
      item.isSelectedForPurchase = isSelected;
    }
    this.activeBasketItems.set(householdId, items);
    return this.getBasket(householdId);
  }

  async swapProductVariant(
    householdId = 'hh-sharma-family',
    ingredientId: string,
    variantId: string
  ): Promise<GroceryBasket> {
    const items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.ingredientId === ingredientId);
    let newVariant = this.store.productVariants.find(v => v.id === variantId);

    if (!newVariant && this.store.isPrismaConnected) {
      const dbV = await this.store.prisma.productVariant.findUnique({ where: { id: variantId } });
      if (dbV) {
        newVariant = {
          id: dbV.id,
          productId: dbV.productId,
          sku: dbV.sku,
          brand: dbV.brand,
          title: dbV.title,
          packQuantity: dbV.packQuantity,
          packUnit: dbV.packUnit as any,
          mrpInr: dbV.mrpInr,
          sellingPriceInr: dbV.sellingPriceInr,
          imageUrl: dbV.imageUrl,
          ingredientId: dbV.ingredientId || ''
        };
      }
    }

    if (item && newVariant) {
      item.productVariantId = newVariant.id;
      item.productVariant = newVariant;
      item.totalPriceInr = item.quantityPacks * newVariant.sellingPriceInr;
    }

    this.activeBasketItems.set(householdId, items);
    return this.getBasket(householdId);
  }

  async updateItemPacks(
    householdId = 'hh-sharma-family',
    ingredientId: string,
    packs: number
  ): Promise<GroceryBasket> {
    const items = this.activeBasketItems.get(householdId) || [];
    const item = items.find(i => i.ingredientId === ingredientId || i.productVariantId === ingredientId);
    if (item) {
      item.quantityPacks = Math.max(0, packs);
      item.totalPriceInr = item.quantityPacks * item.productVariant.sellingPriceInr;
    }
    this.activeBasketItems.set(householdId, items);
    return this.getBasket(householdId);
  }

  async assertHouseholdMembership(user: any, householdId: string): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('Authentication required to access household reorder.');
    }
    if (user.role === 'RETAILER') {
      throw new ForbiddenException('Access denied. Retailers cannot access household grocery baskets.');
    }
    if (['ADMIN', 'SUPER_ADMIN', 'OPERATIONS'].includes(user.role)) {
      return; // Authorized administrative access
    }
    if (user.role === 'CUSTOMER') {
      if (user.status === 'SUSPENDED') {
        throw new ForbiddenException('Account has been suspended. Access denied.');
      }
      const userId = user.id || user.sub;
      if (!userId) {
        throw new ForbiddenException('Invalid user identification.');
      }

      // Check if user is member in database
      if (this.store.isPrismaConnected) {
        const member = await this.store.prisma.householdMember.findFirst({
          where: { householdId, userId, status: 'ACTIVE' }
        });
        if (member) {
          if (member.role === 'COOK') {
            throw new ForbiddenException('Household members with COOK role are not permitted to trigger grocery reorders.');
          }
          return;
        }

        const household = await this.store.prisma.household.findUnique({
          where: { id: householdId }
        });
        if (household && household.userId === userId) return;
      }

      // Check in-memory store
      if (user.householdId === householdId) return;

      throw new ForbiddenException(`Household access violation: You are not an active member of household "${householdId}".`);
    }

    throw new ForbiddenException(`Role "${user.role}" is not authorized for household reorders.`);
  }

  // ---------------------------------------------------------------------------
  // Phase 6.2.5: 1-Click Reorder Integrity, 13-Step Authorization & Mutex Hardening
  // ---------------------------------------------------------------------------
  async reorderBasket(
    householdId = 'hh-sharma-family',
    options: { orderId: string; targetRetailerId?: string; replaceCart?: boolean; idempotencyKey?: string },
    user?: any
  ) {
    if (!options.orderId) {
      throw new BadRequestException('orderId is required to reorder.');
    }

    // Step 1 - 3: Caller Authentication & Household Membership Verification BEFORE Cache Return
    if (user) {
      await this.assertHouseholdMembership(user, householdId);
    }

    // Step 4: Validate source order belongs to the authorized household BEFORE Cache Return
    let order: any = this.store.orders.find(o => o.id === options.orderId || o.orderNumber === options.orderId);
    let orderHouseholdId = order?.householdId;
    let orderUserId = order?.userId;

    if (!order && this.store.isPrismaConnected) {
      const dbOrder = await this.store.prisma.order.findUnique({
        where: { id: options.orderId },
        include: { items: true, user: { include: { householdMembers: true } } }
      });
      if (dbOrder) {
        orderUserId = dbOrder.userId;
        orderHouseholdId = dbOrder.householdId || dbOrder.user?.householdMembers?.[0]?.householdId;
        order = {
          ...dbOrder,
          householdId: orderHouseholdId,
          items: dbOrder.items.map(it => ({
            productVariantId: it.productVariantId,
            productName: it.productName,
            brand: it.brand,
            packSize: it.packSize,
            quantity: it.quantityPacks,
            priceInr: it.unitPriceInr
          }))
        };
      }
    }

    if (!order) {
      throw new NotFoundException(`Order "${options.orderId}" not found.`);
    }

    if (orderHouseholdId && orderHouseholdId !== householdId) {
      throw new ForbiddenException(
        `Household access violation: You cannot reorder orders belonging to household "${orderHouseholdId}".`
      );
    }

    if (user && user.role === 'CUSTOMER' && orderUserId && orderUserId !== (user.id || user.sub)) {
      if (this.store.isPrismaConnected) {
        const orderUserMember = await this.store.prisma.householdMember.findFirst({
          where: { householdId, userId: orderUserId }
        });
        if (!orderUserMember) {
          throw new ForbiddenException(
            `Household access violation: Order does not belong to your household.`
          );
        }
      }
    }

    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new BadRequestException('This order contains no items to reorder.');
    }

    // Step 5: Validate and normalize the idempotency key and request parameters
    let normalizedIdempotencyKey: string | null = null;
    if (options.idempotencyKey !== undefined && options.idempotencyKey !== null) {
      if (typeof options.idempotencyKey !== 'string') {
        throw new BadRequestException('Idempotency key must be a valid string.');
      }
      const trimmed = options.idempotencyKey.trim();
      if (trimmed.length === 0 || trimmed.length > 128) {
        throw new BadRequestException('Idempotency key length must be between 1 and 128 characters.');
      }
      if (!/^[a-zA-Z0-9_\-:]+$/.test(trimmed)) {
        throw new BadRequestException('Idempotency key contains invalid characters. Allowed: alphanumeric, -, _, :');
      }
      normalizedIdempotencyKey = trimmed;
    }

    const canonicalPayload = {
      orderId: String(order.id).trim(),
      replaceCart: Boolean(options.replaceCart),
      targetRetailerId: options.targetRetailerId ? String(options.targetRetailerId).trim() : null
    };
    const requestFingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(canonicalPayload))
      .digest('hex');

    const scopedIdempotencyKey = normalizedIdempotencyKey
      ? `reorder:${householdId}:${normalizedIdempotencyKey}`
      : null;

    // Step 6: Check idempotency cache (Only after caller authorization & order ownership have succeeded!)
    if (scopedIdempotencyKey) {
      const cached = this.reorderIdempotencyRecords.get(scopedIdempotencyKey);
      if (cached) {
        if (Date.now() - cached.timestamp < 300000) {
          if (cached.fingerprint !== requestFingerprint) {
            throw new ConflictException({
              statusCode: 409,
              error: 'IDEMPOTENCY_CONFLICT',
              message: `Idempotency key "${normalizedIdempotencyKey}" was previously used with a different request payload. Reusing an idempotency key with conflicting parameters is prohibited.`
            });
          }
          return {
            ...cached.response,
            isIdempotentReplay: true
          };
        } else {
          this.reorderIdempotencyRecords.delete(scopedIdempotencyKey);
        }
      }
    }

    // Step 7: Acquire the household-scoped mutex
    while (this.householdReorderLocks.get(householdId)) {
      await new Promise(r => setTimeout(r, 20));
    }
    this.householdReorderLocks.set(householdId, true);

    try {
      // Step 8: Recheck household membership and authorization under the lock
      if (user) {
        await this.assertHouseholdMembership(user, householdId);
      }

      // Step 9: Recheck the cache under the lock
      if (scopedIdempotencyKey) {
        const cachedUnderLock = this.reorderIdempotencyRecords.get(scopedIdempotencyKey);
        if (cachedUnderLock) {
          if (Date.now() - cachedUnderLock.timestamp < 300000) {
            if (cachedUnderLock.fingerprint !== requestFingerprint) {
              throw new ConflictException({
                statusCode: 409,
                error: 'IDEMPOTENCY_CONFLICT',
                message: `Idempotency key "${normalizedIdempotencyKey}" was previously used with a different request payload.`
              });
            }
            return {
              ...cachedUnderLock.response,
              isIdempotentReplay: true
            };
          } else {
            this.reorderIdempotencyRecords.delete(scopedIdempotencyKey);
          }
        }
      }

      // 3. Resolve target retailer
      let targetRetailer: any = null;
      if (options.targetRetailerId) {
        targetRetailer = this.store.retailers.find(
          r => r.id === options.targetRetailerId || r.slug === options.targetRetailerId
        );
      }
      if (!targetRetailer) {
        const origRetailerName = order.retailerName || 'Blinkit';
        targetRetailer = this.store.retailers.find(
          r => r.id === order.retailerId || r.name.toLowerCase() === origRetailerName.toLowerCase()
        ) || this.store.retailers[0];
      }

      // 4. Retailer conflict check against current active cart
      const currentRetailerId = this.selectedRetailers.get(householdId) || this.store.retailers[0]?.id || 'ret-blinkit';
      const currentRetailer = this.store.retailers.find(r => r.id === currentRetailerId) || this.store.retailers[0];
      const existingActiveItems = (this.activeBasketItems.get(householdId) || []).filter(
        i => i.isSelectedForPurchase && i.quantityPacks > 0
      );

      if (existingActiveItems.length > 0 && currentRetailerId !== targetRetailer.id && !options.replaceCart) {
        return {
          success: false,
          requiresRetailerSwitch: true,
          currentRetailer: currentRetailer.name,
          currentRetailerId: currentRetailer.id,
          targetRetailer: targetRetailer.name,
          targetRetailerId: targetRetailer.id,
          currentItemCount: existingActiveItems.length,
          message: `Your shopping basket already contains ${existingActiveItems.length} items from ${currentRetailer.name}. Reordering from ${targetRetailer.name} requires switching retailers. Set replaceCart: true to proceed.`
        };
      }

      if (options.replaceCart || existingActiveItems.length === 0) {
        this.activeBasketItems.set(householdId, []);
        this.selectedRetailers.set(householdId, targetRetailer.id);
      }

      // 5. Revalidate every item against current catalog prices and fail-closed availability
      const addedItems: any[] = [];
      const unavailableItems: any[] = [];
      const retailerMultiplier = getRetailerMultiplier(targetRetailer.name);

      for (const item of order.items) {
        const requestedQty = Math.max(1, Number(item.quantity || item.quantityPacks || 1));
        let variant: any = null;

        // Identify variant by ID, ingredientId, or name
        if (item.productVariantId || item.variantId) {
          const vId = item.productVariantId || item.variantId;
          if (this.store.isPrismaConnected) {
            variant = await this.store.prisma.productVariant.findUnique({
              where: { id: vId },
              include: { product: true }
            });
          }
          if (!variant) {
            variant = this.store.productVariants.find(v => v.id === vId);
          }
        }

        if (!variant && item.ingredientId) {
          if (this.store.isPrismaConnected) {
            variant = await this.store.prisma.productVariant.findFirst({
              where: { ingredientId: item.ingredientId, inStock: true },
              include: { product: true }
            });
          }
          if (!variant) {
            variant = this.store.productVariants.find(v => v.ingredientId === item.ingredientId && (v as any).inStock !== false);
          }
        }

        if (!variant && item.productName) {
          const lowerName = item.productName.toLowerCase();
          variant = this.store.productVariants.find(
            v => v.title.toLowerCase().includes(lowerName) || lowerName.includes(v.title.toLowerCase())
          );
        }

        // Strict fail-closed inventory availability check
        const avail = evaluateInventoryAvailability(variant, requestedQty);
        if (!avail.isAvailable) {
          unavailableItems.push({
            productVariantId: variant?.id,
            productName: variant?.title || item.productName || item.brand || 'Item',
            brand: variant?.brand || item.brand,
            status: avail.status,
            reason: avail.reason,
            historicalPriceInr: item.priceInr || item.unitPriceInr || 0
          });
          continue;
        }

        // Authoritative live price recalculation
        const currentLivePriceInr = Math.round(variant.sellingPriceInr * retailerMultiplier);
        const originalHistoricalPriceInr = Number(item.priceInr || item.unitPriceInr || 0);

        // Add to cart
        await this.addToCart(householdId, {
          productVariantId: variant.id,
          quantity: requestedQty,
          retailerId: targetRetailer.id
        });

        addedItems.push({
          productVariantId: variant.id,
          productName: variant.title,
          brand: variant.brand,
          packSize: variant.packQuantity ? `${variant.packQuantity} ${variant.packUnit}` : 'Standard',
          quantityPacks: requestedQty,
          originalHistoricalPriceInr,
          currentLivePriceInr,
          priceDifferenceInr: currentLivePriceInr - originalHistoricalPriceInr,
          priceChanged: originalHistoricalPriceInr > 0 && currentLivePriceInr !== originalHistoricalPriceInr,
          totalItemPriceInr: currentLivePriceInr * requestedQty
        });
      }

      // 6. Recalculate basket totals server-side
      const basket = await this.getBasket(householdId, targetRetailer.id);

      const result = {
        success: true,
        originalOrderId: order.id,
        targetRetailer: { id: targetRetailer.id, name: targetRetailer.name },
        addedCount: addedItems.length,
        unavailableCount: unavailableItems.length,
        addedItems,
        unavailableItems,
        basketSummary: {
          retailerName: (basket as any).retailer?.name || targetRetailer.name,
          itemsCount: basket.items.length,
          subtotalInr: basket.subtotalInr,
          deliveryFeeInr: basket.deliveryFeeInr,
          totalInr: basket.totalInr
        },
        summaryMessage: `Successfully loaded ${addedItems.length} items from Order #${order.id} into your basket at current live prices.${unavailableItems.length > 0 ? ` ${unavailableItems.length} items are currently unavailable.` : ''
          }`,
        priceIntegrityNotice: 'Authoritative live retailer prices recalculated. Historical prices were not reused.'
      };

      if (scopedIdempotencyKey) {
        if (this.reorderIdempotencyRecords.size > 1000) {
          const now = Date.now();
          for (const [k, v] of this.reorderIdempotencyRecords.entries()) {
            if (now - v.timestamp > 300000) {
              this.reorderIdempotencyRecords.delete(k);
            }
          }
        }
        this.reorderIdempotencyRecords.set(scopedIdempotencyKey, {
          response: result,
          fingerprint: requestFingerprint,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      this.householdReorderLocks.delete(householdId);
    }
  }

  // ---------------------------------------------------------------------------
  // Phase 6.2.1: Pantry Intelligence & Threshold Audit with Unit Normalization
  // ---------------------------------------------------------------------------
  async getPantryRestockSuggestions(householdId = 'hh-sharma-family') {
    let pantryItems: PantryItem[] = this.store.pantryItems.get(householdId) || [];
    if (this.store.isPrismaConnected) {
      try {
        const dbItems = await this.store.prisma.pantryItem.findMany({
          where: { householdId },
          include: { ingredient: true }
        });
        if (dbItems && dbItems.length > 0) {
          pantryItems = dbItems.map((di: any) => ({
            id: di.id,
            householdId: di.householdId,
            ingredientId: di.ingredientId,
            ingredient: di.ingredient,
            currentQuantity: di.currentQuantity,
            unit: di.unit as any,
            isLowStock: di.isLowStock,
            lowStockThreshold: di.lowStockThreshold,
            updatedAt: di.updatedAt.toISOString()
          }));
        }
      } catch (err: any) {
        this.logger.warn(`Failed to query db pantry items: ${err.message}`);
      }
    }

    const suggestions: any[] = [];
    const seenIngredients = new Set<string>();

    for (const item of pantryItems) {
      if (seenIngredients.has(item.ingredientId)) continue;

      const evalResult = evaluatePantryStockLevel(
        item.currentQuantity,
        item.unit,
        (item as any).lowStockThreshold,
        (item as any).thresholdUnit,
        item.isLowStock
      );

      if (evalResult.isLowStock) {
        seenIngredients.add(item.ingredientId);

        // Find matching variant
        let variant: any = null;
        if (this.store.isPrismaConnected) {
          variant = await this.store.prisma.productVariant.findFirst({
            where: { ingredientId: item.ingredientId, inStock: true },
            include: { product: true }
          });
        }
        if (!variant) {
          variant = this.store.productVariants.find(v => v.ingredientId === item.ingredientId && (v as any).inStock !== false);
        }

        const ingName = item.ingredient?.name || item.ingredientId.replace('ing-', '').replace(/-/g, ' ');

        // Check availability across retailers
        const retailerPrices: Record<string, { available: boolean; priceInr: number }> = {};
        for (const ret of this.store.retailers) {
          const factor = getRetailerMultiplier(ret.name);
          const price = variant ? Math.round(variant.sellingPriceInr * factor) : 0;
          retailerPrices[ret.id] = {
            available: !!variant && variant.inStock,
            priceInr: price
          };
        }

        suggestions.push({
          pantryItemId: item.id,
          ingredientId: item.ingredientId,
          ingredientName: ingName,
          currentQuantity: item.currentQuantity,
          unit: item.unit,
          threshold: (item as any).lowStockThreshold ?? null,
          reason: evalResult.reason,
          stockStatus: evalResult.stockStatus,
          hasMatchingVariant: !!variant,
          matchingVariant: variant ? {
            id: variant.id,
            title: variant.title,
            brand: variant.brand,
            packQuantity: variant.packQuantity,
            packUnit: variant.packUnit,
            mrpInr: variant.mrpInr,
            basePriceInr: variant.sellingPriceInr,
            inStock: variant.inStock
          } : null,
          retailerAvailability: retailerPrices
        });
      }
    }

    return {
      householdId,
      totalPantryItemsCount: pantryItems.length,
      lowStockItemsCount: suggestions.length,
      suggestions,
      methodology: 'Unit-normalized threshold comparison (strict incompatible dimension protection).'
    };
  }

  evaluatePantryStockLevel(
    currentQuantity: number | string | null | undefined,
    currentUnit: string,
    thresholdQuantity?: number | string | null,
    thresholdUnit?: string,
    piecesPerPack?: number | null,
    densityKgPerL?: number | null
  ) {
    return evaluatePantryStockLevel(
      currentQuantity,
      currentUnit,
      thresholdQuantity,
      thresholdUnit,
      false,
      { piecesPerPack, densityGPerMl: densityKgPerL }
    );
  }

  evaluateInventoryAvailability(
    item: { inStock?: boolean | null | string; stockCount?: number | null; status?: string } | null | undefined,
    requestedQuantity: number = 1
  ) {
    return evaluateInventoryAvailability(item, requestedQuantity);
  }
}

// ---------------------------------------------------------------------------
// Unit Normalization & Mathematical Comparison Helpers
// ---------------------------------------------------------------------------
export interface NormalizedUnitQuantity {
  dimension: 'WEIGHT' | 'VOLUME' | 'COUNT' | 'PACK' | 'UNKNOWN' | 'MALFORMED';
  value: number;
  baseUnit: string;
  isPackUnit?: boolean;
  error?: string;
}

export function normalizeUnitQuantity(
  quantity: number | string | null | undefined,
  unit: string,
  options?: { piecesPerPack?: number | null }
): NormalizedUnitQuantity {
  if (quantity === null || quantity === undefined || quantity === '') {
    return { dimension: 'MALFORMED', value: NaN, baseUnit: '', error: 'Quantity is missing or null' };
  }
  const numQty = Number(quantity);
  if (isNaN(numQty) || !isFinite(numQty)) {
    return { dimension: 'MALFORMED', value: NaN, baseUnit: '', error: `Quantity "${quantity}" is not a valid number` };
  }

  const u = (unit || '').toLowerCase().trim();

  // Weight conversions: kg <-> g
  if (['g', 'gram', 'grams', 'gm', 'gms'].includes(u)) {
    return { dimension: 'WEIGHT', value: numQty, baseUnit: 'g' };
  }
  if (['kg', 'kilogram', 'kilograms', 'kilo', 'kgs'].includes(u)) {
    return { dimension: 'WEIGHT', value: Math.round(numQty * 1000 * 10000) / 10000, baseUnit: 'g' };
  }

  // Volume conversions: L <-> ml
  if (['ml', 'milliliter', 'millilitre', 'mls'].includes(u)) {
    return { dimension: 'VOLUME', value: numQty, baseUnit: 'ml' };
  }
  if (['l', 'liter', 'litre', 'liters', 'litres', 'ltr'].includes(u)) {
    return { dimension: 'VOLUME', value: Math.round(numQty * 1000 * 10000) / 10000, baseUnit: 'ml' };
  }

  // Discrete count: piece, pieces, pc, pcs
  if (['pc', 'pcs', 'piece', 'pieces', 'unit', 'units'].includes(u)) {
    return { dimension: 'COUNT', value: numQty, baseUnit: 'pcs' };
  }

  // Discrete pack/packet - DO NOT assume 1 pack = 1 pc!
  if (['pack', 'packet', 'packs', 'packets'].includes(u)) {
    if (options?.piecesPerPack && options.piecesPerPack > 0) {
      return {
        dimension: 'COUNT',
        value: numQty * options.piecesPerPack,
        baseUnit: 'pcs',
        isPackUnit: true
      };
    }
    return { dimension: 'PACK', value: numQty, baseUnit: 'pack', isPackUnit: true };
  }

  // Unknown unit
  return { dimension: 'UNKNOWN', value: numQty, baseUnit: u };
}

export interface StockLevelEvaluationResult {
  isLowStock: boolean;
  reason: string;
  stockStatus:
  | 'ADEQUATE'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'INCOMPATIBLE_UNITS'
  | 'THRESHOLD_NOT_CONFIGURED'
  | 'MALFORMED_QUANTITY'
  | 'UNKNOWN_UNIT';
  normalizedCurrent?: { value: number; unit: string; dimension: string };
  normalizedThreshold?: { value: number; unit: string; dimension: string };
}

export function evaluatePantryStockLevel(
  currentQuantity: number | string | null | undefined,
  unit: string,
  threshold?: number | string | null,
  thresholdUnit?: string | null,
  explicitLowStockFlag?: boolean,
  options?: { piecesPerPack?: number | null; densityGPerMl?: number | null }
): StockLevelEvaluationResult {
  // 1. Missing or malformed quantity check
  if (currentQuantity === null || currentQuantity === undefined || currentQuantity === '') {
    return {
      isLowStock: false,
      reason: 'Pantry item quantity is missing or null',
      stockStatus: 'MALFORMED_QUANTITY'
    };
  }
  const numCurrent = Number(currentQuantity);
  if (isNaN(numCurrent) || !isFinite(numCurrent)) {
    return {
      isLowStock: false,
      reason: `Pantry item quantity "${currentQuantity}" is not a valid numeric quantity`,
      stockStatus: 'MALFORMED_QUANTITY'
    };
  }

  // 2. Zero or negative inventory check
  if (numCurrent < 0) {
    return {
      isLowStock: false,
      reason: `Negative pantry quantity "${numCurrent}" is physically invalid`,
      stockStatus: 'MALFORMED_QUANTITY'
    };
  }

  if (numCurrent === 0) {
    return {
      isLowStock: true,
      reason: 'Zero inventory remaining in pantry',
      stockStatus: 'OUT_OF_STOCK'
    };
  }

  // 3. Normalize current quantity
  const normCurrent = normalizeUnitQuantity(numCurrent, unit, options);
  if (normCurrent.dimension === 'MALFORMED') {
    return { isLowStock: false, reason: normCurrent.error || 'Malformed quantity', stockStatus: 'MALFORMED_QUANTITY' };
  }
  if (normCurrent.dimension === 'UNKNOWN') {
    return {
      isLowStock: false,
      reason: `Unknown or unparseable pantry unit "${unit}"`,
      stockStatus: 'UNKNOWN_UNIT'
    };
  }

  // 4. Explicit low-stock flag set by household member
  if (explicitLowStockFlag === true) {
    return {
      isLowStock: true,
      reason: 'Explicitly flagged as low stock by household member',
      stockStatus: 'LOW_STOCK',
      normalizedCurrent: { value: normCurrent.value, unit: normCurrent.baseUnit, dimension: normCurrent.dimension }
    };
  }

  // 5. Check if threshold is configured - DO NOT invent a baseline!
  if (threshold === undefined || threshold === null || threshold === '' || isNaN(Number(threshold))) {
    return {
      isLowStock: false,
      reason: 'No low-stock threshold configured for this pantry item',
      stockStatus: 'THRESHOLD_NOT_CONFIGURED',
      normalizedCurrent: { value: normCurrent.value, unit: normCurrent.baseUnit, dimension: normCurrent.dimension }
    };
  }

  const numThreshold = Number(threshold);
  if (numThreshold <= 0) {
    return {
      isLowStock: false,
      reason: 'Threshold is zero or negative; automatic low-stock alerting disabled',
      stockStatus: 'THRESHOLD_NOT_CONFIGURED'
    };
  }

  const tUnit = thresholdUnit || unit;
  const normThreshold = normalizeUnitQuantity(numThreshold, tUnit, options);
  if (normThreshold.dimension === 'MALFORMED') {
    return { isLowStock: false, reason: 'Threshold value is malformed', stockStatus: 'MALFORMED_QUANTITY' };
  }
  if (normThreshold.dimension === 'UNKNOWN') {
    return { isLowStock: false, reason: `Unknown threshold unit "${tUnit}"`, stockStatus: 'UNKNOWN_UNIT' };
  }

  // 6. Pack-to-piece conversion check: Do NOT assume 1 pack = 1 pc!
  if (
    (normCurrent.dimension === 'PACK' && normThreshold.dimension === 'COUNT') ||
    (normCurrent.dimension === 'COUNT' && normThreshold.dimension === 'PACK')
  ) {
    if (!options?.piecesPerPack) {
      return {
        isLowStock: false,
        reason: 'Cannot convert pack to pieces without an explicit, reliable piecesPerPack definition',
        stockStatus: 'INCOMPATIBLE_UNITS'
      };
    }
  }

  // 7. Strictly prevent volume-to-weight comparison without explicit density conversion
  if (
    (normCurrent.dimension === 'VOLUME' && normThreshold.dimension === 'WEIGHT') ||
    (normCurrent.dimension === 'WEIGHT' && normThreshold.dimension === 'VOLUME')
  ) {
    if (!options?.densityGPerMl) {
      return {
        isLowStock: false,
        reason: `Cannot convert volume (${unit}) into weight (${tUnit}) without a product-specific density conversion factor`,
        stockStatus: 'INCOMPATIBLE_UNITS'
      };
    }
  }

  // 8. General dimension compatibility check
  if (normCurrent.dimension !== normThreshold.dimension) {
    return {
      isLowStock: false,
      reason: `Cannot compare incompatible dimensions: current "${unit}" (${normCurrent.dimension}) vs threshold "${tUnit}" (${normThreshold.dimension})`,
      stockStatus: 'INCOMPATIBLE_UNITS'
    };
  }

  // 9. Precision comparison in identical base units (4 decimal places rounding)
  const currentVal = Math.round(normCurrent.value * 10000) / 10000;
  const threshVal = Math.round(normThreshold.value * 10000) / 10000;

  if (currentVal <= threshVal) {
    return {
      isLowStock: true,
      reason: `Current stock (${numCurrent} ${unit} = ${currentVal} ${normCurrent.baseUnit}) is at or below threshold (${numThreshold} ${tUnit} = ${threshVal} ${normThreshold.baseUnit})`,
      stockStatus: 'LOW_STOCK',
      normalizedCurrent: { value: currentVal, unit: normCurrent.baseUnit, dimension: normCurrent.dimension },
      normalizedThreshold: { value: threshVal, unit: normThreshold.baseUnit, dimension: normThreshold.dimension }
    };
  } else {
    return {
      isLowStock: false,
      reason: `Current stock (${numCurrent} ${unit} = ${currentVal} ${normCurrent.baseUnit}) is above threshold (${numThreshold} ${tUnit} = ${threshVal} ${normThreshold.baseUnit})`,
      stockStatus: 'ADEQUATE',
      normalizedCurrent: { value: currentVal, unit: normCurrent.baseUnit, dimension: normCurrent.dimension },
      normalizedThreshold: { value: threshVal, unit: normThreshold.baseUnit, dimension: normThreshold.dimension }
    };
  }
}

// ---------------------------------------------------------------------------
// Phase 6.2.2: Central Inventory Availability Evaluator (Fail-Closed)
// ---------------------------------------------------------------------------
export type InventoryAvailabilityStatus =
  | 'AVAILABLE'
  | 'OUT_OF_STOCK'
  | 'UNKNOWN_AVAILABILITY'
  | 'DISCONTINUED'
  | 'EXTERNAL_RETAILER_STOCK_UNVERIFIED';

export function evaluateInventoryAvailability(
  item: { inStock?: boolean | null | string; stockCount?: number | null; status?: string } | null | undefined,
  requestedQuantity: number = 1
): {
  isAvailable: boolean;
  status: InventoryAvailabilityStatus;
  reason: string;
  catalogSource: string;
  retailerConfirmation: string;
} {
  if (!item) {
    return {
      isAvailable: false,
      status: 'UNKNOWN_AVAILABILITY',
      reason: 'Catalog item or inventory record does not exist',
      catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
      retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
    };
  }

  // 1. Explicit discontinued status
  if (item.status === 'DISCONTINUED') {
    return {
      isAvailable: false,
      status: 'DISCONTINUED',
      reason: 'Product has been permanently discontinued from the merchant catalog',
      catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
      retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
    };
  }

  // 2. Explicit out-of-stock boolean
  if (item.inStock === false || item.inStock === 'false') {
    return {
      isAvailable: false,
      status: 'OUT_OF_STOCK',
      reason: 'Product is explicitly marked out of stock at fulfillment hub',
      catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
      retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
    };
  }

  // 3. FAIL-CLOSED: Missing, null, or unknown inStock value is NOT assumed in-stock!
  if (item.inStock !== true && item.inStock !== 'true') {
    return {
      isAvailable: false,
      status: 'UNKNOWN_AVAILABILITY',
      reason: `Inventory availability status is unverified (value: ${item.inStock ?? 'null/undefined'}). Fail-closed protection active.`,
      catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
      retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
    };
  }

  // 4. Stock count evaluation if maintained
  if (typeof item.stockCount === 'number') {
    if (item.stockCount <= 0) {
      return {
        isAvailable: false,
        status: 'OUT_OF_STOCK',
        reason: 'Zero units remaining in fulfillment dark store',
        catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
        retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
      };
    }
    if (requestedQuantity > item.stockCount) {
      return {
        isAvailable: false,
        status: 'OUT_OF_STOCK',
        reason: `Requested ${requestedQuantity} units exceeds available stock of ${item.stockCount} units`,
        catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
        retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
      };
    }
  }

  // 5. Fully verified available in internal catalog
  return {
    isAvailable: true,
    status: 'AVAILABLE',
    reason: 'Verified in stock in RasoiIQ internal catalog. External live retailer dark-store inventory is unverified (sample catalog demonstration).',
    catalogSource: 'RASOIIQ_INTERNAL_CATALOG',
    retailerConfirmation: 'EXTERNAL_RETAILER_STOCK_UNVERIFIED'
  };
}
