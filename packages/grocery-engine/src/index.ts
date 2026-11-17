import {
  MealPlanItem,
  PantryItem,
  ScaledIngredientRequirement,
  StandardUnit,
  ProductVariant,
  BasketItem,
  Retailer,
  RetailerBasketComparison
} from '@rasoi/shared-types';

/**
 * Standard conversion factors to canonical base units (grams for weight, ml for volume, piece for count)
 */
export const UNIT_CONVERSIONS: Record<string, { baseUnit: 'g' | 'ml' | 'piece'; factor: number }> = {
  g: { baseUnit: 'g', factor: 1 },
  kg: { baseUnit: 'g', factor: 1000 },
  cup: { baseUnit: 'ml', factor: 240 }, // approximate culinary cup
  tbsp: { baseUnit: 'ml', factor: 15 },
  tsp: { baseUnit: 'ml', factor: 5 },
  pinch: { baseUnit: 'g', factor: 1 },
  ml: { baseUnit: 'ml', factor: 1 },
  l: { baseUnit: 'ml', factor: 1000 },
  piece: { baseUnit: 'piece', factor: 1 },
  bunch: { baseUnit: 'piece', factor: 1 }
};

/**
 * Normalizes any quantity into its canonical base unit (g, ml, or piece)
 */
export function normalizeQuantity(quantity: number, unit: StandardUnit): { baseQuantity: number; baseUnit: 'g' | 'ml' | 'piece' } {
  const norm = UNIT_CONVERSIONS[unit.toLowerCase()] || { baseUnit: 'piece', factor: 1 };
  return {
    baseQuantity: quantity * norm.factor,
    baseUnit: norm.baseUnit
  };
}

/**
 * Converts a base quantity back into user-friendly display unit (e.g. 1500g -> 1.5 kg, 2000ml -> 2 L)
 */
export function formatFriendlyQuantity(baseQuantity: number, baseUnit: 'g' | 'ml' | 'piece'): { quantity: number; unit: StandardUnit } {
  if (baseUnit === 'g') {
    if (baseQuantity >= 1000) {
      return { quantity: Number((baseQuantity / 1000).toFixed(2)), unit: 'kg' };
    }
    return { quantity: Math.round(baseQuantity), unit: 'g' };
  }
  if (baseUnit === 'ml') {
    if (baseQuantity >= 1000) {
      return { quantity: Number((baseQuantity / 1000).toFixed(2)), unit: 'l' };
    }
    return { quantity: Math.round(baseQuantity), unit: 'ml' };
  }
  return { quantity: Math.round(baseQuantity), unit: 'piece' };
}

/**
 * Step 1 & 2: Calculate Scaled Ingredients and Aggregate Duplicates across the 7-day Meal Plan
 */
export function calculateMealPlanRequirements(
  mealPlanItems: MealPlanItem[],
  pantryItems: PantryItem[] = []
): ScaledIngredientRequirement[] {
  const aggregationMap = new Map<string, {
    ingredientId: string;
    ingredientName: string;
    hindiName?: string;
    category: string;
    baseUnit: 'g' | 'ml' | 'piece';
    totalBaseQuantity: number;
    recipeSources: ScaledIngredientRequirement['recipeSources'];
  }>();

  // Index pantry items by ingredientId for O(1) lookup
  const pantryMap = new Map<string, number>();
  for (const pantry of pantryItems) {
    const { baseQuantity } = normalizeQuantity(pantry.currentQuantity, pantry.unit);
    const existing = pantryMap.get(pantry.ingredientId) || 0;
    pantryMap.set(pantry.ingredientId, existing + baseQuantity);
  }

  // Iterate over every planned meal
  for (const planItem of mealPlanItems) {
    if (!planItem.recipe || !planItem.recipe.ingredients) continue;

    const scaleFactor = planItem.servings / (planItem.recipe.defaultServings || 4);

    for (const recipeIng of planItem.recipe.ingredients) {
      const ingId = recipeIng.ingredient?.id || recipeIng.ingredientId;
      if (!ingId) continue;

      const ingName = recipeIng.ingredient?.name || ingId.replace('ing-', '').replace(/-/g, ' ');
      const ingHindiName = recipeIng.ingredient?.hindiName;
      const ingCategory = recipeIng.ingredient?.category || 'Pantry Staples';

      const scaledQuantity = recipeIng.quantity * scaleFactor;
      const { baseQuantity, baseUnit } = normalizeQuantity(scaledQuantity, recipeIng.unit);

      const existing = aggregationMap.get(ingId);
      if (!existing) {
        aggregationMap.set(ingId, {
          ingredientId: ingId,
          ingredientName: ingName,
          hindiName: ingHindiName,
          category: ingCategory,
          baseUnit,
          totalBaseQuantity: baseQuantity,
          recipeSources: [
            {
              recipeId: planItem.recipeId,
              recipeTitle: planItem.recipe.title,
              day: planItem.dayOfWeek,
              meal: planItem.mealCategory,
              quantity: Number(scaledQuantity.toFixed(2)),
              unit: recipeIng.unit
            }
          ]
        });
      } else {
        existing.totalBaseQuantity += baseQuantity;
        existing.recipeSources.push({
          recipeId: planItem.recipeId,
          recipeTitle: planItem.recipe.title,
          day: planItem.dayOfWeek,
          meal: planItem.mealCategory,
          quantity: Number(scaledQuantity.toFixed(2)),
          unit: recipeIng.unit
        });
      }
    }
  }

  // Deduct pantry stock and convert to user-friendly units
  const results: ScaledIngredientRequirement[] = [];

  for (const item of aggregationMap.values()) {
    const pantryBaseQty = pantryMap.get(item.ingredientId) || 0;
    const netBaseQty = Math.max(0, item.totalBaseQuantity - pantryBaseQty);

    const friendlyTotal = formatFriendlyQuantity(item.totalBaseQuantity, item.baseUnit);
    const friendlyPantry = formatFriendlyQuantity(pantryBaseQty, item.baseUnit);
    const friendlyNet = formatFriendlyQuantity(netBaseQty, item.baseUnit);

    results.push({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredientName,
      hindiName: item.hindiName,
      category: item.category,
      standardUnit: friendlyTotal.unit,
      totalRequiredQuantity: friendlyTotal.quantity,
      availableInPantryQuantity: friendlyPantry.quantity,
      netShoppingQuantity: friendlyNet.quantity,
      recipeSources: item.recipeSources
    });
  }

  // Sort by category, then by ingredient name
  return results.sort((a, b) => {
    if (a.category === b.category) {
      return a.ingredientName.localeCompare(b.ingredientName);
    }
    return a.category.localeCompare(b.category);
  });
}

