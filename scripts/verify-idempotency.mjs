// scripts/verify-idempotency.mjs
// Rigorous verification of sliding-window and Idempotency-Key behavior

const API_BASE = 'http://localhost:4000/api';

async function testIdempotency() {
  console.log('=====================================================');
  console.log('  RASOIIQ IDEMPOTENCY & DEDUPLICATION AUDIT          ');
  console.log('=====================================================');

  const key1 = `test-key-${Date.now()}`;
  const req1 = {
    retailerId: 'ret-blinkit',
    items: [{ productId: 'prod-1', title: 'Atta 5kg', priceInr: 250, quantityPacks: 1 }],
    totalInr: 250,
    deliveryAddress: 'Flat 101, Test Lane, Bengaluru'
  };

  // Test 1: First request with key1
  console.log('\n[Test 1] Initial submission with Idempotency-Key:', key1);
  const res1 = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': key1 },
    body: JSON.stringify(req1)
  });
  const order1 = await res1.json();
  console.log(`  Status: HTTP ${res1.status}, OrderNumber: ${order1.orderNumber}`);

  // Test 2: Same key repeated with same request
  console.log('\n[Test 2] Same key repeated with identical request');
  const res2 = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': key1 },
    body: JSON.stringify(req1)
  });
  const order2 = await res2.json();
  console.log(`  Status: HTTP ${res2.status}, OrderNumber: ${order2.orderNumber}`);
  console.log(`  Matches original order ID? ${order1.id === order2.id ? 'YES' : 'NO'}`);

  // Test 3: Same key reused with a DIFFERENT request payload
  console.log('\n[Test 3] Same key reused with a DIFFERENT request payload');
  const reqDiff = {
    retailerId: 'ret-zepto',
    items: [{ productId: 'prod-2', title: 'Milk 1L', priceInr: 60, quantityPacks: 2 }],
    totalInr: 120,
    deliveryAddress: 'Different Address, Mumbai'
  };
  const res3 = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': key1 },
    body: JSON.stringify(reqDiff)
  });
  const order3 = await res3.json();
  console.log(`  Status: HTTP ${res3.status}`);
  console.log(`  Did it reject parameter mismatch (409/422) or return old order?`);
  console.log(`  Returned retailer: ${order3.retailerId}, Total: ${order3.totalAmountInr}`);

  // Test 4: Different keys for different orders (wait for sliding window or use different retailer)
  console.log('\n[Test 4] Different key for different order');
  const key2 = `test-key-2-${Date.now()}`;
  const res4 = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': key2 },
    body: JSON.stringify(reqDiff)
  });
  const order4 = await res4.json();
  console.log(`  Status: HTTP ${res4.status}, OrderNumber: ${order4.orderNumber}`);
  console.log(`  Distinct order from order 1? ${order4.id !== order1.id ? 'YES' : 'NO'}`);

  // Test 5: Failed order (e.g. empty items) followed by retry
  console.log('\n[Test 5] Failed validation followed by retry with same key');
  const keyFail = `test-key-fail-${Date.now()}`;
  const badReq = { retailerId: 'ret-blinkit', items: [], totalInr: 0, deliveryAddress: 'Sample' };
  const resFail = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': keyFail },
    body: JSON.stringify(badReq)
  });
  console.log(`  Bad request status: HTTP ${resFail.status} (Expected 400)`);
  
  // Now retry with valid request using same keyFail
  const resRetry = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'idempotency-key': keyFail },
    body: JSON.stringify({ ...req1, totalInr: 251 })
  });
  const orderRetry = await resRetry.json();
  console.log(`  Retry with valid payload status: HTTP ${resRetry.status}, OrderNumber: ${orderRetry.orderNumber}`);
}

testIdempotency().catch(console.error);
