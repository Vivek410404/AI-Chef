import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\vivek\\.gemini\\antigravity\\brain\\dad403ea-3687-47ef-95af-a010ad0af209\\screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'test-2' },
  JWT_SECRET
);

async function run() {
  console.log('=== Starting Round 2 Fix Verification ===\n');

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });

  try {
    // -------------------------------------------------------------
    // TEST 1: Multi-Retailer Price Stability on #basket
    // -------------------------------------------------------------
    console.log('--- Test 1: Multi-Retailer Stability on #basket ---');
    await page.goto('http://localhost:3000/#basket', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Helper to read all retailer card prices
    const getCardPrices = async () => {
      return page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.grid > div'));
        return cards.map(c => {
          const name = c.querySelector('span.font-black')?.textContent?.trim() || '';
          const price = c.querySelector('.text-xl')?.textContent?.trim() || '';
          const savings = c.innerText.includes('Save') ? c.innerText.match(/Save [₹\d,]+/)?.[0] : 'Baseline/None';
          const isSelected = c.innerText.includes('SELECTED');
          return { name, price, savings, isSelected };
        }).filter(c => c.name);
      });
    };

    console.log('Initial Card Prices:');
    const initial = await getCardPrices();
    console.table(initial);

    // Click Zepto
    console.log('\nClicking Zepto card...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid > div'));
      const zepto = cards.find(c => c.innerText.includes('Zepto'));
      if (zepto) zepto.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    const afterZepto = await getCardPrices();
    console.log('Prices after clicking Zepto:');
    console.table(afterZepto);

    // Click BigBasket
    console.log('\nClicking BigBasket card...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid > div'));
      const bb = cards.find(c => c.innerText.includes('BigBasket'));
      if (bb) bb.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    const afterBB = await getCardPrices();
    console.log('Prices after clicking BigBasket:');
    console.table(afterBB);

    // Click DMart Ready
    console.log('\nClicking DMart Ready card...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.grid > div'));
      const dmart = cards.find(c => c.innerText.includes('DMart'));
      if (dmart) dmart.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    const afterDMart = await getCardPrices();
    console.log('Prices after clicking DMart:');
    console.table(afterDMart);

    const shot1 = path.join(SCREENSHOT_DIR, '04_basket_stable_retailer_prices.png');
    await page.screenshot({ path: shot1 });
    console.log('Saved basket screenshot:', shot1);

    // -------------------------------------------------------------
    // TEST 2: Calibrated Protein Goal & Progress Bar on #planner
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Calibrated Protein Tracker on #planner ---');
    await page.goto('http://localhost:3000/#planner', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Open Goal Editor
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Adjust Protein Goal'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const shot2 = path.join(SCREENSHOT_DIR, '05_protein_tracker_calibrated.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved calibrated protein tracker screenshot:', shot2);

    const proteinDetails = await page.evaluate(() => {
      const text = document.querySelector('.bg-amber-50\\/40, div:has(> div > h3)')?.innerText || document.body.innerText;
      return text.slice(0, 500).replace(/\n+/g, ' | ');
    });
    console.log('Protein details preview:', proteinDetails.slice(0, 300));

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
    console.log('\n=== Round 2 Fix Verification Complete ===');
  }
}

run();
