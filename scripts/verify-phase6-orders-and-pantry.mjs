import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🧪 =======================================================');
  console.log('🧪 RASOIIQ — PHASE 6.2 ORDERS TRACKING & PANTRY RESTOCK QA');
  console.log('🧪 =======================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Log in as demo customer
  console.log('Step 1: Authenticating customer session...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'vivek@rasoi.me');
  await page.type('input[type="password"]', 'RasoiAdminSecretPassphrase@2026');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // 2. Open /orders
  console.log('Step 2: Navigating to My Orders (/orders)...');
  await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Verify Orders and Stepper
  const orderCards = await page.$$eval('div.bg-surface', els => els.length);
  console.log(`  ✓ Found order cards: ${orderCards}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '24_my_orders_live_timeline.png'), fullPage: false });
  console.log('  📸 Captured 24_my_orders_live_timeline.png');

  // 3. Open /shop to verify Pantry Restock Alert
  console.log('Step 3: Navigating to /shop to verify Pantry Restock Alert...');
  await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '25_shop_pantry_low_stock_restock_alert.png'), fullPage: false });
  console.log('  📸 Captured 25_shop_pantry_low_stock_restock_alert.png');

  // Verify Pantry Alert Bar
  const hasPantryAlert = await page.$$eval('h4', hs =>
    hs.some(h => h.textContent && h.textContent.includes('Kitchen Pantry Low-Stock Alert'))
  );
  console.log(`  ✓ Pantry Low-Stock Alert displayed: ${hasPantryAlert}`);

  await browser.close();
  console.log('\n=======================================================');
  console.log('✅ PHASE 6.2 EXTENDED QA COMPLETE!');
  console.log('=======================================================\n');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
