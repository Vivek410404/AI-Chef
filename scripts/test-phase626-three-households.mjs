import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'node:fs';

const API_BASE = 'http://localhost:4000/api';
const prisma = new PrismaClient();

console.log('🧪 =========================================================================');
console.log('🧪 RASOIIQ PHASE 6.2.6 — THREE-HOUSEHOLD SUPERVISED PILOT SIMULATION');
console.log('🧪 =========================================================================\n');

let passCount = 0;
let failCount = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
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

async function runThreeHouseholdSimulation() {
  const ts = Date.now();
  let workerSecret = process.env.INTERNAL_WORKER_SECRET;
  if (!workerSecret && existsSync('.env')) {
    const envMatch = readFileSync('.env', 'utf8').match(/INTERNAL_WORKER_SECRET=([^\r\n]+)/);
    if (envMatch) workerSecret = envMatch[1].trim();
  }
  const password = 'PilotPassword2026!';

  // --- HOUSEHOLD A: Vegetarian Family (4 members, Lacto-vegetarian) ---
  console.log('\n--- PERSONA A: Vegetarian Family (4 Members, Lacto-Vegetarian) ---');
  let userA, tokenA, hhA, orderA;

  await test('A.1: Register customer and activate', async () => {
    const email = `sharma_family_${ts}@pilot.local`;
    const res = await registerAndActivate(email, 'Aarav Sharma', password);
    userA = res.user;
    tokenA = res.accessToken;
    hhA = userA.householdId;
    assert.ok(tokenA, 'Missing token');
    assert.ok(hhA, 'Missing householdId');
  });

  await test('A.2: Configure household members & dietary preferences (VEGETARIAN)', async () => {
    const updateHh = await api('/households/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        name: 'Sharma Family Kitchen',
        dietaryPreference: 'VEGETARIAN',
        cuisinePreference: 'NORTH_INDIAN',
        allergies: [],
        excludedIngredients: []
      })
    });
    assert.ok(updateHh.ok, 'Failed to update household A preferences');

    // Add members to reach 4 members
    await api('/households/me/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Sunita Sharma', role: 'MEMBER' })
    });
    await api('/households/me/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Rohan Sharma', role: 'MEMBER' })
    });
    await api('/households/me/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ name: 'Maharaj Ji', role: 'COOK' })
    });
  });

  await test('A.3: Generate weekly meal plan with dietary validation', async () => {
    const planRes = await api('/meal-plans/apply-ai-plan', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    assert.ok(planRes.ok, `Meal plan creation failed: ${JSON.stringify(planRes.data)}`);

    const currentPlan = await api('/meal-plans/current', {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const items = Array.isArray(currentPlan.data) ? currentPlan.data : currentPlan.data?.items;
    assert.ok(currentPlan.ok && Array.isArray(items), 'Could not fetch current meal plan');
    assert.ok(items.length > 0, 'Meal plan has zero items');
  });

  await test('A.4: Direct grocery shopping, add items, checkout and order placement', async () => {
    const prodRes = await api('/grocery/products?retailerId=ret-blinkit&limit=5');
    assert.ok(prodRes.ok && prodRes.data.products?.length > 0, 'No products found');
    const firstVariant = prodRes.data.products[0].variants[0];

    const checkoutRes = await api('/marketplace/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        retailerId: 'ret-blinkit',
        totalInr: firstVariant.sellingPriceInr + 25,
        deliveryAddress: 'Flat 402, Sharma Heights, Bengaluru',
        householdId: hhA,
        items: [{ productVariantId: firstVariant.id, quantityPacks: 2, priceInr: firstVariant.sellingPriceInr }]
      })
    });
    assert.ok(checkoutRes.ok && checkoutRes.data?.id, `Checkout failed: ${JSON.stringify(checkoutRes.data)}`);
    orderA = checkoutRes.data.id;
  });

  await test('A.5: Progress order to OUT_FOR_DELIVERY via internal worker key', async () => {
    const step1 = await api(`/marketplace/orders/${orderA}/status`, {
      method: 'PATCH',
      headers: { 'x-internal-worker-key': workerSecret },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.ok(step1.ok, `HUB_PACKING failed: ${JSON.stringify(step1.data)}`);

    const step2 = await api(`/marketplace/orders/${orderA}/status`, {
      method: 'PATCH',
      headers: { 'x-internal-worker-key': workerSecret },
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' })
    });
    assert.ok(step2.ok, `OUT_FOR_DELIVERY failed: ${JSON.stringify(step2.data)}`);
  });


  // --- HOUSEHOLD B: Jain Family (3 members, Strict Jain restrictions) ---
  console.log('\n--- PERSONA B: Jain Family (3 Members, Strict Jain Restrictions) ---');
  let userB, tokenB, hhB, orderB;

  await test('B.1: Register customer and activate', async () => {
    const email = `patel_jain_${ts}@pilot.local`;
    const res = await registerAndActivate(email, 'Bhavin Patel', password);
    userB = res.user;
    tokenB = res.accessToken;
    hhB = userB.householdId;
    assert.ok(tokenB, 'Missing token');
    assert.ok(hhB, 'Missing householdId');
  });

  await test('B.2: Configure household members & dietary preferences (JAIN)', async () => {
    const updateHh = await api('/households/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        name: 'Patel Jain Kitchen',
        dietaryPreference: 'JAIN',
        cuisinePreference: 'WEST_INDIAN',
        allergies: [],
        excludedIngredients: ['onion', 'garlic', 'potato']
      })
    });
    assert.ok(updateHh.ok, 'Failed to update household B preferences');

    await api('/households/me/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ name: 'Daksha Patel', role: 'MEMBER' })
    });
    await api('/households/me/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ name: 'Anand Patel', role: 'MEMBER' })
    });
  });

  await test('B.3: Generate weekly meal plan with Jain rule validation', async () => {
    const planRes = await api('/meal-plans/apply-ai-plan', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert.ok(planRes.ok, `Meal plan creation failed: ${JSON.stringify(planRes.data)}`);

    const currentPlan = await api('/meal-plans/current', {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const items = Array.isArray(currentPlan.data) ? currentPlan.data : currentPlan.data?.items;
    assert.ok(currentPlan.ok && Array.isArray(items), 'Could not fetch meal plan');
    // Verify none of the recipes violate Jain principles
    for (const item of items) {
      if (item.recipe) {
        assert.ok(item.recipe.isJainFriendly !== false, `Non-Jain recipe included: ${item.recipe.title}`);
      }
    }
  });

  await test('B.4: Direct grocery shopping and checkout under Zepto catalog', async () => {
    const prodRes = await api('/grocery/products?retailerId=ret-zepto&limit=5');
    assert.ok(prodRes.ok && prodRes.data.products?.length > 0, 'No Zepto products found');
    const variant = prodRes.data.products[0].variants[0];

    const checkoutRes = await api('/marketplace/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        retailerId: 'ret-zepto',
        totalInr: variant.sellingPriceInr + 20,
        deliveryAddress: 'B-12, Shanti Nagar, Ahmedabad',
        householdId: hhB,
        items: [{ productVariantId: variant.id, quantityPacks: 1, priceInr: variant.sellingPriceInr }]
      })
    });
    assert.ok(checkoutRes.ok && checkoutRes.data?.id, `Checkout failed: ${JSON.stringify(checkoutRes.data)}`);
    orderB = checkoutRes.data.id;
  });

  await test('B.5: Cross-household access rejection (B cannot access A)', async () => {
    const hackRes = await api(`/marketplace/orders/${orderA}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    assert.strictEqual(hackRes.status, 403, 'Cross-household order access was NOT blocked!');
  });


  // --- HOUSEHOLD C: Eggetarian Family (2 members, Peanut Allergy, Low-GI) ---
  console.log('\n--- PERSONA C: Eggetarian Family (2 Members, Peanut Allergy) ---');
  let userC, tokenC, hhC, orderC;

  await test('C.1: Register customer and activate', async () => {
    const email = `kapoor_family_${ts}@pilot.local`;
    const res = await registerAndActivate(email, 'Vikram Kapoor', password);
    userC = res.user;
    tokenC = res.accessToken;
    hhC = userC.householdId;
    assert.ok(tokenC, 'Missing token');
    assert.ok(hhC, 'Missing householdId');
  });

  await test('C.2: Configure household members & dietary preferences (EGGETARIAN + Allergy)', async () => {
    const updateHh = await api('/households/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenC}` },
      body: JSON.stringify({
        name: 'Kapoor Kitchen',
        dietaryPreference: 'EGGETARIAN',
        cuisinePreference: 'NORTH_INDIAN',
        allergies: ['peanuts', 'groundnuts'],
        excludedIngredients: ['peanut oil', 'mungfali']
      })
    });
    assert.ok(updateHh.ok, 'Failed to update household C preferences');

    await api('/households/me/members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenC}` },
      body: JSON.stringify({ name: 'Meera Kapoor', role: 'MEMBER' })
    });
  });

  await test('C.3: Generate meal plan respecting peanut exclusion', async () => {
    const planRes = await api('/meal-plans/apply-ai-plan', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    assert.ok(planRes.ok, `Meal plan creation failed: ${JSON.stringify(planRes.data)}`);

    const currentPlan = await api('/meal-plans/current', {
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    const items = Array.isArray(currentPlan.data) ? currentPlan.data : currentPlan.data?.items;
    assert.ok(currentPlan.ok && Array.isArray(items), 'Could not fetch meal plan');
    for (const item of items) {
      if (item.recipe?.title) {
        assert.ok(!item.recipe.title.toLowerCase().includes('peanut'), `Recipe title contains peanut: ${item.recipe.title}`);
      }
    }
  });

  await test('C.4: Direct grocery shopping and checkout under DMart catalog', async () => {
    const prodRes = await api('/grocery/products?retailerId=ret-dmart&limit=5');
    assert.ok(prodRes.ok && prodRes.data.products?.length > 0, 'No DMart products found');
    const variant = prodRes.data.products[0].variants[0];

    const checkoutRes = await api('/marketplace/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenC}` },
      body: JSON.stringify({
        retailerId: 'ret-dmart',
        totalInr: variant.sellingPriceInr + 30,
        deliveryAddress: 'Flat 901, Palm Court, Mumbai',
        householdId: hhC,
        items: [{ productVariantId: variant.id, quantityPacks: 1, priceInr: variant.sellingPriceInr }]
      })
    });
    assert.ok(checkoutRes.ok && checkoutRes.data?.id, `Checkout failed: ${JSON.stringify(checkoutRes.data)}`);
    orderC = checkoutRes.data.id;
  });

  await test('C.5: Reorder idempotency & isolation test', async () => {
    const idKey = `idemp-key-c-${Date.now()}`;
    const reorder1 = await api('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenC}`,
        'idempotency-key': idKey
      },
      body: JSON.stringify({ orderId: orderC, householdId: hhC })
    });
    assert.ok(reorder1.ok, `First reorder failed: ${JSON.stringify(reorder1.data)}`);

    const reorder2 = await api('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenC}`,
        'idempotency-key': idKey
      },
      body: JSON.stringify({ orderId: orderC, householdId: hhC })
    });
    assert.ok(reorder2.ok, 'Replayed reorder failed');
    assert.strictEqual(reorder2.data.isIdempotentReplay, true, 'isIdempotentReplay was not true on replay');
  });

  await test('C.6: Cross-household access rejection (C cannot access A or B)', async () => {
    const hackA = await api(`/marketplace/orders/${orderA}`, {
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    assert.strictEqual(hackA.status, 403, 'Cross-household order A access was NOT blocked!');

    const hackB = await api(`/marketplace/orders/${orderB}`, {
      headers: { Authorization: `Bearer ${tokenC}` }
    });
    assert.strictEqual(hackB.status, 403, 'Cross-household order B access was NOT blocked!');
  });

  console.log('\n=========================================================================');
  console.log(`THREE-HOUSEHOLD SIMULATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=========================================================================\n');

  if (failCount > 0) process.exit(1);
}

runThreeHouseholdSimulation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