/**
 * Pack size calculator: Matches net ingredient requirement to optimal retail pack size.
 * e.g., Net 350g paneer -> 2 packs of 200g = 400g.
 */
export function calculatePacksNeeded(
  netShoppingQuantity: number,
  shoppingUnit: StandardUnit,
  variant: ProductVariant
): number {
  if (netShoppingQuantity <= 0) return 0;

  const { baseQuantity: reqBase } = normalizeQuantity(netShoppingQuantity, shoppingUnit);
  const { baseQuantity: packBase } = normalizeQuantity(variant.packQuantity, variant.packUnit);

  if (packBase <= 0) return 1;

  // Ceiling division to ensure recipes have enough quantity
  return Math.max(1, Math.ceil(reqBase / packBase));
}

/**
 * Authoritative retailer price multiplier model for market simulation.
 * DMart: ~8% discount bulk wholesale.
 * BigBasket: ~4% competitive supermarket discount.
 * Blinkit & Zepto: 2% quick-commerce convenience premium.
 */
export function getRetailerMultiplier(retailerName: string): number {
  if (retailerName.includes('DMart')) return 0.92;
  if (retailerName.includes('BigBasket')) return 0.96;
  if (retailerName.includes('Zepto') || retailerName.includes('Blinkit')) return 1.02;
  return 1.0;
}

/**
 * Builds the interactive grocery basket while honoring the strict rule:
 * Recipe requirements are decoupled from basket purchases!
 * Single source of truth for both comparison cards and order summary.
 */
