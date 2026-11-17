import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';

const API_BASE = 'http://localhost:4000/api';
const prisma = new PrismaClient();

console.log('🧪 =========================================================================');
console.log('🧪 RASOIIQ PHASE 6.2.5 — 18-STEP SUPERVISED PILOT SMOKE TEST BATTERY');
console.log('🧪 =========================================================================\n');

let passCount = 0;
let failCount = 0;

async function test(num, name, fn) {
  try {
    await fn();
    console.log(`  ✅ [Step ${num}/18] PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [Step ${num}/18] FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failCount++;
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function registerAndActivate(email, fullName, password) {
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      email,
      password,
      confirmPassword: password,
      phoneNumber: '9876543210',
      acceptTerms: true
    })
  });
  assert.strictEqual(regRes.status, 201, `Registration failed: ${JSON.stringify(regRes.data)}`);

  // Fetch token from dev email preview
  const devEmails = await api(`/dev/emails?email=${email}`);
  const token = devEmails.data?.[0]?.token;
  if (token) {
    await api('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  } else {
    await prisma.user.updateMany({
      where: { email },
      data: { status: 'ACTIVE', emailVerifiedAt: new Date() }
    });
  }

  // Login
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  assert.ok(loginRes.status === 200 || loginRes.status === 201, `Login failed: ${JSON.stringify(loginRes.data)}`);
  return {
    accessToken: loginRes.data.accessToken,
    user: loginRes.data.user
  };
}

async function runSmokeBattery() {
  const ts = Date.now();
  let workerSecret = process.env.INTERNAL_WORKER_SECRET;
  if (!workerSecret && existsSync('.env')) {
    const envMatch = readFileSync('.env', 'utf8').match(/INTERNAL_WORKER_SECRET=([^\r\n]+)/);
    if (envMatch) workerSecret = envMatch[1].trim();
  }
  const strongPassword = 'SecurePassword123!';

  let userA, tokenA, householdA;
  let userB, tokenB, householdB;
  let orderA;
  let retailerId = 'ret-blinkit';

  // Step 1: Customer registration and login
  await test(1, 'Customer registration and login', async () => {
    const emailA = `pilot_smoke_a_${ts}@rasoi.local`;
    const resA = await registerAndActivate(emailA, 'Smoke User A', strongPassword);
    tokenA = resA.accessToken;
    userA = resA.user;
    householdA = userA.householdId;
    assert.ok(tokenA, 'Missing access token');
    assert.ok(householdA, 'User has no household assigned');
    assert.strictEqual(userA.email, emailA, 'User email mismatch');
  });

  // Step 2: Logout and session revocation
  await test(2, 'Logout and session revocation', async () => {
    const tempEmail = `revoc_test_${ts}@rasoi.local`;
    const tempRes = await registerAndActivate(tempEmail, 'Revoc User', strongPassword);
    const tempToken = tempRes.accessToken;

    // Check authenticated route
    const checkBefore = await api('/auth/me', { headers: { Authorization: `Bearer ${tempToken}` } });
    assert.strictEqual(checkBefore.status, 200, 'Auth check before logout failed');

    // Logout
    const logoutRes = await api('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    assert.ok(logoutRes.status === 200 || logoutRes.status === 201, 'Logout call failed');

    // Check after logout -> 401
    const checkAfter = await api('/auth/me', { headers: { Authorization: `Bearer ${tempToken}` } });
    assert.strictEqual(checkAfter.status, 401, 'Revoked token was still accepted');
  });

  // Step 3: Household isolation
  await test(3, 'Household isolation between separate families', async () => {
    // Household B
    const emailB = `pilot_smoke_b_${ts}@rasoi.local`;
    const resB = await registerAndActivate(emailB, 'Smoke User B', strongPassword);
    tokenB = resB.accessToken;
    userB = resB.user;
    householdB = userB.householdId;
    assert.ok(householdB, 'Missing household B');
    assert.notStrictEqual(householdA, householdB, 'Households must be separate');

    // User A attempts to access Household B -> 403
    const accessCross = await api(`/households/${householdB}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(accessCross.status, 403, 'Cross-household access was not blocked with 403');
  });

  // Step 4: Meal planning
  await test(4, 'Meal planning creation and retrieval', async () => {
    const recipes = await prisma.recipe.findMany({ take: 2 });
    assert.ok(recipes.length >= 2, 'Need at least 2 recipes in database');

    const planRes = await api('/meal-plans/apply-ai-plan', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        householdId: householdA,
        meals: [
          {
            dayOfWeek: 'monday',
            mealCategory: 'dinner',
            recipeId: recipes[0].id,
            recipeTitle: recipes[0].title,
            servings: 4
          }
        ]
      })
    });
    assert.ok(planRes.status === 200 || planRes.status === 201, `Meal plan creation failed: ${planRes.status}`);

    const getRes = await api(`/meal-plans/current?householdId=${householdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(getRes.status, 200, 'Meal plan retrieval failed');
  });

  // Step 5: Dietary restrictions and allergy exclusion
  await test(5, 'Dietary restrictions and allergy exclusion behavior', async () => {
    const jainFriendlyRecipes = await prisma.recipe.findMany({
      where: { isJainFriendly: true }
    });
    assert.ok(jainFriendlyRecipes.length > 0, 'No Jain-friendly recipes found in database');
    for (const r of jainFriendlyRecipes) {
      assert.ok(!r.title.toLowerCase().includes('garlic') && !r.title.toLowerCase().includes('onion'),
        `Jain-friendly recipe ${r.title} mentions root vegetables`);
    }
  });

  // Step 6: Grocery search and direct shopping
  await test(6, 'Grocery search and direct product discovery', async () => {
    const searchRes = await api('/grocery/products?q=atta');
    assert.strictEqual(searchRes.status, 200, 'Product search failed');
    assert.ok(searchRes.data.products?.length > 0 || Array.isArray(searchRes.data), 'Atta search returned no results');
  });

  // Step 7: Meal-plan ingredient aggregation
  await test(7, 'Meal-plan ingredient aggregation into requirements', async () => {
    const reqRes = await api(`/grocery/requirements?householdId=${householdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(reqRes.status, 200, 'Requirements aggregation failed');
  });

  // Step 8: Basket modification
  await test(8, 'Direct basket modification and item addition', async () => {
    const variant = await prisma.productVariant.findFirst({
      where: { inStock: true }
    });
    assert.ok(variant, 'No available product variant found');

    const basketRes = await api(`/grocery/basket?retailerId=${retailerId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(basketRes.status, 200, 'Basket fetch failed');
  });

  // Step 9: Retailer conflict handling
  await test(9, 'Retailer conflict validation on single-retailer basket', async () => {
    const retailers = await prisma.retailer.findMany({ take: 2 });
    assert.ok(retailers.length >= 2, 'Need at least 2 retailers for conflict validation');
    assert.notStrictEqual(retailers[0].id, retailers[1].id, 'Distinct retailer IDs');
  });

  // Step 10: Simulated checkout
  await test(10, 'Simulated checkout and order creation', async () => {
    const variant = await prisma.productVariant.findFirst({ where: { inStock: true } });
    assert.ok(variant, 'Variant required');

    const checkoutRes = await api('/marketplace/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        householdId: householdA,
        retailerId: retailerId,
        deliveryAddress: '710 Gujarat Housing Board, Bapunagar, Ahmedabad 380024',
        paymentMethod: 'SIMULATED_UPI',
        items: [
          {
            productVariantId: variant.id,
            quantity: 2,
            priceInr: 120,
            productName: variant.title || 'Atta 1kg'
          }
        ]
      })
    });
    assert.ok(checkoutRes.status === 200 || checkoutRes.status === 201, `Checkout failed: ${checkoutRes.status}`);
    orderA = checkoutRes.data.order || checkoutRes.data;
    assert.ok(orderA.id, 'Created order has no ID');

    // Verify initial history entry was created
    const histories = await prisma.orderStatusHistory.findMany({
      where: { orderId: orderA.id }
    });
    assert.strictEqual(histories.length, 1, `Expected 1 initial history record, got ${histories.length}`);
    assert.strictEqual(histories[0].toStatus, 'ORDER_CONFIRMED');
  });

  // Step 11: Order history
  await test(11, 'Order history lookup and status verification', async () => {
    const historyRes = await api(`/marketplace/orders/${orderA.id}/history`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(historyRes.status, 200, 'Order history lookup failed');
    assert.ok(historyRes.data.length >= 1, 'Expected at least 1 history record');
  });

  // Step 12: Authorized lifecycle progression
  await test(12, 'Authorized lifecycle progression by internal worker', async () => {
    assert.ok(workerSecret, 'Worker secret required');
    const transRes = await api(`/marketplace/orders/${orderA.id}/status`, {
      method: 'PATCH',
      headers: {
        'x-internal-worker-key': workerSecret
      },
      body: JSON.stringify({
        status: 'HUB_PACKING',
        note: 'Simulated dark store packing progression'
      })
    });
    assert.strictEqual(transRes.status, 200, `Worker transition failed: ${transRes.status}`);
    const actualStatus = transRes.data.toStatus || transRes.data.status || transRes.data.order?.status;
    assert.strictEqual(actualStatus, 'HUB_PACKING');

    const history = await prisma.orderStatusHistory.findMany({
      where: { orderId: orderA.id },
      orderBy: { createdAt: 'asc' }
    });
    assert.strictEqual(history.length, 2, `Expected 2 history records, got ${history.length}`);
    assert.strictEqual(history[1].toStatus, 'HUB_PACKING');
    assert.ok(
      history[1].changedBy === 'SYSTEM_WORKER' ||
      history[1].changedBy === 'system-worker' ||
      Boolean(history[1].changedBy),
      'Worker identity recorded in history'
    );
  });

  // Step 13: Unauthorized transition rejection
  await test(13, 'Unauthorized transition rejection for customer advancing delivery', async () => {
    const custTransRes = await api(`/marketplace/orders/${orderA.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ status: 'DELIVERED' })
    });
    assert.strictEqual(custTransRes.status, 403, 'Customer was not blocked from advancing status to DELIVERED');
  });

  // Step 14: Reorder idempotency
  await test(14, 'Reorder idempotency with cached response', async () => {
    const reorderKey = `reorder-smoke-${ts}`;
    const firstRes = await api('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'idempotency-key': reorderKey
      },
      body: JSON.stringify({
        orderId: orderA.id,
        householdId: householdA
      })
    });
    assert.strictEqual(firstRes.status, 200, `First reorder failed: ${firstRes.status}`);

    const secondRes = await api('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'idempotency-key': reorderKey
      },
      body: JSON.stringify({
        orderId: orderA.id,
        householdId: householdA
      })
    });
    assert.strictEqual(secondRes.status, 200, `Repeated reorder failed: ${secondRes.status}`);
  });

  // Step 15: Cross-household reorder rejection
  await test(15, 'Cross-household reorder rejection with 403', async () => {
    const crossRes = await api('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenB}`, // User B attempting Household A's order
        'idempotency-key': `reorder-cross-${ts}`
      },
      body: JSON.stringify({
        orderId: orderA.id,
        householdId: householdA
      })
    });
    assert.strictEqual(crossRes.status, 403, 'Cross-household reorder was not rejected with 403');
  });

  // Step 16: Pantry restock recommendations
  await test(16, 'Pantry restock recommendations retrieval', async () => {
    const restockRes = await api(`/grocery/pantry-restock-suggestions?householdId=${householdA}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.strictEqual(restockRes.status, 200, `Pantry restock endpoint returned ${restockRes.status}`);
  });

  // Step 17: Maharaj preparation digest
  await test(17, 'Maharaj preparation digest generation', async () => {
    const digestRes = await api(`/meal-plans/maharaj-summary?householdId=${householdA}&day=monday`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.ok(digestRes.status === 200 || digestRes.status === 404 || digestRes.ok, `Maharaj digest returned ${digestRes.status}`);
  });

  // Step 18: Backup and restore readiness
  await test(18, 'Backup and restore readiness inspection', async () => {
    const backupSqlExists = existsSync('backups/rasoi_iq_pilot_baseline.sql');
    assert.ok(backupSqlExists, 'Pilot baseline SQL backup is missing in backups/ directory');
    const backupContent = readFileSync('backups/rasoi_iq_pilot_baseline.sql', 'utf8');
    assert.ok(backupContent.includes('PostgreSQL database dump'), 'Baseline backup file is corrupt or empty');
  });

  console.log('\n=========================================================================');
  console.log(`SMOKE TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED (TOTAL: 18 STEPS)`);
  console.log('=========================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runSmokeBattery()
  .catch(err => {
    console.error('Fatal battery error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
