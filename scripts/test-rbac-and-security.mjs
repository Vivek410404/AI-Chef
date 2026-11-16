// scripts/test-rbac-and-security.mjs
// Comprehensive automated test suite for RBAC, Authorization, Multi-Tenant Isolation, Checkout Validation, Idempotency, and Client Secrets Isolation

import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';

const API_BASE = process.env.API_URL || 'http://localhost:4000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'rasoi_iq_default_dev_secret_2026';
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function testAuthAndRbac() {
  console.log('\n--- 1. Testing Multi-Role Authentication and RBAC ---');

  // A. Generate tokens for Customer, Retailer, and Admin
  const customerRes = await fetch(`${API_BASE}/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'CUSTOMER', userId: 'cust-demo-1', email: 'sharma.family@rasoiiq.demo' })
  });
  assert(customerRes.status === 201, 'Customer demo session generated successfully (HTTP 201)');
  const customerData = await customerRes.json();
  const customerToken = customerData.token;
  assert(customerToken && customerData.user.role === 'CUSTOMER', 'Customer token and role verified in response');

  const retailerRes = await fetch(`${API_BASE}/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'RETAILER',
      userId: 'ret-blinkit-manager',
      retailerId: 'ret-blinkit',
      email: 'manager@blinkit.demo'
    })
  });
  assert(retailerRes.status === 201, 'Retailer demo session generated successfully (HTTP 201)');
  const retailerData = await retailerRes.json();
  const retailerToken = retailerData.token;
  assert(retailerToken && retailerData.user.role === 'RETAILER', 'Retailer token and role verified in response');

  const adminRes = await fetch(`${API_BASE}/auth/demo-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'ADMIN', userId: 'admin-platform', email: 'ops@rasoiiq.com' })
  });
  assert(adminRes.status === 201, 'Admin demo session generated successfully (HTTP 201)');
  const adminData = await adminRes.json();
  const adminToken = adminData.token;
  assert(adminToken && adminData.user.role === 'ADMIN', 'Admin token and role verified in response');

  // B. Protect Admin Metrics: /api/marketplace/admin/metrics requires ADMIN or RETAILER
  const unauthMetricsRes = await fetch(`${API_BASE}/marketplace/admin/metrics`);
  assert(unauthMetricsRes.status === 401, 'Unauthenticated request to admin metrics rejected with HTTP 401 Unauthorized');

  const customerMetricsRes = await fetch(`${API_BASE}/marketplace/admin/metrics`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(customerMetricsRes.status === 403, 'Customer role request to admin metrics rejected with HTTP 403 Forbidden');

  const retailerMetricsRes = await fetch(`${API_BASE}/marketplace/admin/metrics`, {
    headers: { Authorization: `Bearer ${retailerToken}` }
  });
  assert(retailerMetricsRes.status === 200, 'Retailer role request to admin metrics allowed with HTTP 200 OK');
  const retailerMetrics = await retailerMetricsRes.json();
  assert(retailerMetrics && retailerMetrics.totalOrders !== undefined, 'Admin/Retailer metrics payload contains expected schema');

  const adminMetricsRes = await fetch(`${API_BASE}/marketplace/admin/metrics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminMetricsRes.status === 200, 'Admin role request to admin metrics allowed with HTTP 200 OK');

  // C. Token Validity & Expiration Edge Cases
  const invalidTokenRes = await fetch(`${API_BASE}/marketplace/admin/metrics`, {
    headers: { Authorization: 'Bearer totally-invalid-token-string' }
  });
  assert(invalidTokenRes.status === 401, 'Malformed or tampered token rejected with HTTP 401 Unauthorized');

  const expiredToken = jwt.sign(
    { id: 'user-expired', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) - 60 },
    JWT_SECRET
  );
  const expiredTokenRes = await fetch(`${API_BASE}/marketplace/admin/metrics`, {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });
  assert(expiredTokenRes.status === 401, 'Expired token rejected with HTTP 401 Unauthorized');

  const invalidRoleToken = jwt.sign(
    { id: 'user-bad-role', role: 'SUPER_HACKER' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const badRoleRes = await fetch(`${API_BASE}/marketplace/admin/metrics`, {
    headers: { Authorization: `Bearer ${invalidRoleToken}` }
  });
  assert(badRoleRes.status === 401, 'Token with invalid/unrecognized role claim rejected with HTTP 401');

  // D. Multi-Tenant Retailer Isolation: Retailer A vs Retailer B
  const retailerBlinkitInvRes = await fetch(`${API_BASE}/marketplace/retailer/ret-blinkit/inventory`, {
    headers: { Authorization: `Bearer ${retailerToken}` }
  });
  assert(retailerBlinkitInvRes.status === 200, 'Blinkit Retailer permitted to inspect own inventory (HTTP 200)');

  const retailerZeptoInvRes = await fetch(`${API_BASE}/marketplace/retailer/ret-zepto/inventory`, {
    headers: { Authorization: `Bearer ${retailerToken}` }
  });
  assert(retailerZeptoInvRes.status === 403, 'Blinkit Retailer prohibited from inspecting Zepto inventory (HTTP 403 Forbidden)');

  const adminZeptoInvRes = await fetch(`${API_BASE}/marketplace/retailer/ret-zepto/inventory`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminZeptoInvRes.status === 200, 'Platform Admin permitted to inspect any retailer inventory (HTTP 200)');

  // E. Customer A vs Customer B Household Isolation
  // Create Patel Family household (Customer B)
  const patelHhRes = await fetch(`${API_BASE}/households`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'hh-patel-family', name: 'Patel Family', dietaryPreference: 'JAIN' })
  });
  assert(patelHhRes.status === 201, 'Created Patel Family household in system (HTTP 201)');

  const customerPatelAccessRes = await fetch(`${API_BASE}/households/hh-patel-family`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(customerPatelAccessRes.status === 403, 'Sharma Customer prohibited from accessing Patel household (HTTP 403 Forbidden)');

  const customerSharmaAccessRes = await fetch(`${API_BASE}/households/hh-sharma-family`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(customerSharmaAccessRes.status === 200, 'Sharma Customer permitted to access own household (HTTP 200)');

  const adminPatelAccessRes = await fetch(`${API_BASE}/households/hh-patel-family`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminPatelAccessRes.status === 200, 'Platform Admin permitted to access any household (HTTP 200)');
}

async function testCheckoutValidationAndDeduplication() {
  console.log('\n--- 2. Testing Checkout Validation, Idempotency & Deduplication ---');

  const runKey = Date.now();
  const validOrderPayload = {
    retailerId: 'ret-blinkit',
    totalInr: 940,
    deliveryAddress: `Flat 402, Green Glen Layout, Bengaluru 560103 (${runKey})`,
    items: [
      {
        ingredientId: 'ing-atta',
        productVariantId: 'var-atta-aashirvaad-5kg',
        quantityPacks: 1,
        priceInr: 320,
        totalPriceInr: 320
      },
      {
        ingredientId: 'ing-paneer',
        productVariantId: 'var-paneer-amul-200g',
        quantityPacks: 2,
        priceInr: 90,
        totalPriceInr: 180
      }
    ]
  };

  // A. Submit valid order
  const orderRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrderPayload)
  });
  assert(orderRes.status === 201, 'Valid checkout request returns HTTP 201 Created');
  const orderData = await orderRes.json();
  assert(orderData.status === 'DEMO ORDER CONFIRMED', 'Order status explicitly indicates DEMO ORDER CONFIRMED');
  assert(orderData.orderNumber && orderData.orderNumber.startsWith('RASOI-'), 'Order generates unique RASOI-XXXXXX order number');
  assert(orderData.retailerName === 'Blinkit', 'Order correctly associates with chosen retailer Blinkit');

  // B. Duplicate order prevention: immediate identical submission within 5 seconds without key
  const dupRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validOrderPayload)
  });
  assert(dupRes.status === 400, 'Immediate identical checkout intercepted with HTTP 400 Bad Request');
  const dupErr = await dupRes.json();
  assert(
    dupErr.message && dupErr.message.includes('Duplicate order submission detected'),
    'Duplicate checkout error message informs user of sliding window rate-limit'
  );

  // C. Transactional Idempotency Key Handling
  const idempKey = `idemp-key-${runKey}`;
  const idempPayload = {
    ...validOrderPayload,
    deliveryAddress: `Flat 505, Idempotency Tower, Bengaluru 560103 (${runKey})`,
    totalInr: 850
  };
  const firstIdempRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'idempotency-key': idempKey
    },
    body: JSON.stringify(idempPayload)
  });
  assert(firstIdempRes.status === 201, 'First order with Idempotency-Key created successfully (HTTP 201)');
  const firstIdempOrder = await firstIdempRes.json();

  const secondIdempRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'idempotency-key': idempKey
    },
    body: JSON.stringify(idempPayload)
  });
  assert(secondIdempRes.status === 201 || secondIdempRes.status === 200, 'Subsequent identical request with same key returns successful response');
  const secondIdempOrder = await secondIdempRes.json();
  assert(
    secondIdempOrder.orderNumber === firstIdempOrder.orderNumber,
    'Idempotency key returns identical order without creating duplicate database record'
  );

  // D. Empty basket validation
  const emptyRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailerId: 'ret-blinkit',
      totalInr: 0,
      deliveryAddress: 'Flat 402, Bengaluru',
      items: []
    })
  });
  assert(emptyRes.status === 400, 'Empty basket checkout rejected with HTTP 400 Bad Request');

  // E. Missing delivery address validation
  const noAddrRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailerId: 'ret-blinkit',
      totalInr: 320,
      deliveryAddress: '   ',
      items: validOrderPayload.items
    })
  });
  assert(noAddrRes.status === 400, 'Missing or blank delivery address rejected with HTTP 400 Bad Request');

  // F. Failed order followed by legitimate retry succeeds immediately
  const legitRetryRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailerId: 'ret-blinkit',
      totalInr: 320,
      deliveryAddress: `Corrected Address, Bengaluru (${runKey})`,
      items: [validOrderPayload.items[0]]
    })
  });
  assert(legitRetryRes.status === 201, 'Legitimate retry after validation failure succeeds without false deduplication blocking');

  // G. Different baskets with similar totals do NOT falsely collide
  const basketA = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailerId: 'ret-zepto',
      totalInr: 500,
      deliveryAddress: `Addr A (${runKey})`,
      items: [{ ingredientId: 'ing-1', quantityPacks: 1, priceInr: 500 }]
    })
  });
  const basketB = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailerId: 'ret-zepto',
      totalInr: 500,
      deliveryAddress: `Addr B (${runKey})`,
      items: [{ ingredientId: 'ing-2', quantityPacks: 2, priceInr: 250 }, { ingredientId: 'ing-3', quantityPacks: 1, priceInr: 0 }]
    })
  });
  assert(basketA.status === 201 && basketB.status === 201, 'Different baskets with identical totals do not falsely collide');
}

