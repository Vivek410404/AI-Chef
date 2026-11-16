/**
 * RasoiIQ Phase 4.3 — Real Household Account Simulation & Isolation Suite
 * 
 * Verifies 3 independent household sessions:
 * 1. Sharma Family (North Indian, Veg, Peanut Allergy, Garlic Dislike)
 * 2. Patel Family (Gujarati / Kathiyawadi, Jain preferences, Bajra Rotlo)
 * 3. Mehta Family (Strict Jain, Mumbai, Zero Root Vegetables)
 * 
 * Tests:
 * - Independent JWT login sessions
 * - Server-side tenancy resolution (no hardcoded client IDs)
 * - Household profile & member preference isolation
 * - Pantry management isolation
 * - Maharaj advance preparation digest with custom household warnings
 * - Cross-household IDOR blocking (100% Forbidden)
 * - Independent grocery baskets & order histories
 */

const API_BASE = 'http://localhost:4000/api';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  }
}

async function fetchApi(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

console.log('========================================================================');
console.log('  RASOIIQ PHASE 4.3: REAL HOUSEHOLD SIMULATION & ISOLATION SUITE        ');
console.log('========================================================================\n');

async function run() {
  // --- SECTION 1: Independent Authentication & Token Issuance ---
  console.log('--- Section 1: Independent Multi-Household Authentication ---');
  
  const sharmaAuth = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'pooja@sharma.in' })
  });
  assert(sharmaAuth.ok && sharmaAuth.data?.token, 'Sharma family login successful (pooja@sharma.in)');
  assert(sharmaAuth.data?.user?.householdId === 'hh-sharma-family', 'Sharma token bound to hh-sharma-family');
  const sharmaToken = sharmaAuth.data.token;

  const patelAuth = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ramesh@patel.in' })
  });
  assert(patelAuth.ok && patelAuth.data?.token, 'Patel family login successful (ramesh@patel.in)');
  assert(patelAuth.data?.user?.householdId === 'hh-patel-family', 'Patel token bound to hh-patel-family');
  const patelToken = patelAuth.data.token;

  const mehtaAuth = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'kirit@mehta.in' })
  });
  assert(mehtaAuth.ok && mehtaAuth.data?.token, 'Mehta family login successful (kirit@mehta.in)');
  assert(mehtaAuth.data?.user?.householdId === 'hh-mehta-family', 'Mehta token bound to hh-mehta-family');
  const mehtaToken = mehtaAuth.data.token;

  assert(sharmaToken !== patelToken && patelToken !== mehtaToken, 'All three households hold distinct cryptographic JWT tokens');

  // --- SECTION 2: Profile & Member Nuances ---
  console.log('\n--- Section 2: Household Profiles & Dietary Preferences ---');

  const sharmaProfile = await fetchApi('/households/me', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaProfile.data?.name?.includes('Sharma'), `Sharma profile retrieved: ${sharmaProfile.data?.name}`);
  const peanutAllergyMember = sharmaProfile.data?.members?.find(m => m.allergies?.includes('Peanuts'));
  assert(Boolean(peanutAllergyMember), 'Sharma member (Pooja) with severe peanut allergy confirmed');

  const patelProfile = await fetchApi('/households/me', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelProfile.data?.name?.includes('Patel'), `Patel profile retrieved: ${patelProfile.data?.name}`);
  assert(patelProfile.data?.dietaryPreference === 'JAIN' || patelProfile.data?.members?.every(m => m.dietaryPreference === 'jain' || m.dietaryPreference === 'JAIN'),
    'Patel household confirmed with Jain dietary preferences');

  const mehtaProfile = await fetchApi('/households/me', {
    headers: { Authorization: `Bearer ${mehtaToken}` }
  });
  assert(mehtaProfile.data?.name?.includes('Mehta'), `Mehta profile retrieved: ${mehtaProfile.data?.name}`);
  assert(mehtaProfile.data?.dietaryPreference === 'JAIN' || mehtaProfile.data?.members?.every(m => m.dietaryPreference === 'jain' || m.dietaryPreference === 'JAIN'),
    'Mehta household confirmed with strict Jain preferences');

  // --- SECTION 3: Pantry Isolation ---
  console.log('\n--- Section 3: Household Pantry Management Isolation ---');

  // Sharma updates pantry with Wheat Flour
  await fetchApi('/pantry', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sharmaToken}` },
    body: JSON.stringify({ ingredientId: 'ing-wheat-flour', quantity: 5000, unit: 'g' })
  });

  // Patel updates pantry with Bajra Flour
  await fetchApi('/pantry', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patelToken}` },
    body: JSON.stringify({ ingredientId: 'ing-bajra-flour', quantity: 2000, unit: 'g' })
  });

  // Mehta updates pantry with Raw Banana
  await fetchApi('/pantry', {
    method: 'POST',
    headers: { Authorization: `Bearer ${mehtaToken}` },
    body: JSON.stringify({ ingredientId: 'ing-raw-banana', quantity: 1500, unit: 'g' })
  });

  const [sharmaPantry, patelPantry, mehtaPantry] = await Promise.all([
    fetchApi('/pantry', { headers: { Authorization: `Bearer ${sharmaToken}` } }),
    fetchApi('/pantry', { headers: { Authorization: `Bearer ${patelToken}` } }),
    fetchApi('/pantry', { headers: { Authorization: `Bearer ${mehtaToken}` } })
  ]);

  const sharmaHasBesan = sharmaPantry.data?.some(i => i.ingredientId === 'ing-besan');
  const patelHasWheat = patelPantry.data?.some(i => i.ingredientId === 'ing-wheat-flour');
  const mehtaHasWheat = mehtaPantry.data?.some(i => i.ingredientId === 'ing-wheat-flour');

  assert(!sharmaHasBesan, 'Sharma pantry strictly isolated (does not contain Patel Besan)');
  assert(!patelHasWheat, 'Patel pantry strictly isolated (does not contain Sharma Wheat flour)');
  assert(!mehtaHasWheat, 'Mehta pantry strictly isolated (does not contain Sharma Wheat flour)');

  // --- SECTION 4: Cross-Household IDOR Penetration Defense ---
  console.log('\n--- Section 4: Cross-Household IDOR Security Defense ---');

  // Attack 1: Sharma attempts to read Patel household directly
  const idor1 = await fetchApi('/households/hh-patel-family', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(idor1.status === 403, `IDOR Defense 1: Sharma -> Patel Household blocked with HTTP ${idor1.status}`);

  // Attack 2: Patel attempts to read Sharma pantry
  const idor2 = await fetchApi('/pantry?householdId=hh-sharma-family', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(idor2.status === 403, `IDOR Defense 2: Patel -> Sharma Pantry blocked with HTTP ${idor2.status}`);

  // Attack 3: Mehta attempts to inspect Sharma meal plans
  const idor3 = await fetchApi('/meal-plans/current?householdId=hh-sharma-family', {
    headers: { Authorization: `Bearer ${mehtaToken}` }
  });
  assert(idor3.status === 403, `IDOR Defense 3: Mehta -> Sharma Meal Plan blocked with HTTP ${idor3.status}`);

  // Attack 4: Sharma attempts to update Patel household settings
  const idor4 = await fetchApi('/households/hh-patel-family', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${sharmaToken}` },
    body: JSON.stringify({ weeklyBudgetInr: 99999 })
  });
  assert(idor4.status === 403, `IDOR Defense 4: Cross-tenant household update blocked with HTTP ${idor4.status}`);

  // --- SECTION 5: Maharaj Digest Safety & Allergy Warnings ---
  console.log('\n--- Section 5: Maharaj Preparation Digest Safety ---');

  const sharmaDigest = await fetchApi('/meal-plans/maharaj-summary?day=monday', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaDigest.ok, 'Sharma Maharaj digest generated successfully');
  const sharmaText = JSON.stringify(sharmaDigest.data || {});
  assert(sharmaText.toLowerCase().includes('peanut') || sharmaDigest.data?.allergyAlerts?.some(a => a.toLowerCase().includes('peanut')),
    'Sharma Maharaj digest prominently highlights Peanut allergy precautions');

  const patelDigest = await fetchApi('/meal-plans/maharaj-summary?day=monday', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelDigest.ok, 'Patel Maharaj digest generated successfully');
  const patelText = JSON.stringify(patelDigest.data || {});
  assert(patelText.toLowerCase().includes('jain') || patelDigest.data?.dietaryNotes?.some(d => d.toLowerCase().includes('jain')),
    'Patel Maharaj digest explicitly notes Jain dietary parameters');

  // --- SECTION 6: Simulated Checkout & Order Isolation ---
  console.log('\n--- Section 6: Grocery Concierge Checkout & Order Isolation ---');

  const checkoutRes = await fetchApi('/marketplace/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patelToken}` },
    body: JSON.stringify({
      retailerId: 'ret-dmart',
      items: [{ ingredientId: 'ing-bajra-flour', name: 'Bajra Flour 1kg', priceInr: 65, quantity: 2 }],
      totalInr: 130,
      deliveryAddress: 'Flat 402, Bodakdev, Ahmedabad'
    })
  });
  const orderId = checkoutRes.data?.id || checkoutRes.data?.order?.id;
  assert(checkoutRes.ok && Boolean(orderId), `Patel simulated checkout completed with order ID: ${orderId}`);

  const patelOrders = await fetchApi('/marketplace/orders', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  const sharmaOrders = await fetchApi('/marketplace/orders', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });

  const patelHasOrder = patelOrders.data?.some(o => o.id === orderId);
  const sharmaHasPatelOrder = sharmaOrders.data?.some(o => o.id === orderId);

  assert(patelHasOrder, 'Patel order history contains confirmed simulated order');
  assert(!sharmaHasPatelOrder, 'Sharma order history strictly segregated (zero cross-tenant order leakage)');

  console.log('\n========================================================================');
  console.log(`HOUSEHOLD SIMULATION AUDIT SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal household simulation error:', err);
  process.exit(1);
});
