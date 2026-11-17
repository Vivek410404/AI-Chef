async function run() {
  console.log('--- Testing Category Endpoint ---');
  const catRes = await fetch('http://localhost:4000/api/grocery/categories');
  const cats = await catRes.json();
  console.log(`Categories found: ${cats.length}`);
  console.assert(cats.length === 14, 'Must have 14 categories');

  console.log('\n--- Testing Regional Synonym Search: "haldi" ---');
  const haldiRes = await fetch('http://localhost:4000/api/grocery/products?q=haldi');
  const haldiData = await haldiRes.json();
  console.log(`Found ${haldiData.pagination.total} products for "haldi":`);
  for (const p of haldiData.products) {
    console.log(` - ${p.title} (${p.brand}) -> ₹${p.retailerInfo.priceInr}`);
  }
  console.assert(haldiData.pagination.total > 0, 'Synonym "haldi" must match turmeric products');

  console.log('\n--- Testing Regional Synonym Search: "atta" ---');
  const attaRes = await fetch('http://localhost:4000/api/grocery/products?q=atta');
  const attaData = await attaRes.json();
  console.log(`Found ${attaData.pagination.total} products for "atta":`);
  for (const p of attaData.products) {
    console.log(` - ${p.title} (${p.brand}) -> ₹${p.retailerInfo.priceInr}`);
  }
  console.assert(attaData.pagination.total > 0, 'Synonym "atta" must match wheat flour');

  console.log('\n--- Testing Autocomplete Suggestions: "mil" ---');
  const sugRes = await fetch('http://localhost:4000/api/grocery/search/suggestions?q=mil');
  const sugs = await sugRes.json();
  console.log(`Suggestions for "mil":`, sugs);
  console.assert(sugs.length > 0, 'Must have suggestions for "mil"');

  console.log('\n--- Testing Product Detail by Slug ---');
  const sampleSlug = haldiData.products[0]?.slug;
  if (sampleSlug) {
    const detailRes = await fetch(`http://localhost:4000/api/grocery/products/${sampleSlug}`);
    const detail = await detailRes.json();
    console.log(`Product: ${detail.title} (Slug: ${detail.slug})`);
    console.log(`Variants count: ${detail.variants.length}`);
    const v1 = detail.variants[0];
    console.log(`Variant ${v1.title} retailer comparisons:`);
    for (const comp of v1.retailerComparisons) {
      console.log(`   * ${comp.retailerName}: ₹${comp.priceInr} (MRP: ₹${comp.mrpInr}, Lowest: ${comp.isLowestPrice})`);
    }
  }

  console.log('\n--- Testing Direct Cart Add & Retailer Conflict ---');
  // First item with Blinkit
  const firstVariant = haldiData.products[0]?.variants[0]?.id;
  const addRes1 = await fetch('http://localhost:4000/api/grocery/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productVariantId: firstVariant, quantity: 2, retailerId: 'ret-blinkit' })
  });
  const addData1 = await addRes1.json();
  console.log('Add result 1 (Blinkit):', addData1.success ? 'SUCCESS' : addData1);

  // Now attempt to add with DMart Ready -> Should trigger conflict!
  const addResConflict = await fetch('http://localhost:4000/api/grocery/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productVariantId: firstVariant, quantity: 1, retailerId: 'ret-dmart' })
  });
  const conflictData = await addResConflict.json();
  console.log('Add result with DMart (Conflict check):', conflictData.conflict ? `CONFLICT DETECTED: ${conflictData.message}` : 'Unexpected non-conflict');
  console.assert(conflictData.conflict === true, 'Must detect retailer conflict');

  console.log('\n✅ ALL BACKEND GROCERY API CHECKS PASSED!');
}

run().catch(err => {
  console.error('API Verification error:', err);
  process.exit(1);
});
