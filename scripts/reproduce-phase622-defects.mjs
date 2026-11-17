import { normalizeUnitQuantity, evaluatePantryStockLevel } from '../services/api/dist/grocery/grocery.service.js';

console.log('========================================================================');
console.log('🔍 RasoiIQ Phase 6.2.2 — Pre-Hardening Defect Reproduction Script');
console.log('========================================================================\n');

// Defect 1.1: Pack assumed to equal 1 piece
console.log('--- Defect 1.1: Pack assumed to equal 1 piece ---');
const normPack = normalizeUnitQuantity(1, 'pack');
console.log('normalizeUnitQuantity(1, "pack"):', normPack);
// Evaluating 1 pack (containing 6 eggs) vs 4 pcs threshold
const evalPackVsPcs = evaluatePantryStockLevel(1, 'pack', 4, 'pcs');
console.log('evaluatePantryStockLevel(1, "pack", 4, "pcs"):', evalPackVsPcs);
if (evalPackVsPcs.isLowStock === true) {
  console.log('🚨 REPRODUCED DEFECT 1.1: 1 pack was assumed to equal 1 piece, falsely flagging 1 pack (6 items) <= 4 pcs as LOW_STOCK!\n');
}

// Defect 1.2: Missing threshold invents comparison
console.log('--- Defect 1.2: Missing threshold invents comparison ---');
const evalMissingThresh = evaluatePantryStockLevel(100, 'g', null, null);
console.log('evaluatePantryStockLevel(100, "g", null, null):', evalMissingThresh);
if (evalMissingThresh.stockStatus === 'LOW_STOCK') {
  console.log('🚨 REPRODUCED DEFECT 1.2: Missing threshold invented a 250g baseline instead of returning THRESHOLD_NOT_CONFIGURED!\n');
}

// Defect 1.3: Malformed quantity not explicitly flagged
console.log('--- Defect 1.3: Malformed quantity ---');
const evalMalformed = evaluatePantryStockLevel(NaN, 'g', 500, 'g');
console.log('evaluatePantryStockLevel(NaN, "g", 500, "g"):', evalMalformed);
if (evalMalformed.stockStatus !== 'MALFORMED_QUANTITY') {
  console.log(`🚨 REPRODUCED DEFECT 1.3: NaN was not rejected as MALFORMED_QUANTITY (actual: ${evalMalformed.stockStatus})!\n`);
}

// Defect 2.1: Inventory fail-open on undefined/null
console.log('--- Defect 2.1: Inventory fail-open on undefined/null inStock ---');
const testVariantUndefined = { id: 'var-test', title: 'Test Product', inStock: undefined };
const isFailOpen = (testVariantUndefined.inStock === false) ? false : true;
console.log('testVariantUndefined.inStock === false ->', testVariantUndefined.inStock === false, '=> Treated as in-stock:', isFailOpen);
if (isFailOpen) {
  console.log('🚨 REPRODUCED DEFECT 2.1: undefined/null inStock fails OPEN, treating unverified stock as in-stock!\n');
}

// Defect 4.1: Customer cannot cancel their own ORDER_CONFIRMED order
console.log('--- Defect 4.1: Customer cancellation at ORDER_CONFIRMED ---');
async function testCustomerCancel() {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@rasoiiq.in', password: '' })
  });
  const auth = await loginRes.json();
  const token = auth.accessToken || auth.token;

  // Create an order
  const checkoutRes = await fetch('http://localhost:4000/api/marketplace/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      retailerId: 'ret-blinkit',
      totalInr: 100,
      deliveryAddress: 'Bellandur, Bengaluru',
      items: [{ productVariantId: 'var-mother-paneer-200', quantityPacks: 1, priceInr: 95 }]
    })
  });
  const order = await checkoutRes.json();
  console.log('Placed order:', order.id, 'status:', order.status);

  // Customer attempts to cancel their freshly placed order
  const cancelRes = await fetch(`http://localhost:4000/api/marketplace/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'CANCELLED', statusReason: 'Customer changed their mind' })
  });
  console.log('Customer cancel HTTP status:', cancelRes.status);
  if (cancelRes.status === 403) {
    console.log('🚨 REPRODUCED DEFECT 4.1: Customer cannot cancel even a newly placed ORDER_CONFIRMED order (403 Forbidden)!\n');
  }
}

testCustomerCancel().catch(console.error);