async function testSecretsIsolationAndDisclosures() {
  console.log('\n--- 3. Testing Client Secrets Isolation & Sample Disclosures ---');

  // A. Verify GEMINI_API_KEY is not exposed in customer-web code or public env
  const rootEnvPath = path.resolve('.env');
  const webEnvPath = path.resolve('apps/customer-web/.env.local');

  if (fs.existsSync(rootEnvPath)) {
    const rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
    assert(!rootEnv.includes('NEXT_PUBLIC_GEMINI_API_KEY'), 'Root .env does not expose NEXT_PUBLIC_GEMINI_API_KEY');
  } else {
    assert(true, 'Root .env checked');
  }

  if (fs.existsSync(webEnvPath)) {
    const webEnv = fs.readFileSync(webEnvPath, 'utf8');
    assert(!webEnv.includes('GEMINI_API_KEY'), 'customer-web .env.local does not contain GEMINI_API_KEY');
  } else {
    assert(true, 'customer-web .env.local checked');
  }

  // B. Verify customer-web source files do not access process.env.GEMINI_API_KEY directly
  const webSrcDir = path.resolve('apps/customer-web/src');
  function scanDir(dir) {
    let clean = true;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!scanDir(full)) clean = false;
      } else if (ent.name.endsWith('.ts') || ent.name.endsWith('.tsx') || ent.name.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes('process.env.GEMINI_API_KEY') || content.includes('GEMINI_API_KEY')) {
          console.error(`Found GEMINI_API_KEY reference in ${full}`);
          clean = false;
        }
      }
    }
    return clean;
  }
  const codeIsClean = scanDir(webSrcDir);
  assert(codeIsClean, 'Frontend source tree is 100% free of client-side GEMINI_API_KEY references');

  // C. Verify Sample Disclosures in UI components
  const basketViewPath = path.resolve('apps/customer-web/src/components/app/GroceryBasketView.tsx');
  const basketViewContent = fs.readFileSync(basketViewPath, 'utf8');
  assert(
    basketViewContent.includes('DEMO PRICING & SAMPLE CATALOG DATA'),
    'GroceryBasketView includes explicit DEMO PRICING & SAMPLE CATALOG DATA badge'
  );
  assert(
    basketViewContent.includes('Zero-cost demonstration checkout'),
    'GroceryBasketView includes explicit zero-cost demo checkout disclosure'
  );
}

async function run() {
  console.log('=================================================================');
  console.log('  RasoiIQ RBAC, Security, Idempotency & Data Truthfulness Suite  ');
  console.log('=================================================================');

  try {
    await testAuthAndRbac();
    await testCheckoutValidationAndDeduplication();
    await testSecretsIsolationAndDisclosures();
  } catch (err) {
    console.error('Fatal execution error:', err);
    failedTests++;
  }

  console.log('\n=================================================================');
  console.log(`Results: ${passedTests} passed, ${failedTests} failed.`);
  console.log('=================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run();
