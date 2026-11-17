import 'dotenv/config';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
const BASE_URL = 'http://localhost:4000/api';
const WORKER_SECRET = process.env.INTERNAL_WORKER_SECRET;

const prisma = new PrismaClient();

console.log('========================================================================');
console.log('🛡️  RasoiIQ Phase 6.2.4 Final Pilot Gate & Security Verification Suite');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    failCount++;
  }
}

async function loginUser(email, password = '') {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  }
  return data.token || data.accessToken;
}

async function runGateSuite() {
  const adminToken = await loginUser('admin@rasoiiq.in', 'RasoiAdminSecretPassphrase@2026');
  const customerToken = await loginUser('demo@rasoiiq.in', '');
  
  const retRes = await fetch(`${BASE_URL}/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'RETAILER', retailerId: 'ret-blinkit', email: 'partner@blinkit.com' })
  });
  const retData = await retRes.json();
  const retailerToken = retData.token;

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@rasoiiq.in' } });
  const customerUser = await prisma.user.findFirst({ where: { email: 'demo@rasoiiq.in' } });

  // Seed a fresh test order for transition tests
  async function createTestOrder(initialStatus = 'ORDER_CONFIRMED') {
    const orderId = `ord-gate-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: customerUser.id,
        retailerName: 'Blinkit',
        status: initialStatus,
        totalAmountInr: 450,
        deliveryFeeInr: 25,
        deliveryAddress: 'Flat 101, Test Residency, Bengaluru 560103',
        isDemoOrder: true,
        statusReason: 'Gate test order creation',
        updatedBy: customerUser.email,
        items: {
          create: [
            {
              productName: 'Mother Dairy Paneer 200g',
              brand: 'Mother Dairy',
              packSize: '200g',
              quantityPacks: 1,
              unitPriceInr: 95
            }
          ]
        },
        statusHistory: {
          create: {
            fromStatus: 'START',
            toStatus: initialStatus,
            reason: 'Order placed by test suite',
            changedBy: customerUser.email
          }
        }
      }
    });
    return order;
  }

  // ---------------------------------------------------------------------------
  // Workstream A3: Required 12 Security Tests
  // ---------------------------------------------------------------------------
  console.log('\n--- Part 1: Workstream A3 Security Gate Tests (12 Scenarios) ---');

  await test('1. Worker secret missing: fails closed with 403 Forbidden', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await test('2. Worker secret empty: fails closed with 403 Forbidden', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-worker-key': ''
      },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await test('3. Worker secret incorrect: constant-time rejection with 403 Forbidden', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-worker-key': 'incorrect-worker-secret-attempt-12345'
      },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await test('4. Worker secret valid: authorized advance to HUB_PACKING (200 OK)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-worker-key': WORKER_SECRET
      },
      body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Internal worker began hub packing' })
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.order.status, 'HUB_PACKING');
    assert.strictEqual(data.order.updatedBy, 'system-worker');
  });

  await test('5. Legacy simulation header supplied: ignored and rejected (403 Forbidden)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-simulation-worker': 'rasoi-internal-sim-worker-2026'
      },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await test('6. Legacy query parameter supplied: ignored and rejected (403 Forbidden)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status?simulationWorker=true`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await test('7. Customer JWT plus worker credential: privilege escalation strictly blocked (403)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'x-internal-worker-key': WORKER_SECRET
      },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    assert(data.message.includes('Privilege escalation blocked'), 'Must cite privilege escalation block');
  });

  await test('8. Retailer JWT plus worker credential: privilege escalation strictly blocked (403)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${retailerToken}`,
        'x-internal-worker-key': WORKER_SECRET
      },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
    const data = await res.json();
    assert(data.message.includes('Privilege escalation blocked'), 'Must cite privilege escalation block');
  });

  await test('9. Admin JWT without worker credential: acts legitimately as ADMIN (200 OK)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Admin manual status advance' })
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.order.updatedBy, adminUser.email, 'Audit record must retain admin email');
  });

  await test('10. Admin JWT combined with worker credential: preserves ADMIN identity (200 OK)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'x-internal-worker-key': WORKER_SECRET
      },
      body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Admin advancing with worker key' })
    });
    assert.strictEqual(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.order.updatedBy, adminUser.email, 'Admin identity must NOT be mutated to system-worker');
  });

  await test('11. Unauthenticated external request: rejected with 403 Forbidden', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELIVERED' })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  await test('12. Valid worker attempting illegal state transition: blocked by state machine (400)', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    // Attempt illegal skip: ORDER_CONFIRMED -> DELIVERED
    const res = await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-worker-key': WORKER_SECRET
      },
      body: JSON.stringify({ status: 'DELIVERED', statusReason: 'Worker attempting illegal jump' })
    });
    assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
    const data = await res.json();
    assert(data.message.includes('Illegal state transition'), 'Must enforce state machine boundaries');
  });

  // ---------------------------------------------------------------------------
  // Workstream C3: Concurrent Order Transitions
  // ---------------------------------------------------------------------------
  console.log('\n--- Part 2: Workstream C3 Concurrent Order Transition Verification ---');

  await test('13. Concurrent identical transition: only one transition recorded, duplicate is idempotent', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    
    // Fire 2 concurrent requests to advance ORDER_CONFIRMED -> HUB_PACKING
    const p1 = fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-internal-worker-key': WORKER_SECRET },
      body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Concurrent transition 1' })
    });
    const p2 = fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-internal-worker-key': WORKER_SECRET },
      body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Concurrent transition 2' })
    });

    const [res1, res2] = await Promise.all([p1, p2]);
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res2.status, 200);

    // Inspect database rows: exactly 2 history records should exist (START, HUB_PACKING), NO duplicate
    const historyRows = await prisma.orderStatusHistory.findMany({
      where: { orderId: order.id }
    });
    const hubPackingRows = historyRows.filter(h => h.toStatus === 'HUB_PACKING');
    assert.strictEqual(hubPackingRows.length, 1, 'Exactly one HUB_PACKING history row must be created');
  });

  await test('14. Concurrent conflicting transition: second request rejected cleanly with conflict/validation error', async () => {
    const order = await createTestOrder('ORDER_CONFIRMED');
    
    // Advance to HUB_PACKING first
    await fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-internal-worker-key': WORKER_SECRET },
      body: JSON.stringify({ status: 'HUB_PACKING' })
    });

    // Fire customer cancel (only allowed in ORDER_CONFIRMED) concurrently with worker advancing to OUT_FOR_DELIVERY
    const pWorker = fetch(`${BASE_URL}/marketplace/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-internal-worker-key': WORKER_SECRET },
      body: JSON.stringify({ status: 'OUT_FOR_DELIVERY' })
    });
    const pCustCancel = fetch(`${BASE_URL}/marketplace/orders/${order.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${customerToken}` },
      body: JSON.stringify({ reason: 'Customer wanting to cancel' })
    });

    const [resWorker, resCustCancel] = await Promise.all([pWorker, pCustCancel]);
    assert.strictEqual(resWorker.status, 200, 'Worker advance succeeds');
    assert.strictEqual(resCustCancel.status, 400, 'Customer cancel is strictly blocked once packing/dispatched');
  });

  // ---------------------------------------------------------------------------
  // Workstream D: Reorder Idempotency & Mutex Verification
  // ---------------------------------------------------------------------------
  console.log('\n--- Part 3: Workstream D Reorder Mutex & Cache Under Lock ---');

  await test('15. 5 identical simultaneous reorders resolve cleanly with 1 creation and 4 idempotent replays', async () => {
    const seedOrder = await createTestOrder('ORDER_CONFIRMED');
    const idemKey = `idem-gate-${Date.now()}`;

    const requests = Array.from({ length: 5 }).map(() =>
      fetch(`${BASE_URL}/grocery/cart/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
          'idempotency-key': idemKey
        },
        body: JSON.stringify({
          orderId: seedOrder.id,
          replaceCart: true
        })
      })
    );

    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status);
    assert(statuses.every(s => s === 201), `All requests must succeed with 201, got ${statuses}`);

    const bodies = await Promise.all(responses.map(r => r.json()));
    const replays = bodies.filter(b => b.isIdempotentReplay === true);
    assert.strictEqual(replays.length, 4, 'Exactly 4 of 5 concurrent requests must be idempotent replays');
  });

  await test('16. Reorder with conflicting payload under same key rejected with HTTP 409 Conflict', async () => {
    const seedOrder = await createTestOrder('ORDER_CONFIRMED');
    const idemKey = `idem-conflict-${Date.now()}`;

    // Request 1: original payload
    const res1 = await fetch(`${BASE_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'idempotency-key': idemKey
      },
      body: JSON.stringify({ orderId: seedOrder.id, replaceCart: true })
    });
    assert.strictEqual(res1.status, 201);

    // Request 2: conflicting payload (different replaceCart / order)
    const res2 = await fetch(`${BASE_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`,
        'idempotency-key': idemKey
      },
      body: JSON.stringify({ orderId: seedOrder.id, replaceCart: false })
    });
    assert.strictEqual(res2.status, 409, `Expected 409 Conflict, got ${res2.status}`);
    const data = await res2.json();
    assert.strictEqual(data.error, 'IDEMPOTENCY_CONFLICT');
  });

  await test('17. Customer requesting unauthorized household ID is blocked with 403 Forbidden', async () => {
    const seedOrder = await createTestOrder('ORDER_CONFIRMED');
    const res = await fetch(`${BASE_URL}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        orderId: seedOrder.id,
        householdId: 'hh-patel-family', // Customer belongs to sharma family
        replaceCart: true
      })
    });
    assert.strictEqual(res.status, 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  console.log('\n========================================================================');
  console.log(`📊 Phase 6.2.4 Gate Verification Results: ${passCount} PASSED / ${failCount} FAILED (${passCount + failCount} total)`);
  console.log('========================================================================\n');

  await prisma.$disconnect();
  if (failCount > 0) process.exit(1);
}

runGateSuite().catch((err) => {
  console.error('Fatal gate suite error:', err);
  process.exit(1);
});
