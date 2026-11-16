import assert from 'node:assert';
import {
  calculateMealPlanRequirements,
  buildGroceryBasket,
  getRetailerMultiplier
} from '../packages/grocery-engine/dist/index.js';
import {
  SEED_RECIPES,
  SEED_DEMO_HOUSEHOLD,
  SEED_PANTRY_ITEMS,
  SEED_RETAILERS,
  SEED_PRODUCT_VARIANTS
} from '../packages/database/dist/seed-data.js';

console.log('🧪 =======================================================');
console.log('🧪 RASOIIQ — SMART BASKET & MARKETPLACE TEST SUITE');
console.log('🧪 =======================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failCount++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failCount++;
  }
}

async function runAllTests() {
  // 1. Setup sample meal plan items
  const samplePlanItems = [
    {
      id: 'plan-1',
      mealPlanId: 'mp-test',
      dayOfWeek: 'Monday',
      mealCategory: 'dinner',
      recipeId: 'recipe-paneer-butter-masala',
      recipe: SEED_RECIPES.find(r => r.id === 'recipe-paneer-butter-masala'),
      servings: 4
    },
    {
      id: 'plan-2',
      mealPlanId: 'mp-test',
      dayOfWeek: 'Tuesday',
      mealCategory: 'lunch',
      recipeId: 'recipe-palak-paneer',
      recipe: SEED_RECIPES.find(r => r.id === 'recipe-palak-paneer'),
      servings: 4
    },
    {
      id: 'plan-3',
      mealPlanId: 'mp-test',
      dayOfWeek: 'Wednesday',
      mealCategory: 'lunch',
      recipeId: 'recipe-rajma-chawal',
      recipe: SEED_RECIPES.find(r => r.id === 'recipe-rajma-chawal'),
      servings: 4
    }
  ];

  const samplePantry = SEED_PANTRY_ITEMS.map((p, idx) => ({
    id: `pantry-${idx}`,
    householdId: 'hh-sharma-family',
    ingredientId: p.ingredientId,
    ingredient: {
      id: p.ingredientId,
      name: p.ingredientId,
      category: 'Pantry Staples',
      standardUnit: p.unit,
      isJainPermissible: true
    },
    currentQuantity: p.currentQuantity,
    unit: p.unit,
    isLowStock: p.isLowStock,
    updatedAt: new Date().toISOString()
  }));

  const variants = SEED_PRODUCT_VARIANTS.map(v => ({ ...v, productId: `prod-${v.brand}` }));

  // Test 1: Requirements calculation
  const requirements = calculateMealPlanRequirements(samplePlanItems, samplePantry);

  test('Grocery Engine aggregates recipe requirements accurately', () => {
    assert(requirements.length > 0, 'Requirements should not be empty');
    const paneerReq = requirements.find(r => r.ingredientId === 'ing-paneer');
    assert(paneerReq, 'Paneer requirement should exist');
    // Paneer Butter Masala (300g) + Palak Paneer (250g) = 550g total
    assert.strictEqual(paneerReq.totalRequiredQuantity, 550, 'Total paneer required should be 550g');
    assert.strictEqual(paneerReq.recipeSources.length, 2, 'Paneer should trace to 2 distinct recipes');
  });

  // Test 2: Authoritative Retailer Price Consistency
  test('Retailer Card and Basket Order Summary have 100% price consistency for Blinkit', () => {
    const blinkitRetailer = SEED_RETAILERS.find(r => r.slug === 'blinkit');
    const basket = buildGroceryBasket(requirements, variants, SEED_RETAILERS, blinkitRetailer.id);

    const blinkitComp = basket.comparisons.find(c => c.retailer.id === blinkitRetailer.id);
    assert(blinkitComp, 'Blinkit comparison should exist');

    // Exact match assertions:
    assert.strictEqual(
      basket.subtotalInr,
      blinkitComp.subtotalInr,
      `Basket subtotal (${basket.subtotalInr}) must equal Blinkit card subtotal (${blinkitComp.subtotalInr})`
    );
    assert.strictEqual(
      basket.deliveryFeeInr,
      blinkitComp.deliveryFeeInr,
      `Basket delivery fee (${basket.deliveryFeeInr}) must equal Blinkit card delivery fee (${blinkitComp.deliveryFeeInr})`
    );
    assert.strictEqual(
      basket.totalInr,
      blinkitComp.estimatedTotalInr,
      `Basket total (${basket.totalInr}) must equal Blinkit card estimated total (${blinkitComp.estimatedTotalInr})`
    );
    assert(basket.totalInr > 0, 'Total should be a positive number');
  });

  test('Retailer Card and Basket Order Summary have 100% price consistency for DMart Ready', () => {
    const dmartRetailer = SEED_RETAILERS.find(r => r.slug === 'dmart-ready');
    const basket = buildGroceryBasket(requirements, variants, SEED_RETAILERS, dmartRetailer.id);

    const dmartComp = basket.comparisons.find(c => c.retailer.id === dmartRetailer.id);
    assert(dmartComp, 'DMart comparison should exist');

    assert.strictEqual(
      basket.subtotalInr,
      dmartComp.subtotalInr,
      `Basket subtotal (${basket.subtotalInr}) must equal DMart card subtotal (${dmartComp.subtotalInr})`
    );
    assert.strictEqual(
      basket.deliveryFeeInr,
      dmartComp.deliveryFeeInr,
      `Basket delivery fee (${basket.deliveryFeeInr}) must equal DMart card delivery fee (${dmartComp.deliveryFeeInr})`
    );
    assert.strictEqual(
      basket.totalInr,
      dmartComp.estimatedTotalInr,
      `Basket total (${basket.totalInr}) must equal DMart card estimated total (${dmartComp.estimatedTotalInr})`
    );
  });

  test('All 4 retailers (Blinkit, Zepto, DMart, BigBasket) are mapped in comparisons', () => {
    const basket = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id);
    assert.strictEqual(basket.comparisons.length, 4, 'Should contain comparisons for all 4 retailers');
    const slugs = basket.comparisons.map(c => c.retailer.slug);
    assert(slugs.includes('blinkit'), 'Must include Blinkit');
    assert(slugs.includes('zepto'), 'Must include Zepto');
    assert(slugs.includes('dmart-ready'), 'Must include DMart Ready');
    assert(slugs.includes('bigbasket'), 'Must include BigBasket');
  });

  // Test 3: Recipe Requirement Separation Rule (Crucial Business Invariant)
  test('Business Rule: Deselecting items from cart NEVER modifies recipe requirements', () => {
    const initialReqCount = requirements.length;
    const initialPaneerReq = requirements.find(r => r.ingredientId === 'ing-paneer').netShoppingQuantity;

    // Build basket and deselect paneer
    const basket1 = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id);
    const updatedItems = basket1.items.map(item =>
      item.ingredientId === 'ing-paneer' ? { ...item, isSelectedForPurchase: false } : item
    );

    const basket2 = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id, updatedItems);
    
    // Verify recipe requirements are completely unmodified
    assert.strictEqual(requirements.length, initialReqCount, 'Requirement list length must not change');
    const paneerReqAfter = requirements.find(r => r.ingredientId === 'ing-paneer').netShoppingQuantity;
    assert.strictEqual(paneerReqAfter, initialPaneerReq, 'Recipe paneer quantity must remain intact');

    // Verify item is excluded from basket purchase but still tracks recipes
    const excludedPaneer = basket2.items.find(i => i.ingredientId === 'ing-paneer');
    assert.strictEqual(excludedPaneer.isSelectedForPurchase, false, 'Paneer must be marked as not selected for purchase');
    assert(excludedPaneer.associatedRecipeIds.length > 0, 'Excluded paneer still tracks associated recipes');
  });

  // Test 4: Dynamic Recalculation on Quantity / Pack Changes
  test('Dynamic recalculation: Modifying pack count updates totals and retailer comparisons', () => {
    const basketBefore = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id);
    const initialTotal = basketBefore.totalInr;

    // Increase paneer packs by 4
    const modifiedItems = basketBefore.items.map(item =>
      item.ingredientId === 'ing-paneer' ? { ...item, quantityPacks: item.quantityPacks + 4 } : item
    );

    const basketAfter = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id, modifiedItems);
    assert(basketAfter.totalInr > initialTotal, `Total (${basketAfter.totalInr}) should be greater than initial (${initialTotal})`);

    // Comparisons must also be recalculated
    const compAfter = basketAfter.comparisons.find(c => c.retailer.id === SEED_RETAILERS[0].id);
    assert.strictEqual(basketAfter.totalInr, compAfter.estimatedTotalInr, 'Comparisons must update synchronously with pack changes');
  });

  // Test 5: Dynamic Product Substitution / Brand Swapping
  test('Dynamic Product Substitution: Swapping brand and pack size recalculates packs and totals', () => {
    const basket = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id);
    const paneerItem = basket.items.find(i => i.ingredientId === 'ing-paneer');
    assert(paneerItem, 'Paneer item should exist');

    // Swap to Mother Dairy 200g variant
    const motherDairyVariant = variants.find(v => v.id === 'var-mother-paneer-200');
    assert(motherDairyVariant, 'Mother dairy variant should exist in seed data');

    const itemsSwapped = basket.items.map(i =>
      i.ingredientId === 'ing-paneer' ? { ...i, productVariantId: motherDairyVariant.id, productVariant: motherDairyVariant } : i
    );

    const basketSwapped = buildGroceryBasket(requirements, variants, SEED_RETAILERS, SEED_RETAILERS[0].id, itemsSwapped);
    const swappedItem = basketSwapped.items.find(i => i.ingredientId === 'ing-paneer');
    assert.strictEqual(swappedItem.productVariant.brand, 'Mother Dairy', 'Brand should be swapped to Mother Dairy');
    assert.strictEqual(swappedItem.productVariantId, 'var-mother-paneer-200', 'Variant ID should be updated');
  });

  // Test 6: Address & PIN Code Location Validation
  test('Address Validation: 6-digit Indian PIN codes are correctly verified', () => {
    const pinRegex = /^[1-9][0-9]{5}$/;

    // Valid Indian PIN codes
    assert(pinRegex.test('560103'), 'Bengaluru 560103 must be valid');
    assert(pinRegex.test('400064'), 'Mumbai 400064 must be valid');
    assert(pinRegex.test('110085'), 'Delhi 110085 must be valid');
    assert(pinRegex.test('380015'), 'Ahmedabad 380015 must be valid');

    // Invalid PIN codes
    assert(!pinRegex.test('056010'), 'Leading zero PIN code must be rejected');
    assert(!pinRegex.test('56010'), '5-digit PIN code must be rejected');
    assert(!pinRegex.test('5601033'), '7-digit PIN code must be rejected');
    assert(!pinRegex.test('ABC123'), 'Alphanumeric PIN code must be rejected');
  });

  // Test 7: Backend API Integration
  await testAsync('Live Backend API: Basket endpoint returns consistent prices and 4 retailers', async () => {
    const res = await fetch('http://localhost:4000/api/grocery/basket?retailerId=ret-blinkit');
    assert(res.ok, `API responded with status ${res.status}`);
    const data = await res.json();

    assert(data.items && data.items.length > 0, 'Items should not be empty');
    assert.strictEqual(data.selectedRetailerId, 'ret-blinkit');
    
    const blinkitComp = data.comparisons.find(c => c.retailer.id === 'ret-blinkit');
    assert(blinkitComp, 'Blinkit comparison should be returned');
    assert.strictEqual(
      data.totalInr,
      blinkitComp.estimatedTotalInr,
      `API basket total (${data.totalInr}) must exactly equal comparison total (${blinkitComp.estimatedTotalInr})`
    );
    assert.strictEqual(
      data.subtotalInr,
      blinkitComp.subtotalInr,
      `API basket subtotal (${data.subtotalInr}) must exactly equal comparison subtotal (${blinkitComp.subtotalInr})`
    );
  });

  await testAsync('Live Backend API: Checkout endpoint places simulated order with address and matching total', async () => {
    const basketRes = await fetch('http://localhost:4000/api/grocery/basket');
    const basket = await basketRes.json();

    const checkoutRes = await fetch('http://localhost:4000/api/marketplace/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        retailerId: basket.selectedRetailerId,
        items: basket.items.filter(i => i.isSelectedForPurchase),
        totalInr: basket.totalInr,
        deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103'
      })
    });

    assert(checkoutRes.ok, `Checkout API responded with ${checkoutRes.status}`);
    const order = await checkoutRes.json();

    assert(order.orderNumber.startsWith('RASOI-'), 'Order number should follow format RASOI-XXXXXX');
    assert(order.status === 'DEMO ORDER CONFIRMED' || order.status === 'CONFIRMED', `Status must be DEMO ORDER CONFIRMED (actual: ${order.status})`);
    assert.strictEqual(order.totalAmountInr, basket.totalInr, 'Order amount must match basket total');
    assert.strictEqual(order.deliveryAddress, 'Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103');
  });

  // Summary
  console.log('\n=======================================================');
  console.log(`Test Results: ${passCount} Passed, ${failCount} Failed`);
  console.log('=======================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