export function buildGroceryBasket(
  requirements: ScaledIngredientRequirement[],
  availableVariants: ProductVariant[],
  retailers: Retailer[],
  selectedRetailerId: string,
  existingBasketItems: BasketItem[] = []
): {
  items: BasketItem[];
  subtotalInr: number;
  deliveryFeeInr: number;
  totalInr: number;
  mrpTotalInr: number;
  discountInr: number;
  comparisons: RetailerBasketComparison[];
} {
  const existingMap = new Map<string, BasketItem>();
  for (const item of existingBasketItems) {
    existingMap.set(item.ingredientId, item);
  }

  // Group variants by ingredientId
  const variantsByIngredient = new Map<string, ProductVariant[]>();
  for (const v of availableVariants) {
    const list = variantsByIngredient.get(v.ingredientId) || [];
    list.push(v);
    variantsByIngredient.set(v.ingredientId, list);
  }

  const selectedRetailer = retailers.find(r => r.id === selectedRetailerId) || retailers[0];
  const selectedMultiplier = selectedRetailer ? getRetailerMultiplier(selectedRetailer.name) : 1.0;

  const items: BasketItem[] = [];

  for (const req of requirements) {
    if (req.netShoppingQuantity <= 0) continue;

    const existing = existingMap.get(req.ingredientId);
    const candidateVariants = variantsByIngredient.get(req.ingredientId) || [];
    
    // Choose selected variant or first available variant
    const variant = existing
      ? candidateVariants.find(v => v.id === existing.productVariantId) || candidateVariants[0]
      : candidateVariants[0];

    if (!variant) continue;

    // Recalculate pack count if variant was swapped or if this is fresh
    const packs = (existing && existing.productVariantId === variant.id)
      ? existing.quantityPacks
      : calculatePacksNeeded(req.netShoppingQuantity, req.standardUnit, variant);
    const effectivePricePerPackInr = Math.round(variant.sellingPriceInr * selectedMultiplier);
    const totalPriceInr = packs * effectivePricePerPackInr;
    const isSelected = existing ? existing.isSelectedForPurchase : true;
    const associatedRecipeIds = Array.from(new Set(req.recipeSources.map(s => s.recipeId)));
    const associatedRecipeNames = Array.from(new Set(req.recipeSources.map(s => s.recipeTitle).filter(Boolean)));

    items.push({
      id: existing?.id || `basket-item-${req.ingredientId}`,
      ingredientId: req.ingredientId,
      productVariantId: variant.id,
      productVariant: variant,
      quantityPacks: packs,
      totalQuantity: packs * variant.packQuantity,
      totalPriceInr,
      isSelectedForPurchase: isSelected,
      availableAtHome: req.availableInPantryQuantity > 0,
      associatedRecipeIds,
      associatedRecipeNames,
      effectivePricePerPackInr
    });
  }

  const selectedItems = items.filter(i => i.isSelectedForPurchase);
  const isCartEmpty = selectedItems.length === 0;

  // Base catalog subtotal (before retailer multipliers) and MRP total
  const baseCatalogSubtotal = selectedItems.reduce(
    (sum, i) => sum + (i.quantityPacks * i.productVariant.sellingPriceInr),
    0
  );
  const mrpTotalInr = selectedItems.reduce(
    (sum, i) => sum + (i.quantityPacks * (i.productVariant.mrpInr || i.productVariant.sellingPriceInr)),
    0
  );

  // Multi-retailer price comparison calculation
  const comparisons: RetailerBasketComparison[] = retailers.map((retailer) => {
    const factor = getRetailerMultiplier(retailer.name);
    // Every retailer's subtotal is computed using consistent item-by-item rounded pricing
    // so comparisons remain 100% stable regardless of which retailer is currently selected.
    const retailerSubtotal = isCartEmpty
      ? 0
      : selectedItems.reduce((sum, i) => {
          const itemPrice = Math.round(i.productVariant.sellingPriceInr * factor);
          return sum + (i.quantityPacks * itemPrice);
        }, 0);

    const retailerDelivery = (isCartEmpty || retailerSubtotal >= retailer.freeDeliveryThresholdInr)
      ? 0
      : retailer.deliveryFeeInr;

    const estTotal = retailerSubtotal + retailerDelivery;

    let priceComparisonNote = '';
    if (retailer.name.includes('DMart')) {
      priceComparisonNote = 'Everyday low wholesale prices • Best value for weekly staples';
    } else if (retailer.name.includes('Zepto')) {
      priceComparisonNote = 'Ultra-fast 10-min delivery • Premium convenience pricing';
    } else if (retailer.name.includes('Blinkit')) {
      priceComparisonNote = 'Fast 10-15 min delivery • Reliable dark store stock';
    } else if (retailer.name.includes('BigBasket')) {
      priceComparisonNote = 'Fresh produce & dry staples • Scheduled 2-4 hr delivery';
    }

    return {
      retailer,
      totalItems: selectedItems.length,
      itemsAvailableCount: selectedItems.length,
      subtotalInr: retailerSubtotal,
      deliveryFeeInr: retailerDelivery,
      estimatedTotalInr: estTotal,
      isLowestPrice: false,
      estimatedSavingsInr: 0,
      priceComparisonNote
    };
  });

  const nonZeroTotals = comparisons.map(c => c.estimatedTotalInr).filter(t => t > 0);
  const lowestTotal = nonZeroTotals.length > 0 ? Math.min(...nonZeroTotals) : 0;
  const highestTotal = nonZeroTotals.length > 0 ? Math.max(...nonZeroTotals) : 0;

  for (const comp of comparisons) {
    if (comp.estimatedTotalInr === lowestTotal && comp.estimatedTotalInr > 0) {
      comp.isLowestPrice = true;
    }
    // Estimated savings against highest quick-commerce / convenience baseline
    comp.estimatedSavingsInr = Math.max(0, highestTotal - comp.estimatedTotalInr);
  }

  // Single authoritative source: the selected retailer's figures define the basket
  const selectedComp = comparisons.find(c => c.retailer.id === selectedRetailer?.id) || comparisons[0];
  const subtotalInr = selectedComp ? selectedComp.subtotalInr : 0;
  const deliveryFeeInr = selectedComp ? selectedComp.deliveryFeeInr : 0;
  const totalInr = selectedComp ? selectedComp.estimatedTotalInr : 0;
  const discountInr = Math.max(0, mrpTotalInr - subtotalInr);

  return {
    items,
    subtotalInr,
    deliveryFeeInr,
    totalInr,
    mrpTotalInr,
    discountInr,
    comparisons
  };
}

// Nutrition Intelligence Engine Re-exports
export * from './nutrition-data';
export * from './nutrition';
export * from './dietary-filters';

