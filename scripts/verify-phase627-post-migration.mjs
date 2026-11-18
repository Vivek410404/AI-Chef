import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'rasoi_iq_production_secret_key_minimum_32_characters_long_2026';

let passCount = 0;
let failCount = 0;
const results = [];

function assert(condition, message, details = '') {
  if (condition) {
    passCount++;
    console.log(`  [PASS] ${message}`);
    results.push({ status: 'PASS', message, details });
  } else {
    failCount++;
    console.error(`  [FAIL] ${message} - ${details}`);
    results.push({ status: 'FAIL', message, details });
  }
}

async function runVerification() {
  console.log('================================================================');
  console.log('RasoiIQ Phase 6.2.7 — Post-Migration Recovery & Integrity Verification');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // Workstream A: Retailer Switching
  // ---------------------------------------------------------------------------
  console.log('--- Workstream A: Retailer Switching ---');
  try {
    const sharmaUser = await prisma.user.findUnique({ where: { id: 'user-demo-1' } });
    const sharmaAuthHeader = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt.sign(
        { sub: sharmaUser?.id || 'user-demo-1', id: sharmaUser?.id || 'user-demo-1', role: 'CUSTOMER', householdId: 'hh-sharma-family', email: sharmaUser?.email || 'sharma@test.rasoi.me' },
        JWT_SECRET,
        { expiresIn: '1h' }
      )}`
    };

    // 1 & 2: Fetch grocery catalog and record count & pagination
    const catRes = await fetch(`${API_URL}/grocery/products?limit=16&page=1`);
    assert(catRes.status === 200, 'Catalog endpoint returns HTTP 200');
    const catData = await catRes.json();
    assert(Array.isArray(catData.products) && catData.products.length > 0, `Catalog returns products (${catData.products?.length} products)`);
    assert(catData.pagination && catData.pagination.total > 0, `Pagination total present: ${catData.pagination?.total} items, totalPages: ${catData.pagination?.totalPages}`);
    console.log(`    Total catalog products: ${catData.pagination?.total}, Page limit: ${catData.pagination?.limit}`);

    // 3: Switch from Blinkit to Zepto
    const switchZeptoRes = await fetch(`${API_URL}/grocery/cart/switch-retailer`, {
      method: 'POST',
      headers: sharmaAuthHeader,
      body: JSON.stringify({ retailerId: 'ret-zepto', householdId: 'hh-sharma-family' })
    });
    assert(switchZeptoRes.status === 201, 'Switch to Zepto returns HTTP 201');
    const zeptoData = await switchZeptoRes.json();
    assert(zeptoData.success === true, 'Switch response has success: true');
    assert(zeptoData.basket?.selectedRetailerId === 'ret-zepto', 'Basket selectedRetailerId is ret-zepto');

    // 4: Verify the selected retailer in PostgreSQL
    const dbBasketZepto = await prisma.basket.findFirst({
      where: { householdId: 'hh-sharma-family' }
    });
    assert(dbBasketZepto && dbBasketZepto.selectedRetailerId === 'ret-zepto', `PostgreSQL Basket selectedRetailerId verified as ${dbBasketZepto?.selectedRetailerId}`);

    // 5: Verify that basket items are recalculated using Zepto pricing & catalog
    const zeptoTotal = zeptoData.basket?.totalInr;
    assert(typeof zeptoTotal === 'number' && zeptoTotal > 0, `Zepto basket subtotal recalculated: ₹${zeptoTotal}`);

    // 6: Switch back to Blinkit
    const switchBlinkitRes = await fetch(`${API_URL}/grocery/cart/switch-retailer`, {
      method: 'POST',
      headers: sharmaAuthHeader,
      body: JSON.stringify({ retailerId: 'ret-blinkit', householdId: 'hh-sharma-family' })
    });
    assert(switchBlinkitRes.status === 201, 'Switch back to Blinkit returns HTTP 201');
    const blinkitData = await switchBlinkitRes.json();
    assert(blinkitData.basket?.selectedRetailerId === 'ret-blinkit', 'Basket selectedRetailerId switched back to ret-blinkit');

    const dbBasketBlinkit = await prisma.basket.findFirst({
      where: { householdId: 'hh-sharma-family' }
    });
    assert(dbBasketBlinkit && dbBasketBlinkit.selectedRetailerId === 'ret-blinkit', `PostgreSQL Basket updated to ${dbBasketBlinkit?.selectedRetailerId}`);

    // 7: Verify basket retrieval without explicit retailerId uses persisted retailer
    const getBasketRes = await fetch(`${API_URL}/grocery/basket?householdId=hh-sharma-family`, {
      headers: sharmaAuthHeader
    });
    assert(getBasketRes.status === 200, 'GET /grocery/basket returns HTTP 200');
    const getBasketData = await getBasketRes.json();
    assert(getBasketData.selectedRetailerId === 'ret-blinkit', `Hydrated basket retains persisted retailer "${getBasketData.selectedRetailerId}"`);

    // 8: Safety check: Invalid retailer rejected
    const invalidSwitchRes = await fetch(`${API_URL}/grocery/cart/switch-retailer`, {
      method: 'POST',
      headers: sharmaAuthHeader,
      body: JSON.stringify({ retailerId: 'ret-nonexistent-999', householdId: 'hh-sharma-family' })
    });
    assert(invalidSwitchRes.status >= 400, `Invalid retailer switch rejected with HTTP ${invalidSwitchRes.status}`);

  } catch (err) {
    assert(false, 'Workstream A exception', err.message);
  }

  // ---------------------------------------------------------------------------
  // Workstream B: Household Ownership on Orders
  // ---------------------------------------------------------------------------
  console.log('\n--- Workstream B: Household Ownership on Orders ---');
  try {
    // 1 & 2: Authoritative server-side household assignment on checkout
    // Login as Sharma customer (user-demo-1)
    const sharmaUser = await prisma.user.findUnique({ where: { id: 'user-demo-1' } });
    assert(sharmaUser !== null, 'Sharma user exists in PostgreSQL');

    const sharmaToken = jwt.sign(
      { sub: sharmaUser.id, id: sharmaUser.id, role: 'CUSTOMER', email: sharmaUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Get an active product variant for test order
    const variant = await prisma.productVariant.findFirst({
      where: { inStock: true }
    });
    assert(variant !== null, 'Found in-stock product variant for test');

    const checkoutRes = await fetch(`${API_URL}/marketplace/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharmaToken}`
      },
      body: JSON.stringify({
        retailerId: 'ret-blinkit',
        householdId: 'hh-sharma-family',
        items: [{ productVariantId: variant.id, quantityPacks: 1, priceInr: variant.sellingPriceInr }],
        totalInr: variant.sellingPriceInr,
        deliveryAddress: '123 Pilot Test St, Ahmedabad'
      })
    });
    assert(checkoutRes.status === 201, `Checkout as Sharma user succeeded with HTTP ${checkoutRes.status}`);
    const checkoutData = await checkoutRes.json();
    const createdOrderId = checkoutData.id || checkoutData.orderId;
    assert(createdOrderId !== undefined, `Created test order ID: ${createdOrderId}`);

    // Verify order in PostgreSQL has valid householdId
    const dbCreatedOrder = await prisma.order.findUnique({
      where: { id: createdOrderId }
    });
    assert(dbCreatedOrder !== null, 'Order persisted in PostgreSQL');
    assert(dbCreatedOrder.householdId === 'hh-sharma-family', `Order householdId is authoritatively set to "${dbCreatedOrder.householdId}"`);
    assert(dbCreatedOrder.userId === sharmaUser.id, `Order userId is consistent ("${dbCreatedOrder.userId}")`);

    // 3: Client cannot assign an arbitrary foreign householdId
    const foreignCheckoutRes = await fetch(`${API_URL}/marketplace/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharmaToken}`
      },
      body: JSON.stringify({
        retailerId: 'ret-blinkit',
        householdId: 'hh-patel-family', // Arbitrary assignment attempted!
        items: [{ productVariantId: variant.id, quantityPacks: 1, priceInr: variant.sellingPriceInr }],
        totalInr: variant.sellingPriceInr,
        deliveryAddress: '456 Unauthorized St'
      })
    });
    assert(foreignCheckoutRes.status === 403, `Arbitrary foreign householdId assignment rejected with HTTP ${foreignCheckoutRes.status}`);

    // 4: PostgreSQL Foreign Key constraint enforcement
    let fkFailedAsExpected = false;
    try {
      await prisma.order.create({
        data: {
          id: `invalid-fk-order-${Date.now()}`,
          userId: sharmaUser.id,
          householdId: 'hh-non-existent-guid-9999',
          retailerName: 'Blinkit',
          status: 'PLACED',
          totalAmountInr: 100,
          deliveryFeeInr: 0,
          deliveryAddress: '123 Fake Street'
        }
      });
    } catch (fkErr) {
      fkFailedAsExpected = fkErr.message.includes('Foreign key constraint') || fkErr.code === 'P2003';
    }
    assert(fkFailedAsExpected, 'PostgreSQL foreign key constraint strictly blocks invalid householdId (P2003)');

    // 5: Order retrieval uses persisted householdId
    const getOrdersRes = await fetch(`${API_URL}/marketplace/orders`, {
      headers: { Authorization: `Bearer ${sharmaToken}` }
    });
    assert(getOrdersRes.status === 200, 'Customer order list returned HTTP 200');
    const customerOrders = await getOrdersRes.json();
    const hasOnlyAuthorizedOrders = customerOrders.every(o => o.householdId === 'hh-sharma-family' || o.householdId === 'cmwj69k8h001zl31wvc9y7lf3' || o.userId === sharmaUser.id);
    assert(hasOnlyAuthorizedOrders, `Customer orders strictly scoped to authorized household (${customerOrders.length} orders returned)`);

    // 6: Reorder uses persisted householdId and rejects cross-household reorder
    const patelOrder = await prisma.order.findFirst({
      where: { householdId: 'hh-patel-family' }
    });
    assert(patelOrder !== null, `Found Patel order (${patelOrder?.id}) for cross-household reorder test`);

    const crossReorderRes = await fetch(`${API_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharmaToken}`
      },
      body: JSON.stringify({
        orderId: patelOrder.id,
        householdId: 'hh-sharma-family'
      })
    });
    assert(crossReorderRes.status === 403, `Cross-household reorder rejected with HTTP ${crossReorderRes.status}`);

    // 7: Historical orders reconciliation (0 null or empty householdId)
    const allOrders = await prisma.order.findMany({ select: { id: true, householdId: true } });
    const nullOrEmptyOrders = allOrders.filter(o => !o.householdId || o.householdId.trim() === '');
    assert(nullOrEmptyOrders.length === 0, `Historical orders reconciled: 0 unresolved (${allOrders.length} total orders inspected)`);

  } catch (err) {
    assert(false, 'Workstream B exception', err.message);
  }

  // ---------------------------------------------------------------------------
  // Workstream C: Active Household Membership
  // ---------------------------------------------------------------------------
  console.log('\n--- Workstream C: Active Household Membership ---');
  try {
    // 1: Active Owner
    const activeOwner = await prisma.householdMember.findFirst({
      where: { role: 'OWNER', status: 'ACTIVE' }
    });
    assert(activeOwner !== null, `Active Owner exists (${activeOwner?.name})`);

    // 2: Active Member
    const activeMember = await prisma.householdMember.findFirst({
      where: { role: 'MEMBER', status: 'ACTIVE' }
    });
    assert(activeMember !== null, `Active Member exists (${activeMember?.name})`);

    // 3: COOK role blocked from reorder
    const testCookUser = await prisma.user.create({
      data: {
        id: `user-test-cook-${Date.now()}`,
        email: `cook-${Date.now()}@testrasoi.in`,
        normalizedEmail: `cook-${Date.now()}@testrasoi.in`,
        passwordHash: await argon2.hash('TestCookPass123!'),
        fullName: 'Test Chef Cook',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });
    const testCookMember = await prisma.householdMember.create({
      data: {
        id: `mem-cook-${Date.now()}`,
        householdId: 'hh-sharma-family',
        userId: testCookUser.id,
        role: 'COOK',
        status: 'ACTIVE',
        name: 'Test Chef Cook'
      }
    });

    const cookToken = jwt.sign(
      { sub: testCookUser.id, id: testCookUser.id, role: 'CUSTOMER', email: testCookUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const cookReorderRes = await fetch(`${API_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookToken}`
      },
      body: JSON.stringify({
        orderId: 'ord-sharma-1',
        householdId: 'hh-sharma-family'
      })
    });
    assert(cookReorderRes.status === 403, `COOK role blocked from triggering reorder (HTTP ${cookReorderRes.status})`);

    // 4: Inactive Member (status: 'INACTIVE')
    const testInactiveUser = await prisma.user.create({
      data: {
        id: `user-test-inactive-${Date.now()}`,
        email: `inactive-${Date.now()}@testrasoi.in`,
        normalizedEmail: `inactive-${Date.now()}@testrasoi.in`,
        passwordHash: await argon2.hash('TestInactivePass123!'),
        fullName: 'Test Inactive Member',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });
    const testInactiveMember = await prisma.householdMember.create({
      data: {
        id: `mem-inactive-${Date.now()}`,
        householdId: 'hh-sharma-family',
        userId: testInactiveUser.id,
        role: 'MEMBER',
        status: 'INACTIVE',
        name: 'Inactive Member'
      }
    });

    const inactiveToken = jwt.sign(
      { sub: testInactiveUser.id, id: testInactiveUser.id, role: 'CUSTOMER', email: testInactiveUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const inactiveReorderRes = await fetch(`${API_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${inactiveToken}`
      },
      body: JSON.stringify({
        orderId: 'ord-sharma-1',
        householdId: 'hh-sharma-family'
      })
    });
    assert(inactiveReorderRes.status === 403, `INACTIVE member blocked from reorder (HTTP ${inactiveReorderRes.status})`);

    // 5: Removed Member (no membership row)
    const testRemovedUser = await prisma.user.create({
      data: {
        id: `user-test-removed-${Date.now()}`,
        email: `removed-${Date.now()}@testrasoi.in`,
        normalizedEmail: `removed-${Date.now()}@testrasoi.in`,
        passwordHash: await argon2.hash('TestRemovedPass123!'),
        fullName: 'Test Removed Member',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });

    const removedToken = jwt.sign(
      { sub: testRemovedUser.id, id: testRemovedUser.id, role: 'CUSTOMER', email: testRemovedUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const removedReorderRes = await fetch(`${API_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${removedToken}`
      },
      body: JSON.stringify({
        orderId: 'ord-sharma-1',
        householdId: 'hh-sharma-family'
      })
    });
    assert(removedReorderRes.status === 403, `User with no membership blocked with HTTP ${removedReorderRes.status}`);

    // Clean up test temporary members and users to maintain database preservation
    await prisma.householdMember.deleteMany({
      where: { id: { in: [testCookMember.id, testInactiveMember.id] } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testCookUser.id, testInactiveUser.id, testRemovedUser.id] } }
    });

  } catch (err) {
    assert(false, 'Workstream C exception', err.message);
  }

  // ---------------------------------------------------------------------------
  // Workstream D: Authentication Remediation
  // ---------------------------------------------------------------------------
  console.log('\n--- Workstream D: Authentication Remediation ---');
  try {
    // 1: Demo-password bypass removed: try logging in with demo_hash_rasoi_iq password
    const demoBypassRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sharma.family@rasoi.me', password: 'demo_hash_rasoi_iq_2026' })
    });
    assert(demoBypassRes.status === 401, `Demo password bypass rejected with HTTP ${demoBypassRes.status} (was 401 expected)`);

    // 2: Empty password rejected
    const emptyPassRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sharma.family@rasoi.me', password: '' })
    });
    assert(emptyPassRes.status === 400 || emptyPassRes.status === 401, `Empty password rejected with HTTP ${emptyPassRes.status}`);

    // 3: Missing database user JWT rejected
    const nonExistentToken = jwt.sign(
      { sub: 'usr-ghost-nonexistent-999', id: 'usr-ghost-nonexistent-999', role: 'CUSTOMER', email: 'ghost@nonexistent.in' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const nonExistentRes = await fetch(`${API_URL}/marketplace/orders`, {
      headers: { Authorization: `Bearer ${nonExistentToken}` }
    });
    assert(nonExistentRes.status === 401, `JWT for non-existent database user rejected with HTTP ${nonExistentRes.status}`);

    // 4: Suspended user JWT rejected
    const testSuspendedUser = await prisma.user.create({
      data: {
        id: `user-test-suspended-${Date.now()}`,
        email: `suspended-${Date.now()}@testrasoi.in`,
        normalizedEmail: `suspended-${Date.now()}@testrasoi.in`,
        passwordHash: await argon2.hash('TestSuspendedPass123!'),
        fullName: 'Suspended Test User',
        role: 'CUSTOMER',
        status: 'SUSPENDED'
      }
    });

    const suspendedToken = jwt.sign(
      { sub: testSuspendedUser.id, id: testSuspendedUser.id, role: 'CUSTOMER', email: testSuspendedUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const suspendedRes = await fetch(`${API_URL}/marketplace/orders`, {
      headers: { Authorization: `Bearer ${suspendedToken}` }
    });
    assert(suspendedRes.status === 401, `JWT for suspended user rejected with HTTP ${suspendedRes.status}`);

    await prisma.user.delete({ where: { id: testSuspendedUser.id } });

    // 5: Argon2id password hashing works
    const testArgonHash = await argon2.hash('SampleSecurePassword2026!');
    assert(testArgonHash.startsWith('$argon2id$'), `Argon2id produces standard hash format: ${testArgonHash.slice(0, 15)}...`);
    const argonVerify = await argon2.verify(testArgonHash, 'SampleSecurePassword2026!');
    assert(argonVerify === true, 'Argon2id verification succeeds');

    // 6: Legacy bcrypt verification works
    const testBcryptHash = await bcrypt.hash('LegacyBcryptPassword123!', 10);
    const bcryptVerify = await bcrypt.compare('LegacyBcryptPassword123!', testBcryptHash);
    assert(bcryptVerify === true, 'Legacy bcrypt verification succeeds');

    // 7: Revoked token persistence across SHA-256 hash
    const testRevokeToken = jwt.sign(
      { sub: 'user-demo-1', id: 'user-demo-1', role: 'CUSTOMER', email: 'test@revoke.in', jti: `jti-test-${Date.now()}` },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const tokenHash = crypto.createHash('sha256').update(testRevokeToken).digest('hex');
    await prisma.revokedToken.create({
      data: {
        token: tokenHash,
        expiresAt: new Date(Date.now() + 3600000)
      }
    });

    const revokedTokenRes = await fetch(`${API_URL}/marketplace/orders`, {
      headers: { Authorization: `Bearer ${testRevokeToken}` }
    });
    assert(revokedTokenRes.status === 401, `Revoked token (stored via SHA-256 hash) rejected with HTTP ${revokedTokenRes.status}`);

    // Clean up test revoked token
    await prisma.revokedToken.deleteMany({ where: { token: tokenHash } });

  } catch (err) {
    assert(false, 'Workstream D exception', err.message);
  }

  // ---------------------------------------------------------------------------
  // Workstream E: Database Preservation Verification
  // ---------------------------------------------------------------------------
  console.log('\n--- Workstream E: Database Preservation Verification ---');
  try {
    const [
      users, households, members, recipes, ingredients, products, variants,
      retailers, storeProducts, mealPlanItems, pantryItems, baskets, orders,
      orderItems, history, sessions, revoked, audits
    ] = await Promise.all([
      prisma.user.count(),
      prisma.household.count(),
      prisma.householdMember.count(),
      prisma.recipe.count(),
      prisma.ingredient.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
      prisma.retailer.count(),
      prisma.storeProduct.count(),
      prisma.mealPlanItem.count(),
      prisma.pantryItem.count(),
      prisma.basket.count(),
      prisma.order.count(),
      prisma.orderItem.count(),
      prisma.orderStatusHistory.count(),
      prisma.session.count(),
      prisma.revokedToken.count(),
      prisma.auditLog.count()
    ]);

    console.log('Current Database Entity Counts:');
    console.log(`  Users: ${users} (Baseline: 218)`);
    console.log(`  Households: ${households} (Baseline: 107)`);
    console.log(`  HouseholdMember: ${members} (Baseline: 140)`);
    console.log(`  Recipes: ${recipes} (Baseline: 46)`);
    console.log(`  Ingredients: ${ingredients} (Baseline: 57)`);
    console.log(`  Products: ${products} (Baseline: 122)`);
    console.log(`  Variants: ${variants} (Baseline: 141)`);
    console.log(`  Retailers: ${retailers} (Baseline: 44)`);
    console.log(`  StoreProducts: ${storeProducts} (Baseline: 408)`);
    console.log(`  MealPlanItems: ${mealPlanItems} (Baseline: 174)`);
    console.log(`  PantryItems: ${pantryItems} (Baseline: 18)`);
    console.log(`  Orders: ${orders} (Baseline: 700 + verified test orders)`);
    console.log(`  OrderItems: ${orderItems} (Baseline: 678)`);
    console.log(`  OrderStatusHistory: ${history} (Baseline: 702)`);
    console.log(`  Sessions: ${sessions} (Baseline: 268)`);
    console.log(`  RevokedToken: ${revoked} (Baseline: 69)`);
    console.log(`  AuditLog: ${audits} (Baseline: 1123)`);

    assert(users >= 218, 'Zero users lost');
    assert(households >= 107, 'Zero households lost');
    assert(members >= 140, 'Zero household members lost');
    assert(products >= 122, 'Zero products lost');
    assert(variants >= 141, 'Zero variants lost');
    assert(orders >= 700, 'Zero historical orders lost');

  } catch (err) {
    assert(false, 'Workstream E exception', err.message);
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`Verification Complete: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runVerification()
  .catch(e => {
    console.error('Fatal execution error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
