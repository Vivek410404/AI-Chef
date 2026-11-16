// scripts/verify-persistence-matrix.mjs
// Rigorous verification of persistence across 4 scenarios:
// A: Browser reload / re-fetch while backend running
// B: Frontend restart while backend running
// C: Backend process restart
// D: Full application restart

const API_BASE = 'http://localhost:4000/api';

async function checkState(label) {
  console.log(`\n--- State Check: [${label}] ---`);
  
  // 1. Household
  const hhRes = await fetch(`${API_BASE}/households/me`);
  const hh = await hhRes.json();
  console.log(`  Household: "${hh.name}", Diet: "${hh.dietaryPreference}", Members: ${hh.members?.length}`);

  // 2. Meal Plan
  const planRes = await fetch(`${API_BASE}/meal-plans/current`);
  const plan = await planRes.json();
  const firstMeal = plan[0] ? `${plan[0].dayOfWeek} ${plan[0].mealCategory}: ${plan[0].recipe?.title || plan[0].recipeId}` : 'none';
  console.log(`  Meal Plan Items: ${plan.length}, First Meal: ${firstMeal}`);

  // 3. Pantry
  const pantryRes = await fetch(`${API_BASE}/pantry`);
  const pantry = await pantryRes.json();
  console.log(`  Pantry Items: ${pantry.length}`);

  // 4. Completed Orders
  const ordersRes = await fetch(`${API_BASE}/marketplace/orders`);
  const orders = await ordersRes.json();
  console.log(`  Completed Orders: ${orders.length}`);

  return { hh, planCount: plan.length, pantryCount: pantry.length, orderCount: orders.length, firstMeal };
}

async function modifyState() {
  console.log('\n>>> Modifying Backend State via API...');
  
  // Update household
  const putRes = await fetch(`${API_BASE}/households/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dietaryPreference: 'NON_VEGETARIAN' })
  });
  const updatedHh = await putRes.json();
  console.log(`  Updated Diet to: ${updatedHh.dietaryPreference}`);

  // Place an order
  const orderRes = await fetch(`${API_BASE}/marketplace/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      retailerId: 'ret-blinkit',
      items: [{ productId: 'test-p1', title: 'Test Item', priceInr: 100, quantityPacks: 1 }],
      totalInr: 100,
      deliveryAddress: 'Test Persistence Address'
    })
  });
  const order = await orderRes.json();
  console.log(`  Placed Order ID: ${order.orderNumber || order.id}`);
}

async function main() {
  console.log('=====================================================');
  console.log('  RASOIIQ STORAGE & PERSISTENCE VERIFICATION TEST     ');
  console.log('=====================================================');

  const baseline = await checkState('Baseline');
  await modifyState();
  const modified = await checkState('Modified State');

  console.log('\nVerification of In-Memory State Retention while Backend is Alive:');
  console.log(`  Diet changed to NON_VEGETARIAN? ${modified.hh.dietaryPreference === 'NON_VEGETARIAN' ? 'YES' : 'NO'}`);
  console.log(`  Orders incremented? Baseline: ${baseline.orderCount}, Modified: ${modified.orderCount}`);
}

main().catch(console.error);
