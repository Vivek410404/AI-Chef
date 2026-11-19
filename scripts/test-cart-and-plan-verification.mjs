import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';

const API_BASE = 'http://localhost:4000/api';
const prisma = new PrismaClient();

console.log('🧪 =========================================================================');
console.log('🧪 RASOIIQ VERIFICATION: EMPTY CART & AI MEAL PLAN GROCERIES TO BASKET');
console.log('🧪 =========================================================================\n');

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  const setCookies = res.headers.get('set-cookie') || '';
  return { status: res.status, ok: res.ok, data, setCookies, headers: res.headers };
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

  // Extract cookies
  const cookies = loginRes.setCookies;
  const cookieHeader = cookies.split(',').map(c => c.split(';')[0]).join('; ');

  // Get CSRF token
  const csrfRes = await api('/auth/csrf', {
    headers: { Cookie: cookieHeader }
  });
  const csrfToken = csrfRes.data?.csrfToken;

  return {
    accessToken: loginRes.data.accessToken,
    user: loginRes.data.user,
    cookieHeader,
    csrfToken
  };
}

async function run() {
  const ts = Date.now();
  const email = `test-cart-${ts}@pilot.com`;
  const password = 'CartPlanPassword2026!';
  console.log(`1. Registering and authenticating test pilot user: ${email}...`);
  const session = await registerAndActivate(email, 'Cart Test User', password);
  console.log(`   User registered and logged in with ID: ${session.user.id}`);

  const userWithHh = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { households: true, householdMembers: true }
  });
  const householdId = userWithHh.households?.[0]?.id || userWithHh.householdMembers?.[0]?.householdId;
  console.log(`   Authoritative Household ID: ${householdId}`);

  const authHeaders = {
    'Cookie': session.cookieHeader,
    'x-csrf-token': session.csrfToken,
    'Origin': 'http://localhost:3000',
    'Referer': 'http://localhost:3000/'
  };

  // Step 2: Apply AI Meal Plan for the whole week
  console.log('\n2. Applying AI Meal Plan with full week meals...');
  const recipesRes = await api('/recipes');
  const recipes = recipesRes.data;
  assert.ok(recipes.length >= 3, 'Expected at least 3 recipes from /recipes');

  const fullWeekMeals = [
    { dayOfWeek: 'monday', mealCategory: 'breakfast', recipeId: recipes[0].id, servings: 4, reason: 'Energetic start' },
    { dayOfWeek: 'monday', mealCategory: 'lunch', recipeId: recipes[1].id, servings: 4, reason: 'Wholesome lunch' },
    { dayOfWeek: 'monday', mealCategory: 'dinner', recipeId: recipes[2].id, servings: 4, reason: 'Light dinner' },
    { dayOfWeek: 'tuesday', mealCategory: 'breakfast', recipeId: recipes[3].id, servings: 4, reason: 'Quick breakfast' },
    { dayOfWeek: 'tuesday', mealCategory: 'lunch', recipeId: recipes[4].id, servings: 4, reason: 'Nutritious lunch' },
    { dayOfWeek: 'tuesday', mealCategory: 'dinner', recipeId: recipes[5].id, servings: 4, reason: 'Family dinner' },
    { dayOfWeek: 'wednesday', mealCategory: 'breakfast', recipeId: recipes[0].id, servings: 4, reason: 'Midweek breakfast' },
    { dayOfWeek: 'wednesday', mealCategory: 'lunch', recipeId: recipes[1].id, servings: 4, reason: 'Comfort food' },
    { dayOfWeek: 'wednesday', mealCategory: 'dinner', recipeId: recipes[2].id, servings: 4, reason: 'Evening dinner' }
  ];

  const applyRes = await api('/meal-plans/apply-ai-plan', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ meals: fullWeekMeals, householdId })
  });
  console.log(`   Apply AI Plan HTTP Status: ${applyRes.status}`);
  assert.strictEqual(applyRes.status, 201, `Failed to apply AI plan: ${JSON.stringify(applyRes.data)}`);
  assert.strictEqual(applyRes.data.length, fullWeekMeals.length, 'Meal plan item count should match submitted meals');
  console.log(`   ✅ Applied ${applyRes.data.length} meals to household meal plan.`);

  // Step 3: Reset Basket for Plan and verify groceries are in basket
  console.log('\n3. Resetting basket for newly applied plan & inspecting grocery basket...');
  const resetBasketRes = await api('/grocery/basket/reset-for-plan', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ householdId })
  });
  assert.strictEqual(resetBasketRes.status, 201, `Failed to reset basket: ${JSON.stringify(resetBasketRes.data)}`);

  const basket = resetBasketRes.data;
  console.log(`   Basket ID: ${basket.id}`);
  console.log(`   Selected Retailer: ${basket.selectedRetailerId}`);
  console.log(`   Total Items in Basket: ${basket.items.length}`);
  const selectedItems = basket.items.filter(i => i.isSelectedForPurchase);
  console.log(`   Selected Items for Purchase: ${selectedItems.length}`);
  console.log(`   Subtotal: ₹${basket.subtotalInr}`);
  console.log(`   Total Payable: ₹${basket.totalInr}`);

  assert.ok(basket.items.length > 0, 'Basket should contain grocery items needed for the meals');
  assert.ok(selectedItems.length > 0, 'Basket should have active selected items for purchase');
  assert.ok(basket.totalInr > 0, 'Basket total should be greater than ₹0');
  console.log('   Sample groceries in basket:');
  selectedItems.slice(0, 5).forEach(item => {
    console.log(`     - ${item.productVariant.title} (${item.quantityPacks} pack(s) @ ₹${item.totalPriceInr})`);
  });
  console.log(`   ✅ Groceries for the whole week successfully populated into basket!`);

  // Step 4: Test Empty Whole Cart
  console.log('\n4. Testing Empty Whole Cart feature (POST /grocery/cart/clear)...');
  const clearRes = await api('/grocery/cart/clear', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ householdId })
  });
  assert.strictEqual(clearRes.status, 201, `Clear cart failed: ${JSON.stringify(clearRes.data)}`);
  const clearedBasket = clearRes.data;
  const clearedSelected = clearedBasket.items.filter(i => i.isSelectedForPurchase);
  console.log(`   Cleared Basket - Selected Items: ${clearedSelected.length}`);
  console.log(`   Cleared Basket - Subtotal: ₹${clearedBasket.subtotalInr}`);
  console.log(`   Cleared Basket - Total: ₹${clearedBasket.totalInr}`);
  assert.strictEqual(clearedSelected.length, 0, 'All items should be deselected/cleared');
  assert.strictEqual(clearedBasket.subtotalInr, 0, 'Subtotal must be 0 after empty cart');
  assert.strictEqual(clearedBasket.totalInr, 0, 'Total must be 0 after empty cart');
  console.log(`   ✅ Cart emptied successfully!`);

  // Step 5: Verify GET /grocery/basket retains cleared state
  console.log('\n5. Verifying subsequent GET /grocery/basket maintains cleared state...');
  const getBasketAfterClear = await api('/grocery/basket', {
    headers: authHeaders
  });
  assert.strictEqual(getBasketAfterClear.status, 200);
  const persistentClearedSelected = getBasketAfterClear.data.items.filter(i => i.isSelectedForPurchase);
  console.log(`   Persistent Basket - Selected Items: ${persistentClearedSelected.length}`);
  console.log(`   Persistent Basket - Total: ₹${getBasketAfterClear.data.totalInr}`);
  assert.strictEqual(persistentClearedSelected.length, 0, 'Active cart remains empty on subsequent fetch');
  assert.strictEqual(getBasketAfterClear.data.totalInr, 0, 'Total remains 0 on subsequent fetch');
  console.log(`   ✅ Empty cart state verified persistent!`);

  // Step 6: Verify applying a new AI meal plan repopulates the basket
  console.log('\n6. Verifying applying another AI meal plan repopulates the basket afresh...');
  await api('/meal-plans/apply-ai-plan', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ meals: fullWeekMeals.slice(0, 3), householdId })
  });
  const repopulatedBasket = await api('/grocery/basket/reset-for-plan', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ householdId })
  });
  const repopSelected = repopulatedBasket.data.items.filter(i => i.isSelectedForPurchase);
  console.log(`   Repopulated Basket - Selected Items: ${repopSelected.length}`);
  console.log(`   Repopulated Basket - Total: ₹${repopulatedBasket.data.totalInr}`);
  assert.ok(repopSelected.length > 0, 'Repopulated basket should have items');
  assert.ok(repopulatedBasket.data.totalInr > 0, 'Repopulated basket should have positive total');
  console.log(`   ✅ Fresh AI plan repopulated basket as expected!`);

  console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
