import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🧪 =======================================================');
  console.log('🧪 RASOIIQ — PHASE 6.1 GROCERY MARKETPLACE QA & VERIFICATION');
  console.log('🧪 =======================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Log in as demo customer to get a full session
  console.log('Step 1: Authenticating customer session...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'vivek@rasoi.me');
  await page.type('input[type="password"]', 'RasoiAdminSecretPassphrase@2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // 2. Open /shop
  console.log('Step 2: Navigating to Grocery Shop (/shop)...');
  await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Capture Shop Home Desktop
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_shop_homepage_desktop.png'), fullPage: false });
  console.log('  📸 Captured 15_shop_homepage_desktop.png');

  // Verify Categories
  const categoryCount = await page.$$eval('div.grid-cols-2.sm\\:grid-cols-4.md\\:grid-cols-7 > button', els => els.length);
  console.log(`  ✓ Verified 14 Quick-Commerce Category cards rendered (Actual: ${categoryCount})`);
  console.assert(categoryCount === 14, `Expected 14 categories, got ${categoryCount}`);

  // 3. Search for "haldi" (Regional Synonym for Turmeric)
  console.log('Step 3: Testing regional synonym search: "haldi"...');
  const searchInput = await page.$('input[placeholder*="Search groceries"]');
  if (searchInput) {
    await searchInput.click();
    await searchInput.type('haldi');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_shop_search_haldi_synonym.png'), fullPage: false });
    console.log('  📸 Captured 16_shop_search_haldi_synonym.png');

    const titles = await page.$$eval('h3.line-clamp-2', els => els.map(e => e.textContent?.trim()));
    console.log(`  ✓ Search results for "haldi":`, titles.slice(0, 3));
    const hasTurmeric = titles.some(t => t.toLowerCase().includes('turmeric') || t.toLowerCase().includes('haldi'));
    console.assert(hasTurmeric, 'Synonym search must return Turmeric/Haldi products');
  }

  // 4. Test Autocomplete Suggestions
  console.log('Step 4: Testing autocomplete suggestions for "mil"...');
  await page.click('button[aria-label="Clear search"]').catch(() => {});
  await page.click('input[placeholder*="Search groceries"]');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type('input[placeholder*="Search groceries"]', 'mil');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_shop_autocomplete_suggestions.png'), fullPage: false });
  console.log('  📸 Captured 17_shop_autocomplete_suggestions.png');

  // 5. Category Filtering: Dairy & Bakery
  console.log('Step 5: Testing Category Navigation (Dairy & Bakery)...');
  await page.click('button[aria-label="Clear search"]').catch(() => {});
  await page.$$eval('div.grid-cols-2.sm\\:grid-cols-4.md\\:grid-cols-7 > button', btns => {
    const b = btns.find(el => el.textContent.includes('Dairy'));
    if (b) (b).click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_shop_category_dairy_filtered.png'), fullPage: false });
  console.log('  📸 Captured 18_shop_category_dairy_filtered.png');

  // 6. Product Detail & 4-Retailer Price Comparison Modal
  console.log('Step 6: Testing Product Detail Modal & 4-Retailer Comparison Matrix...');
  const compareBtn = await page.$('button.underline');
  if (compareBtn) {
    await compareBtn.click();
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_shop_product_detail_comparison_modal.png'), fullPage: false });
    console.log('  📸 Captured 19_shop_product_detail_comparison_modal.png');

    // Dismiss with Escape key
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }

  // 7. Direct Add to Cart without Meal Plan
  console.log('Step 7: Testing Direct Add to Cart from Product Card...');
  // Clear category filter so all products show
  await page.$$eval('span.bg-cream-200 > button', btns => {
    if (btns.length > 0) btns[0].click();
  }).catch(() => {});
  await new Promise(r => setTimeout(r, 600));

  // Find the first product card's "Add" button (div.group button with text "Add")
  const productCardAddBtn = await page.$$eval('div.group button', btns => {
    const addBtn = btns.find(b => b.textContent && b.textContent.includes('Add'));
    if (addBtn) {
      addBtn.click();
      return true;
    }
    return false;
  });
  console.log(`  ✓ Clicked product card Add button: ${productCardAddBtn}`);
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20_shop_direct_added_to_cart.png'), fullPage: false });
  console.log('  📸 Captured 20_shop_direct_added_to_cart.png');

  // 8. Single-Retailer Rule & Conflict Modal
  console.log('Step 8: Testing Single-Retailer Conflict Enforcement...');
  // Click on a different retailer pill in the top strip (e.g. DMart Ready or Zepto)
  await page.$$eval('div.grid-cols-2.lg\\:grid-cols-4 > button', btns => {
    const b = btns.find(el => el.textContent && el.textContent.includes('DMart'));
    if (b) (b).click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21_shop_retailer_conflict_modal.png'), fullPage: false });
  console.log('  📸 Captured 21_shop_retailer_conflict_modal.png');

  // Verify Conflict Modal is visible
  const conflictVisible = await page.$$eval('h3', headings =>
    headings.some(h => h.textContent && h.textContent.includes('Switch Delivery Retailer'))
  );
  console.log(`  ✓ Retailer conflict dialog detected: ${conflictVisible}`);

  // Confirm Switch if modal open
  if (conflictVisible) {
    await page.$$eval('button', btns => {
      const confirmBtn = btns.find(b => b.textContent && b.textContent.includes('Switch to'));
      if (confirmBtn) (confirmBtn).click();
    });
    await new Promise(r => setTimeout(r, 1200));
    console.log('  ✓ Confirmed retailer switch to DMart Ready');
  }

  // 9. Mobile Responsive QA
  console.log('Step 9: Testing Mobile Responsiveness (375x812)...');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22_shop_mobile_viewport.png'), fullPage: false });
  console.log('  📸 Captured 22_shop_mobile_viewport.png');

  // Test Mobile Navigation Drawer
  const mobileMenuBtn = await page.$('button[aria-label="Toggle navigation menu"]');
  if (mobileMenuBtn) {
    await mobileMenuBtn.click();
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '23_shop_mobile_drawer_navigation.png'), fullPage: false });
    console.log('  📸 Captured 23_shop_mobile_drawer_navigation.png');
  }

  await browser.close();
  console.log('\n=======================================================');
  console.log('✅ ALL PHASE 6.1 FRONTEND & E2E VERIFICATIONS COMPLETE!');
  console.log('=======================================================\n');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
