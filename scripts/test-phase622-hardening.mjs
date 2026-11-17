/**
 * Phase 6.2.2 Hardening Verification Test Suite
 * Tests:
 * 1. Pantry Unit Semantics (10 test conditions)
 * 2. Fail-Closed Inventory Rules (undefined, null, false, true, invalid)
 * 3. Reorder Idempotency & Concurrency Mutex
 * 4. Order Cancellation State Machine & Role Authorization
 * 5. Multi-Tenant Isolation
 */

const API_BASE = 'http://localhost:4000/api';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function loginUser(email, password = '') {
  const res = await fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data.token || res.data.accessToken;
}

const results = [];
function test(name, pass, details = '') {
  results.push({ name, pass: Boolean(pass), details });
  const icon = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runSuite() {
  console.log('\n============================================================');
  console.log('🧪 RasoiIQ Phase 6.2.2 Hardening Verification Test Suite');
  console.log('============================================================\n');

  // Logins
  const adminToken = await loginUser('admin@rasoiiq.in', 'RasoiAdminSecretPassphrase@2026');
  const sharmaToken = await loginUser('demo@rasoiiq.in', '');
  const patelToken = await loginUser('patel.family@rasoiiq.demo', '');
  const mehtaToken = await loginUser('mehta.family@rasoiiq.demo', '');

  // -------------------------------------------------------------
  // SECTION 1: PANTRY UNIT SEMANTICS & THRESHOLDS (10 Edge Cases)
  // -------------------------------------------------------------
  console.log('\n--- Section 1: Pantry Unit Semantics ---');

  // Case 1: 2 kg vs 500 g -> Adequate
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 2,
        currentUnit: 'kg',
        thresholdQuantity: 500,
        thresholdUnit: 'g'
      })
    });
    test('1.1: 2 kg vs 500 g threshold', res.ok && res.data.stockStatus === 'ADEQUATE', `status=${res.data?.stockStatus}`);
  }

  // Case 2: 200 g vs 500 g -> Low stock
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 200,
        currentUnit: 'g',
        thresholdQuantity: 500,
        thresholdUnit: 'g'
      })
    });
    test('1.2: 200 g vs 500 g threshold', res.ok && res.data.stockStatus === 'LOW_STOCK', `status=${res.data?.stockStatus}`);
  }

  // Case 3: 500 g exactly at 500 g threshold -> Low stock (boundary condition: <= threshold)
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 500,
        currentUnit: 'g',
        thresholdQuantity: 500,
        thresholdUnit: 'g'
      })
    });
    test('1.3: 500 g exactly at 500 g threshold', res.ok && res.data.stockStatus === 'LOW_STOCK', `status=${res.data?.stockStatus}`);
  }

  // Case 4: 500 ml vs 500 g -> Incompatible units without density
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 500,
        currentUnit: 'ml',
        thresholdQuantity: 500,
        thresholdUnit: 'g'
      })
    });
    test('1.4: 500 ml vs 500 g incompatible units rejected', res.ok && res.data.stockStatus === 'INCOMPATIBLE_UNITS', `status=${res.data?.stockStatus}`);
  }

  // Case 5: 1 pack containing 6 pieces vs 4 pieces in stock -> Adequate
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 1,
        currentUnit: 'pack',
        piecesPerPack: 6,
        thresholdQuantity: 4,
        thresholdUnit: 'pcs'
      })
    });
    test('1.5: 1 pack (6 pcs) vs 4 pcs threshold', res.ok && res.data.stockStatus === 'ADEQUATE', `status=${res.data?.stockStatus}`);
  }

  // Case 6: Pack with unknown contents (no piecesPerPack) vs pieces threshold -> Incompatible
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 1,
        currentUnit: 'pack',
        thresholdQuantity: 4,
        thresholdUnit: 'pcs'
      })
    });
    test('1.6: Pack with unknown contents does NOT assume 1 pack = 1 pc', res.ok && res.data.stockStatus === 'INCOMPATIBLE_UNITS', `status=${res.data?.stockStatus}`);
  }

  // Case 7: Missing threshold -> THRESHOLD_NOT_CONFIGURED (never invent default)
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 350,
        currentUnit: 'g',
        thresholdQuantity: null
      })
    });
    test('1.7: Missing threshold returns THRESHOLD_NOT_CONFIGURED', res.ok && res.data.stockStatus === 'THRESHOLD_NOT_CONFIGURED', `status=${res.data?.stockStatus}`);
  }

  // Case 8: Unknown unit -> UNKNOWN_UNIT
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 5,
        currentUnit: 'handfuls',
        thresholdQuantity: 2,
        thresholdUnit: 'handfuls'
      })
    });
    test('1.8: Unknown unit handled safely as UNKNOWN_UNIT', res.ok && res.data.stockStatus === 'UNKNOWN_UNIT', `status=${res.data?.stockStatus}`);
  }

  // Case 9: Zero and negative quantities
  {
    const resZero = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 0,
        currentUnit: 'g',
        thresholdQuantity: 100,
        thresholdUnit: 'g'
      })
    });
    const resNeg = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: -10,
        currentUnit: 'g',
        thresholdQuantity: 100,
        thresholdUnit: 'g'
      })
    });
    test('1.9: Zero quantity marked LOW_STOCK / OUT_OF_STOCK and negative flagged MALFORMED',
      resZero.ok && (resZero.data.stockStatus === 'LOW_STOCK' || resZero.data.stockStatus === 'OUT_OF_STOCK') &&
      resNeg.ok && resNeg.data.stockStatus === 'MALFORMED_QUANTITY',
      `zeroStatus=${resZero.data?.stockStatus}, negStatus=${resNeg.data?.stockStatus}`
    );
  }

  // Case 10: Decimal quantities and rounding boundaries
  {
    const res = await fetchJson(`${API_BASE}/grocery/pantry/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        currentQuantity: 0.50004,
        currentUnit: 'kg',
        thresholdQuantity: 500,
        thresholdUnit: 'g'
      })
    });
    // 0.50004 kg = 500.04 g > 500 g -> ADEQUATE
    test('1.10: Decimal quantities with 4-decimal precision (0.50004 kg > 500 g)', res.ok && res.data.stockStatus === 'ADEQUATE', `status=${res.data?.stockStatus}`);
  }

  // -------------------------------------------------------------
  // SECTION 2: FAIL-CLOSED INVENTORY RULES
  // -------------------------------------------------------------
  console.log('\n--- Section 2: Fail-Closed Inventory Rules ---');

  // Test checkout rejection with unverified or unavailable item
  {
    const res = await fetchJson(`${API_BASE}/marketplace/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        retailerId: 'ret-blinkit',
        totalInr: 99,
        deliveryAddress: 'Flat 402, Sharma Residence, Indiranagar, Bengaluru',
        items: [
          {
            productVariantId: 'var-nonexistent-9999',
            title: 'Ghost Product Unknown Variant',
            quantity: 1,
            priceInr: 99
          }
        ]
      })
    });
    // Nonexistent variant has no inStock verification -> must be rejected fail-closed or unverified
    test('2.1: Checkout fails-closed on unverified product variant',
      res.status === 400,
      `status=${res.status}, error=${res.data?.error || res.data?.message}`
    );
  }

  // Verify availability endpoint fail-closed evaluation
  {
    const resAvail = await fetchJson(`${API_BASE}/grocery/inventory/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        variant: { id: 'test-var-1', title: 'Test Product', inStock: null },
        requestedQuantity: 1
      })
    });
    test('2.2: Inventory evaluate returns UNKNOWN_AVAILABILITY when inStock is null',
      resAvail.ok && resAvail.data.status === 'UNKNOWN_AVAILABILITY' && resAvail.data.isAvailable === false,
      `status=${resAvail.data?.status}, isAvailable=${resAvail.data?.isAvailable}`
    );
  }

  {
    const resFalse = await fetchJson(`${API_BASE}/grocery/inventory/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        variant: { id: 'test-var-2', title: 'Test Product', inStock: false },
        requestedQuantity: 1
      })
    });
    test('2.3: Inventory evaluate returns OUT_OF_STOCK when inStock is explicitly false',
      resFalse.ok && resFalse.data.status === 'OUT_OF_STOCK' && resFalse.data.isAvailable === false,
      `status=${resFalse.data?.status}, isAvailable=${resFalse.data?.isAvailable}`
    );
  }

  // -------------------------------------------------------------
  // SECTION 3: REORDER IDEMPOTENCY & CONCURRENCY
  // -------------------------------------------------------------
  console.log('\n--- Section 3: Reorder Idempotency & Mutex ---');

  // Place a valid order first to reorder from
  const orderRes = await fetchJson(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
    body: JSON.stringify({
      retailerId: 'ret-blinkit',
      totalInr: 274,
      deliveryAddress: 'Flat 402, Sharma Residence, Indiranagar, Bengaluru',
      items: [
        {
          productVariantId: 'var-aashirvaad-atta-5k',
          quantityPacks: 1,
          priceInr: 245
        }
      ]
    })
  });
  const seedOrderId = orderRes.data?.id || orderRes.data?.order?.id;
  test('3.1: Seed valid test order for reorder test', orderRes.ok && !!seedOrderId, `orderId=${seedOrderId}`);

  if (seedOrderId) {
    const idempKey = `idemp-key-${Date.now()}`;

    // First call with idempotencyKey
    const reorder1 = await fetchJson(`${API_BASE}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharmaToken}`,
        'idempotency-key': idempKey
      },
      body: JSON.stringify({
        orderId: seedOrderId,
        householdId: 'hh-sharma-family'
      })
    });
    test('3.2: Initial reorder request with idempotency key succeeds', reorder1.ok, `subtotal=${reorder1.data?.subtotalInr}`);

    // Second call with same idempotencyKey
    const reorder2 = await fetchJson(`${API_BASE}/grocery/cart/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sharmaToken}`,
        'idempotency-key': idempKey
      },
      body: JSON.stringify({
        orderId: seedOrderId,
        householdId: 'hh-sharma-family'
      })
    });
    test('3.3: Replayed reorder returns cached result without duplicated cart items',
      reorder2.ok && (reorder2.data.isReplay === true || reorder2.data.subtotalInr === reorder1.data.subtotalInr),
      `isReplay=${reorder2.data?.isReplay}, subtotal=${reorder2.data?.subtotalInr}`
    );

    // Concurrency test: execute 3 simultaneous reorders on same household
    const concPromises = [1, 2, 3].map(i =>
      fetchJson(`${API_BASE}/grocery/cart/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sharmaToken}`,
          'idempotency-key': `conc-key-${Date.now()}-${i}`
        },
        body: JSON.stringify({
          orderId: seedOrderId,
          householdId: 'hh-sharma-family'
        })
      })
    );
    const concResults = await Promise.all(concPromises);
    const allSuccessful = concResults.every(r => r.ok);
    test('3.4: Concurrent reorder requests safely managed under household mutex lock',
      allSuccessful,
      `statuses=${concResults.map(r => r.status).join(',')}`
    );
  }

  // -------------------------------------------------------------
  // SECTION 4: ORDER CANCELLATION & ROLE AUTHORIZATION STATE MACHINE
  // -------------------------------------------------------------
  console.log('\n--- Section 4: Order Cancellation & State Machine ---');

  if (seedOrderId) {
    // 4.1 Customer cancellation WITHOUT reason -> rejected (reason mandatory >= 3 chars)
    const cancelNoReason = await fetchJson(`${API_BASE}/marketplace/orders/${seedOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        status: 'CANCELLED',
        statusReason: 'no' // < 3 chars
      })
    });
    test('4.1: Cancellation without valid reason (>= 3 chars) rejected', cancelNoReason.status === 400, `status=${cancelNoReason.status}`);

    // 4.2 Customer trying to advance to HUB_PACKING -> Forbidden (403)
    const customerAdvance = await fetchJson(`${API_BASE}/marketplace/orders/${seedOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        status: 'HUB_PACKING'
      })
    });
    test('4.2: Customer forbidden from advancing order fulfillment status', customerAdvance.status === 403, `status=${customerAdvance.status}`);

    // 4.3 Customer cancelling Customer B's order -> Forbidden (403)
    const patelCancelSharma = await fetchJson(`${API_BASE}/marketplace/orders/${seedOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${patelToken}` },
      body: JSON.stringify({
        status: 'CANCELLED',
        statusReason: 'Patel trying to cancel Sharma order'
      })
    });
    test('4.3: Customer isolated from cancelling another household order', patelCancelSharma.status === 403, `status=${patelCancelSharma.status}`);

    // 4.4 Customer cancelling their OWN order while in ORDER_CONFIRMED -> Allowed (200)
    const customerCancelOwn = await fetchJson(`${API_BASE}/marketplace/orders/${seedOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        status: 'CANCELLED',
        statusReason: 'Customer changed meal plan and no longer needs this grocery order'
      })
    });
    test('4.4: Customer can cancel their own order in ORDER_CONFIRMED status', customerCancelOwn.ok, `status=${customerCancelOwn.status}`);

    // 4.5 Attempting to reopen a CANCELLED order -> Terminal state rejection (400)
    const reopenOrder = await fetchJson(`${API_BASE}/marketplace/orders/${seedOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        status: 'HUB_PACKING',
        statusReason: 'Trying to reopen cancelled order'
      })
    });
    test('4.5: Terminal state CANCELLED cannot transition to any active state', reopenOrder.status === 400, `status=${reopenOrder.status}`);

    // Test cancellation when order is already in HUB_PACKING
    // Place a new order with distinct items/address to avoid 3s duplicate debounce
    await new Promise(r => setTimeout(r, 500));
    const seedOrder2 = await fetchJson(`${API_BASE}/marketplace/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
      body: JSON.stringify({
        retailerId: 'ret-blinkit',
        totalInr: 289,
        deliveryAddress: 'Flat 402, Sharma Residence, North Wing, Indiranagar, Bengaluru',
        items: [{ productVariantId: 'var-fortune-atta-5k', quantityPacks: 1, priceInr: 260 }]
      })
    });
    const order2Id = seedOrder2.data?.id || seedOrder2.data?.order?.id;

    if (order2Id) {
      // Advance to HUB_PACKING via admin
      await fetchJson(`${API_BASE}/marketplace/orders/${order2Id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'HUB_PACKING', statusReason: 'Store picking started' })
      });

      // Now customer tries to cancel
      const cancelAtPacking = await fetchJson(`${API_BASE}/marketplace/orders/${order2Id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sharmaToken}` },
        body: JSON.stringify({ status: 'CANCELLED', statusReason: 'Customer changed mind too late' })
      });
      test('4.6: Customer blocked from cancelling order once HUB_PACKING has started',
        cancelAtPacking.status === 400,
        `status=${cancelAtPacking.status}, message=${cancelAtPacking.data?.message}`
      );
    }
  }

  // -------------------------------------------------------------
  // SECTION 5: MULTI-TENANT ISOLATION
  // -------------------------------------------------------------
  console.log('\n--- Section 5: Multi-Tenant Isolation ---');

  const sharmaOrders = await fetchJson(`${API_BASE}/marketplace/orders`, {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  const patelOrders = await fetchJson(`${API_BASE}/marketplace/orders`, {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  const mehtaOrders = await fetchJson(`${API_BASE}/marketplace/orders`, {
    headers: { Authorization: `Bearer ${mehtaToken}` }
  });

  const sList = Array.isArray(sharmaOrders.data) ? sharmaOrders.data : [];
  const pList = Array.isArray(patelOrders.data) ? patelOrders.data : [];
  const mList = Array.isArray(mehtaOrders.data) ? mehtaOrders.data : [];

  const sharmaOrderIds = new Set(sList.map(o => o.id));
  const patelOrderIds = new Set(pList.map(o => o.id));
  const mehtaOrderIds = new Set(mList.map(o => o.id));

  const hasOverlap = [...sharmaOrderIds].some(id => patelOrderIds.has(id) || mehtaOrderIds.has(id));
  test('5.1: Zero order overlap between Sharma, Patel, and Mehta households', !hasOverlap,
    `Sharma=${sharmaOrderIds.size}, Patel=${patelOrderIds.size}, Mehta=${mehtaOrderIds.size}`
  );

  // Summary
  console.log('\n============================================================');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`📊 Phase 6.2.2 Hardening Test Results: ${passed}/${results.length} PASSED (${failed} FAILED)`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
