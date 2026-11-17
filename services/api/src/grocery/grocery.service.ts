import { Injectable, Logger } from '@nestjs/common';
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
  Retailer
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

  constructor(private readonly store: StoreService) {}

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
      throw new Error(`Product variant "${body.productVariantId}" not found.`);
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
    const validRetailer = this.store.retailers.find(r => r.id === newRetailerId);
    if (!validRetailer) {
      throw new Error(`Invalid retailer "${newRetailerId}".`);
    }
    this.selectedRetailers.set(householdId, newRetailerId);
    const basket = await this.getBasket(householdId, newRetailerId);
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
    this.activeBasketItems.set(householdId, []);
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
}
