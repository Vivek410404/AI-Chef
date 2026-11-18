import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'rasoi_iq_super_secret_jwt_key_2026';
let WORKER_SECRET = process.env.INTERNAL_WORKER_SECRET;
if (!WORKER_SECRET && fs.existsSync('services/api/.env')) {
  const envText = fs.readFileSync('services/api/.env', 'utf-8');
  const match = envText.match(/INTERNAL_WORKER_SECRET=([^\r\n]+)/);
  if (match) WORKER_SECRET = match[1].trim();
}
if (!WORKER_SECRET && fs.existsSync('.env')) {
  const envText = fs.readFileSync('.env', 'utf-8');
  const match = envText.match(/INTERNAL_WORKER_SECRET=([^\r\n]+)/);
  if (match) WORKER_SECRET = match[1].trim();
}
if (!WORKER_SECRET) {
  WORKER_SECRET = '440eadbf3033a5151b1c8ed9a6a99e661e5ef785b57cd06d9c21e1977a32e37b';
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, headers: res.headers, body };
}

async function main() {
  console.log('🧪 =======================================================');
  console.log('🧪 RASOIIQ PHASE 6.2.5 — COMPREHENSIVE SECURITY & AUDIT SUITE');
  console.log('🧪 =======================================================\n');

  // Set up test tokens
  // 1. Valid Customer in Household A (hh-sharma-family)
  const tokenCustA = jwt.sign(
    { sub: 'user-demo-1', id: 'user-demo-1', role: 'CUSTOMER', householdId: 'hh-sharma-family', email: 'rahul.sharma@gmail.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 2. Valid Customer in Household B (hh-patel-family)
  const tokenCustB = jwt.sign(
    { sub: 'user-demo-patel', id: 'user-demo-patel', role: 'CUSTOMER', householdId: 'hh-patel-family', email: 'anand.patel@gmail.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 3. Retailer token
  const dbRetailer = await prisma.user.findFirst({ where: { role: 'RETAILER' } });
  const tokenRetailer = jwt.sign(
    { sub: dbRetailer.id, id: dbRetailer.id, role: 'RETAILER', retailerId: 'ret-blinkit', email: dbRetailer.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 4. Admin token
  const dbAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const tokenAdmin = jwt.sign(
    { sub: dbAdmin.id, id: dbAdmin.id, role: 'ADMIN', email: dbAdmin.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 5. Expired token
  const tokenExpired = jwt.sign(
    { sub: 'user-demo-1', id: 'user-demo-1', role: 'CUSTOMER', email: 'rahul.sharma@gmail.com' },
    JWT_SECRET,
    { expiresIn: -10 }
  );

  // 6. Suspended user token
  // Let's create or mark a test user as SUSPENDED in DB
  let suspendedUser = await prisma.user.findFirst({ where: { status: 'SUSPENDED' } });
  if (!suspendedUser) {
    suspendedUser = await prisma.user.create({
      data: {
        id: 'test-suspended-p625',
        email: 'suspended.test@rasoiiq.in',
        passwordHash: 'dummy_hash',
        fullName: 'Suspended Test User',
        role: 'CUSTOMER',
        status: 'SUSPENDED'
      }
    });
  }
  const tokenSuspended = jwt.sign(
    { sub: suspendedUser.id, id: suspendedUser.id, role: 'CUSTOMER', email: suspendedUser.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Find a valid test order for Household A with items
  let orderHhA = await prisma.order.findFirst({
    where: { userId: 'user-demo-1', items: { some: {} } },
    include: { items: true }
  });
  if (!orderHhA) {
    orderHhA = await prisma.order.create({
      data: {
        userId: 'user-demo-1',
        householdId: 'hh-sharma-family',
        retailerName: 'Blinkit',
        status: 'ORDER_CONFIRMED',
        totalAmountInr: 450,
        deliveryFeeInr: 30,
        deliveryAddress: 'Test Address Ahmedabad',
        isDemoOrder: true,
        items: {
          create: [{ productName: 'Aashirvaad Atta', packSize: '5 kg', quantityPacks: 1, unitPriceInr: 250 }]
        }
      },
      include: { items: true }
    });
  }

  // -------------------------------------------------------------
  // WORKSTREAM A: REORDER AUTHORIZATION & IDEMPOTENCY
  // -------------------------------------------------------------
  console.log('--- WORKSTREAM A: REORDER AUTHORIZATION & IDEMPOTENCY ---');

  // Test 1: Valid household member, first reorder
  const testKey1 = `p625-reorder-${Date.now()}`;
  const res1 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenCustA}`,
      'idempotency-key': testKey1
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  if (res1.status !== 200) console.log('DEBUG res1 failed:', res1.status, JSON.stringify(res1.body));
  assert(res1.status === 200 && res1.body?.success === true, '1. Valid household member, first reorder succeeds (200)');

  // Test 2: Valid member, repeated identical request (idempotent replay)
  const res2 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenCustA}`,
      'idempotency-key': testKey1
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  assert(res2.status === 200 && res2.body?.isIdempotentReplay === true, '2. Valid member, repeated identical request returns cached replay (200, isIdempotentReplay: true)');

  // Test 3: Same key, changed payload -> 409 Conflict
  const res3 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenCustA}`,
      'idempotency-key': testKey1
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family', replaceCart: true })
  });
  assert(res3.status === 409, '3. Same idempotency key with conflicting payload rejected (409 Conflict)');

  // Test 4: Non-member, fresh key -> 403 Forbidden
  const testKey2 = `p625-reorder-${Date.now()}-2`;
  const res4 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenCustB}`, // Customer B belongs to Patel family
      'idempotency-key': testKey2
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  assert(res4.status === 403, '4. Non-member requesting Household A reorder rejected (403 Forbidden)');

  // Test 5: Non-member attempting to retrieve previously successful cached key -> 403 Forbidden
  const res5 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenCustB}`, // Customer B sends Customer A's cached key!
      'idempotency-key': testKey1
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  assert(res5.status === 403, '5. Non-member presenting previously successful cached key is blocked before cache return (403 Forbidden)');

  // Test 6: Household A member attempting to reorder an order belonging to Household B -> 403 Forbidden
  let orderHhB = await prisma.order.findFirst({
    where: { userId: 'user-demo-patel' }
  });
  if (orderHhB) {
    const res6 = await request('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${tokenCustA}`, // Customer A attempts to reorder Customer B's order
        'idempotency-key': `p625-hijack-${Date.now()}`
      },
      body: JSON.stringify({ orderId: orderHhB.id, householdId: 'hh-sharma-family' })
    });
    assert(res6.status === 403, '6. Cross-household order reorder attempt blocked (403 Forbidden)');
  }

  // Test 7: Unauthenticated reorder attempt -> 401 Unauthorized
  const res7 = await request('/grocery/cart/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  assert(res7.status === 401, '7. Unauthenticated reorder request rejected (401 Unauthorized)');

  // Test 8: Retailer role attempting household reorder -> 403 Forbidden
  const res8 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenRetailer}`,
      'idempotency-key': `p625-ret-${Date.now()}`
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  assert(res8.status === 403, '8. Retailer attempting household reorder rejected (403 Forbidden)');

  // Test 9: Concurrent burst reorder (3 simultaneous requests) -> exactly 1 mutation, others cached replays
  const burstKey = `p625-burst-${Date.now()}`;
  const burstPromises = [1, 2, 3].map(() =>
    request('/grocery/cart/reorder', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${tokenCustA}`,
        'idempotency-key': burstKey
      },
      body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
    })
  );
  const burstResults = await Promise.all(burstPromises);
  const all200 = burstResults.every(r => r.status === 200);
  const replays = burstResults.filter(r => r.body?.isIdempotentReplay === true);
  assert(all200 && replays.length >= 2, '9. Burst concurrency: 3 simultaneous requests yield 1 mutation + 2 cached replays (all 200)');

  // Test 10: Invalid idempotency key format (e.g. invalid characters or empty)
  const res10 = await request('/grocery/cart/reorder', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${tokenCustA}`,
      'idempotency-key': 'invalid key with spaces and <script>'
    },
    body: JSON.stringify({ orderId: orderHhA.id, householdId: 'hh-sharma-family' })
  });
  assert(res10.status === 400, '10. Invalid idempotency key format rejected (400 Bad Request)');

  // -------------------------------------------------------------
  // WORKSTREAM B: INTERNAL WORKER AUTHENTICATION
  // -------------------------------------------------------------
  console.log('\n--- WORKSTREAM B: INTERNAL WORKER AUTHENTICATION ---');

  // Create an order for lifecycle tests
  const testOrder = await prisma.order.create({
    data: {
      userId: 'user-demo-1',
      householdId: 'hh-sharma-family',
      retailerName: 'Blinkit',
      status: 'ORDER_CONFIRMED',
      totalAmountInr: 399,
      deliveryFeeInr: 30,
      deliveryAddress: 'Bapunagar Ahmedabad',
      isDemoOrder: true,
      items: {
        create: [{ productName: 'Amul Butter', packSize: '500g', quantityPacks: 1, unitPriceInr: 275 }]
      }
    }
  });

  // Test 11: Missing worker secret (public request with no credentials) -> 403
  const res11 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  assert(res11.status === 403, '11. Missing worker secret and auth rejected (403 Forbidden)');

  // Test 12: Empty worker secret ("") -> 403
  const res12 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': '' },
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  assert(res12.status === 403, '12. Empty worker key rejected (403 Forbidden)');

  // Test 13: Whitespace-only worker secret ("   ") -> 403
  const res13 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': '   ' },
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  assert(res13.status === 403, '13. Whitespace-only worker key rejected (403 Forbidden)');

  // Test 14: Invalid worker secret of different length (e.g. 10 chars vs 64 chars) -> 403
  const res14 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': 'short_key' },
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  assert(res14.status === 403, '14. Invalid secret of different length rejected (403 Forbidden)');

  // Test 15: Invalid worker secret of IDENTICAL length (64 chars differing by 1 char -> exercises timingSafeEqual!) -> 403
  const sameLengthTampered = WORKER_SECRET.slice(0, -1) + (WORKER_SECRET.slice(-1) === 'a' ? 'b' : 'a');
  const res15 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': sameLengthTampered },
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  assert(res15.status === 403, '15. Invalid secret of identical length rejected via timingSafeEqual (403 Forbidden)');

  // Test 16: Valid worker secret from authorized server-side worker -> 200 OK
  const res16 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': WORKER_SECRET },
    body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Dark store started packing items' })
  });
  assert(res16.status === 200 && res16.body?.order?.status === 'HUB_PACKING', '16. Valid 64-char worker secret transitions status to HUB_PACKING (200 OK)');

  // Test 17: Customer token plus worker header -> 403 Privilege escalation blocked
  const res17 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'authorization': `Bearer ${tokenCustA}`,
      'x-internal-worker-key': WORKER_SECRET
    },
    body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' })
  });
  assert(res17.status === 403, '17. Customer token + worker header blocked for privilege escalation (403 Forbidden)');

  // Test 18: Retailer token plus worker header -> 403 Privilege escalation blocked
  const res18 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'authorization': `Bearer ${tokenRetailer}`,
      'x-internal-worker-key': WORKER_SECRET
    },
    body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' })
  });
  assert(res18.status === 403, '18. Retailer token + worker header blocked for privilege escalation (403 Forbidden)');

  // Test 19: Admin token plus worker header -> 200 OK, ADMIN identity preserved (no mutation to worker!)
  const res19 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'authorization': `Bearer ${tokenAdmin}`,
      'x-internal-worker-key': WORKER_SECRET
    },
    body: JSON.stringify({ status: 'OUT_FOR_DELIVERY', statusReason: 'Admin dispatched rider' })
  });
  // Check that changedBy / updatedBy records admin, not system-worker
  const latestHistory = await prisma.orderStatusHistory.findFirst({
    where: { orderId: testOrder.id, toStatus: 'OUT_FOR_DELIVERY' }
  });
  assert(res19.status === 200 && latestHistory?.changedBy === dbAdmin.email, `19. Admin token + worker header preserves ADMIN identity in audit history (200 OK, changedBy: ${dbAdmin.email})`);

  // Test 20: Expired JWT plus worker header -> 401 Unauthorized
  const res20 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'authorization': `Bearer ${tokenExpired}`,
      'x-internal-worker-key': WORKER_SECRET
    },
    body: JSON.stringify({ status: 'DELIVERED' })
  });
  assert(res20.status === 401, '20. Expired JWT + worker header rejected (401 Unauthorized)');

  // Test 21: Suspended account plus worker header -> 401 Unauthorized
  const res21 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: {
      'authorization': `Bearer ${tokenSuspended}`,
      'x-internal-worker-key': WORKER_SECRET
    },
    body: JSON.stringify({ status: 'DELIVERED' })
  });
  assert(res21.status === 401, '21. Suspended account + worker header rejected (401 Unauthorized)');

  // Test 22: Worker credential absent from frontend build output
  const nextStaticDir = path.resolve('apps/customer-web/.next/static');
  let secretFoundInClient = false;
  if (fs.existsSync(nextStaticDir)) {
    const files = fs.readdirSync(nextStaticDir, { recursive: true });
    for (const f of files) {
      if (typeof f === 'string' && f.endsWith('.js')) {
        const fullPath = path.join(nextStaticDir, f);
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          if (content.includes(WORKER_SECRET)) {
            secretFoundInClient = true;
            break;
          }
        } catch {}
      }
    }
  }
  assert(!secretFoundInClient, '22. Worker secret is completely absent from Next.js client bundles');

  // -------------------------------------------------------------
  // WORKSTREAM C: ORDER LIFECYCLE & AUDIT RETENTION
  // -------------------------------------------------------------
  console.log('\n--- WORKSTREAM C: ORDER LIFECYCLE CONCURRENCY & AUDIT RETENTION ---');

  // Test 23: Advance testOrder to DELIVERED via worker
  const res23 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': WORKER_SECRET },
    body: JSON.stringify({ status: 'DELIVERED', statusReason: 'Package delivered to doorstep' })
  });
  assert(res23.status === 200 && res23.body?.order?.status === 'DELIVERED', '23. Order advanced to terminal state DELIVERED (200 OK)');

  // Test 24: Attempt invalid transition from terminal state DELIVERED -> HUB_PACKING
  const res24 = await request(`/marketplace/orders/${testOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': WORKER_SECRET },
    body: JSON.stringify({ status: 'HUB_PACKING' })
  });
  assert(res24.status === 400, '24. Transition from terminal status DELIVERED rejected (400 Bad Request)');

  // Test 25: Audit retention - Attempt to delete order with history rows -> Rejected by ON DELETE RESTRICT
  let deleteBlocked = false;
  try {
    await prisma.order.delete({ where: { id: testOrder.id } });
  } catch (err) {
    if (
      err.message.includes('Foreign key constraint') ||
      err.message.includes('violates foreign key constraint') ||
      err.message.includes('violates RESTRICT') ||
      err.message.includes('23001') ||
      err.code === 'P2003'
    ) {
      deleteBlocked = true;
    }
  }
  assert(deleteBlocked, '25. Order deletion blocked by ON DELETE RESTRICT foreign key constraint (audit records preserved)');

  // Test 26: Concurrent transition race safety with SELECT FOR UPDATE
  const raceOrder = await prisma.order.create({
    data: {
      userId: 'user-demo-1',
      householdId: 'hh-sharma-family',
      retailerName: 'Blinkit',
      status: 'ORDER_CONFIRMED',
      totalAmountInr: 299,
      deliveryFeeInr: 25,
      deliveryAddress: 'Navrangpura Ahmedabad',
      isDemoOrder: true,
      items: {
        create: [{ productName: 'Milk 1L', packSize: '1L', quantityPacks: 2, unitPriceInr: 66 }]
      }
    }
  });

  const p1 = request(`/marketplace/orders/${raceOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': WORKER_SECRET },
    body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Worker 1 packing' })
  });
  const p2 = request(`/marketplace/orders/${raceOrder.id}/status`, {
    method: 'PATCH',
    headers: { 'x-internal-worker-key': WORKER_SECRET },
    body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Worker 2 packing' })
  });
  const [race1, race2] = await Promise.all([p1, p2]);
  const raceHistories = await prisma.orderStatusHistory.findMany({
    where: { orderId: raceOrder.id, toStatus: 'HUB_PACKING' }
  });
  assert(raceHistories.length === 1, '26. Concurrent status transitions serialized via SELECT ... FOR UPDATE (exactly 1 history row created)');

  console.log('\n=======================================================');
  console.log(`Phase 6.2.5 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('=======================================================');

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
