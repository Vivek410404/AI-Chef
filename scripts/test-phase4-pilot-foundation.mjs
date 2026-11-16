/**
 * Phase 4: Customer Validation & Zero-Cost Pilot Foundation Test Suite
 * 
 * Verifies:
 * 1. Multi-household isolation (Sharma, Patel, Mehta) across household, meal plan, pantry, smart basket, and orders.
 * 2. Cross-household 403 Forbidden enforcement on read/write tampering.
 * 3. Retailer B2B inventory management & isolation (Blinkit cannot modify Zepto; Retailer cannot read meal plans).
 * 4. Cook / Maharaj preparation digest API (overnight soaking, advance prep, dietary restrictions, servings).
 * 5. Authentic Gujarati & Kathiyawadi recipe catalog (32 total recipes, IFCT nutrition, Jain suitability).
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('======================================================================');
  console.log('RASOIIQ PHASE 4: PILOT FOUNDATION & MULTI-HOUSEHOLD ISOLATION TEST');
  console.log('======================================================================\n');

  // 1. Session Initialization
  console.log('--- 1. Multi-Household Session Initialization ---');
  const sharmaSession = await request('/auth/demo-session', {
    method: 'POST',
    body: { role: 'CUSTOMER', householdId: 'hh-sharma-family' }
  });
  assert(sharmaSession.status === 201 && sharmaSession.data.token, 'Sharma Customer demo session initialized with valid JWT');
  const sharmaToken = sharmaSession.data.token;

  const patelSession = await request('/auth/demo-session', {
    method: 'POST',
    body: { role: 'CUSTOMER', householdId: 'hh-patel-family' }
  });
  assert(patelSession.status === 201 && patelSession.data.token, 'Patel Customer demo session initialized with valid JWT');
  const patelToken = patelSession.data.token;

  const mehtaSession = await request('/auth/demo-session', {
    method: 'POST',
    body: { role: 'CUSTOMER', householdId: 'hh-mehta-family' }
  });
  assert(mehtaSession.status === 201 && mehtaSession.data.token, 'Mehta Customer demo session initialized with valid JWT');
  const mehtaToken = mehtaSession.data.token;

  const blinkitSession = await request('/auth/demo-session', {
    method: 'POST',
    body: { role: 'RETAILER', retailerId: 'ret-blinkit' }
  });
  assert(blinkitSession.status === 201 && blinkitSession.data.token, 'Blinkit Retailer session initialized with valid JWT');
  const blinkitToken = blinkitSession.data.token;

  // 2. Multi-Household Isolation Checks
  console.log('\n--- 2. Multi-Household Isolation & 403 Forbidden Enforcement ---');
  
  // Patel accesses own data
  const patelHh = await request('/household/hh-patel-family', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelHh.status === 200 && patelHh.data.name.includes('Patel'), 'Patel customer reads own household profile (Bodakdev, Ahmedabad)');

  // Sharma attempts to read Patel household -> 403 Forbidden
  const sharmaReadsPatelHh = await request('/household/hh-patel-family', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaReadsPatelHh.status === 403, 'Cross-household read blocked: Sharma customer cannot read Patel household (403)');

  // Sharma attempts to update Patel household -> 403 Forbidden
  const sharmaUpdatesPatelHh = await request('/household/hh-patel-family', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${sharmaToken}` },
    body: { weeklyBudgetInr: 9999 }
  });
  assert(sharmaUpdatesPatelHh.status === 403, 'Cross-household update blocked: Sharma customer cannot update Patel household (403)');

  // Patel reads own meal plan -> 200 OK
  const patelPlan = await request('/meal-plans?householdId=hh-patel-family', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelPlan.status === 200 && Array.isArray(patelPlan.data), 'Patel customer reads own meal plan successfully');

  // Sharma attempts to read Patel meal plan -> 403 Forbidden
  const sharmaReadsPatelPlan = await request('/meal-plans?householdId=hh-patel-family', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaReadsPatelPlan.status === 403, 'Cross-household meal plan blocked: Sharma customer cannot read Patel meal plan (403)');

  // Sharma attempts to add meal to Patel plan -> 403 Forbidden
  const sharmaAddsMealToPatel = await request('/meal-plans/items', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sharmaToken}` },
    body: {
      householdId: 'hh-patel-family',
      recipeId: 'recipe-sev-tameta-nu-shaak',
      dayOfWeek: 'wednesday',
      mealCategory: 'lunch',
      servings: 4
    }
  });
  assert(sharmaAddsMealToPatel.status === 403, 'Cross-household write blocked: Sharma customer cannot insert meal into Patel plan (403)');

  // Patel reads own pantry -> 200 OK
  const patelPantry = await request('/pantry?householdId=hh-patel-family', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelPantry.status === 200 && Array.isArray(patelPantry.data), 'Patel customer reads own pantry items (Besan, Turmeric, Cumin)');

  // Sharma attempts to read Patel pantry -> 403 Forbidden
  const sharmaReadsPatelPantry = await request('/pantry?householdId=hh-patel-family', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaReadsPatelPantry.status === 403, 'Cross-household pantry blocked: Sharma customer cannot read Patel pantry (403)');

  // Patel reads own smart basket -> 200 OK
  const patelBasket = await request('/grocery/basket?householdId=hh-patel-family', {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelBasket.status === 200 && Array.isArray(patelBasket.data.items), 'Patel customer reads own aggregated Smart Basket');

  // Sharma attempts to read Patel smart basket -> 403 Forbidden
  const sharmaReadsPatelBasket = await request('/grocery/basket?householdId=hh-patel-family', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaReadsPatelBasket.status === 403, 'Cross-household basket blocked: Sharma customer cannot read Patel basket (403)');

  // 3. Cross-Household Order Isolation
  console.log('\n--- 3. Cross-Household Order Isolation ---');
  // Patel places an order
  const checkoutRes = await request('/marketplace/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patelToken}` },
    body: {
      householdId: 'hh-patel-family',
      retailerId: 'ret-blinkit',
      items: [
        {
          productVariantId: 'var-balaji-sev-200',
          quantity: 2,
          priceInr: 30,
          name: 'Balaji Ratlami Sev (200g)'
        }
      ],
      totalInr: 85,
      deliveryAddress: '402, Shivalik Highstreet, Bodakdev, Ahmedabad',
      deliverySlot: 'Tomorrow, 7:00 AM - 9:00 AM'
    }
  });
  const patelOrder = checkoutRes.data?.id ? checkoutRes.data : checkoutRes.data?.order;
  assert(checkoutRes.status === 201 && patelOrder?.id, 'Patel customer successfully executes simulated checkout');
  const patelOrderId = patelOrder?.id;

  // Patel reads own order by ID -> 200 OK
  const patelReadsOwnOrder = await request(`/marketplace/orders/${patelOrderId}`, {
    headers: { Authorization: `Bearer ${patelToken}` }
  });
  assert(patelReadsOwnOrder.status === 200 && patelReadsOwnOrder.data.id === patelOrderId, 'Patel customer retrieves own order by ID');

  // Sharma attempts to read Patel order by ID -> 403 Forbidden
  const sharmaReadsPatelOrder = await request(`/marketplace/orders/${patelOrderId}`, {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaReadsPatelOrder.status === 403, 'Cross-household order blocked: Sharma customer cannot view Patel family order (403)');

  // 4. Retailer B2B Isolation & Inventory Management
  console.log('\n--- 4. Retailer B2B Isolation & Inventory Management ---');
  // Blinkit updates its own product price/stock
  const blinkitUpdateSelf = await request('/marketplace/retailer/ret-blinkit/product/var-fortune-atta-5k', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${blinkitToken}` },
    body: { priceInr: 219, inStock: true }
  });
  assert(blinkitUpdateSelf.status === 200 && blinkitUpdateSelf.data.priceInr === 219, 'Blinkit retailer partner successfully updates own catalog price & stock');

  // Blinkit attempts to update Zepto catalog -> 403 Forbidden
  const blinkitUpdatesZepto = await request('/marketplace/retailer/ret-zepto/product/var-fortune-atta-5k', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${blinkitToken}` },
    body: { priceInr: 150, inStock: false }
  });
  assert(blinkitUpdatesZepto.status === 403, 'B2B isolation enforced: Blinkit cannot modify Zepto retailer catalog (403)');

  // Retailer attempts to read customer meal plan -> 403 Forbidden
  const retailerReadsMealPlan = await request('/meal-plans?householdId=hh-sharma-family', {
    headers: { Authorization: `Bearer ${blinkitToken}` }
  });
  assert(retailerReadsMealPlan.status === 403, 'RBAC isolation: Retailer role cannot view customer meal plan (403)');

  // 5. Cook / Maharaj Preparation Digest API
  console.log('\n--- 5. Cook / Maharaj Preparation Digest API ---');
  const maharajRes = await request('/meal-plans/maharaj-summary?householdId=hh-sharma-family&day=monday', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(maharajRes.status === 200, 'Maharaj preparation summary endpoint returns 200 OK');
  assert(maharajRes.data.targetDay === 'monday', 'Maharaj summary correctly binds to requested target day');
  assert(Array.isArray(maharajRes.data.plannedMeals) && maharajRes.data.plannedMeals.length > 0, 'Maharaj summary lists scheduled meals for target day');
  assert(Array.isArray(maharajRes.data.advancePreparation), 'Maharaj summary provides advance preparation instructions');
  assert(Array.isArray(maharajRes.data.overnightSoaking), 'Maharaj summary identifies overnight soaking requirements');
  assert(Array.isArray(maharajRes.data.householdDietaryRestrictions), 'Maharaj summary lists household dietary constraints for cook');

  // Cross-household access to maharaj summary -> 403 Forbidden
  const sharmaReadsPatelMaharaj = await request('/meal-plans/maharaj-summary?householdId=hh-patel-family&day=monday', {
    headers: { Authorization: `Bearer ${sharmaToken}` }
  });
  assert(sharmaReadsPatelMaharaj.status === 403, 'Cross-household maharaj summary blocked: Sharma cannot view Patel cook digest (403)');

  // 6. Authentic Gujarati & Kathiyawadi Recipe Catalog & Nutrition
  console.log('\n--- 6. Authentic Gujarati & Kathiyawadi Recipe Catalog ---');
  const recipesRes = await request('/recipes');
  assert(recipesRes.status === 200 && Array.isArray(recipesRes.data), 'Recipe catalog API returns 200 OK');
  const recipes = recipesRes.data;
  assert(recipes.length >= 32, `Recipe catalog has expanded to ${recipes.length} authentic recipes (>= 32 expected)`);

  const expectedRegionalRecipes = [
    { id: 'recipe-sev-tameta-nu-shaak', name: 'Kathiyawadi Sev Tameta Nu Shaak', cuisine: 'Kathiyawadi' },
    { id: 'recipe-ringna-no-olo', name: 'Kathiyawadi Ringna No Olo (Baingan Bharta)', cuisine: 'Kathiyawadi' },
    { id: 'recipe-bajra-no-rotlo', name: 'Kathiyawadi Bajra No Rotlo', cuisine: 'Kathiyawadi' },
    { id: 'recipe-surati-undhiyu', name: 'Authentic Surati Undhiyu', cuisine: 'Gujarati' },
    { id: 'recipe-gujarati-dal-dhokli', name: 'Traditional Gujarati Dal Dhokli', cuisine: 'Gujarati' },
    { id: 'recipe-gujarati-kadhi', name: 'Traditional Sweet & Sour Gujarati Kadhi', cuisine: 'Gujarati' },
    { id: 'recipe-vaghireli-khichdi', name: 'Kathiyawadi Vaghireli Khichdi with Desi Ghee', cuisine: 'Kathiyawadi' },
    { id: 'recipe-gujarati-handvo', name: 'Baked Gujarati Handvo (Savory Vegetable Cake)', cuisine: 'Gujarati' },
    { id: 'recipe-methi-na-gota', name: 'Crispy Methi Na Gota (Fenugreek Fritters)', cuisine: 'Gujarati' }
  ];

  for (const exp of expectedRegionalRecipes) {
    const found = recipes.find(r => r.id === exp.id);
    assert(Boolean(found), `Catalog includes "${exp.name}" (${exp.id})`);
    if (found) {
      assert(found.cuisine === exp.cuisine, `"${exp.name}" is correctly categorized as ${exp.cuisine} cuisine`);
      assert(found.caloriesPerServing > 0 && found.proteinGrams > 0, `"${exp.name}" has non-zero IFCT nutrition: ${found.caloriesPerServing} kcal, ${found.proteinGrams}g protein`);
      assert(found.ingredients && found.ingredients.length > 0, `"${exp.name}" has authentic ingredient composition with gram weights`);
    }
  }

  // Verify Jain suitability of Bajra Rotlo and Kadhi
  const rotlo = recipes.find(r => r.id === 'recipe-bajra-no-rotlo');
  assert(rotlo?.dietaryTags?.includes('Jain Friendly') && rotlo?.dietaryTags?.includes('Vegan'), 'Bajra No Rotlo is marked strictly Jain-suitable and Vegan');

  const undhiyu = recipes.find(r => r.id === 'recipe-surati-undhiyu');
  assert(undhiyu?.dietaryTags?.includes('Vegetarian') && undhiyu?.defaultServings === 4, 'Surati Undhiyu is authentic multi-serving vegetarian feast');

  console.log('\n======================================================================');
  console.log(`PHASE 4 PILOT FOUNDATION TEST SUMMARY: ${passedTests} / ${totalTests} assertions passed (${failedTests} failed)`);
  console.log('======================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
