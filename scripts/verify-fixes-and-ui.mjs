import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\vivek\\.gemini\\antigravity\\brain\\dad403ea-3687-47ef-95af-a010ad0af209\\screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';

// Create a valid session token for Vivek Panchani (1 member household)
const userPayload = {
  id: 'cmwjb5fej003ql3gghywo88u2',
  email: 'acbd4104@gmail.com',
  fullName: 'Vivek Panchani',
  role: 'CUSTOMER',
  householdId: 'cmwjbo8tb0001l3rks9ymiw4i',
  jti: `test-session-${Date.now()}`
};

const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

async function run() {
  console.log('=== Starting Real-Browser Fixes Verification with Vivek Session ===\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('error')) {
      console.log(`  [Browser Console] ${text}`);
    }
  });

  try {
    // Set authentication cookies for localhost
    await page.setCookie(
      {
        name: 'rasoi_access_token',
        value: token,
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'rasoi_refresh_token',
        value: 'mock-refresh-token',
        domain: 'localhost',
        path: '/'
      }
    );

    // -------------------------------------------------------------
    // TEST 1: Check Planner & Smart Basket counts
    // -------------------------------------------------------------
    console.log('--- Test 1: Smart Basket Counts on #planner ---');
    await page.goto('http://localhost:3000/#planner', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2500));

    // Get navbar basket count
    const navbarBasketCount = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button, nav button, header a, nav a'));
      const basketBtn = btns.find(b => b.textContent?.includes('Smart Basket'));
      if (!basketBtn) return 'Navbar basket button not found';
      return basketBtn.innerText.replace(/\n+/g, ' ');
    });
    console.log('Navbar Basket:', navbarBasketCount);

    // Get hero action button basket count
    const heroBasketCount = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Smart Basket ('));
      return btn ? btn.innerText.replace(/\n+/g, ' ') : 'Hero basket button not found';
    });
    console.log('Planner Hero Basket Button:', heroBasketCount);

    // Take screenshot of the planner page showing navbar + action buttons
    const plannerShot = path.join(SCREENSHOT_DIR, '01_planner_basket_counts_verified.png');
    await page.screenshot({ path: plannerShot });
    console.log('Saved planner screenshot:', plannerShot);

    // -------------------------------------------------------------
    // TEST 2: Open Cook Digest Modal & Verify Servings + Scrollbars
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Cook Digest Modal ---');
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Cook Digest'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Cook Digest button:', clicked);
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot of open Cook Digest modal
    const cookDigestShot = path.join(SCREENSHOT_DIR, '02_cook_digest_modal_verified.png');
    await page.screenshot({ path: cookDigestShot });
    console.log('Saved screenshot to:', cookDigestShot);

    // Inspect serving text
    const servingInfo = await page.evaluate(() => {
      const content = document.getElementById('maharaj-printable-content');
      if (!content) return { found: false, text: document.body.innerText.slice(0, 300) };
      const text = content.innerText;
      const servingMatches = text.match(/\b(?:\d+\s+Servings?|1\s+Serving)\b/gi) || [];
      return {
        found: true,
        servingMatches,
        fullTextPreview: text.slice(0, 400).replace(/\n+/g, ' | ')
      };
    });
    console.log('Cook Digest Serving Info:', servingInfo);

    // -------------------------------------------------------------
    // TEST 3: Check backdrop click outside dismissal
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Dismiss modal by clicking outside ---');
    // Click on top left corner outside modal dialog (x: 20, y: 20)
    await page.mouse.click(20, 20);
    await new Promise(r => setTimeout(r, 800));

    const isOpenAfterBackdropClick = await page.evaluate(() => {
      return !!document.getElementById('maharaj-printable-content');
    });
    console.log('Is modal open after clicking backdrop outside:', isOpenAfterBackdropClick);

    // -------------------------------------------------------------
    // TEST 4: Reopen and test Escape key dismissal
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Escape key dismissal ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Cook Digest'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));

    const isOpenAfterEscape = await page.evaluate(() => {
      return !!document.getElementById('maharaj-printable-content');
    });
    console.log('Is modal open after pressing Escape key:', isOpenAfterEscape);

    // Take screenshot of dismissed state
    const afterDismissShot = path.join(SCREENSHOT_DIR, '03_after_dismiss_verified.png');
    await page.screenshot({ path: afterDismissShot });
    console.log('Saved after-dismiss screenshot:', afterDismissShot);

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
    console.log('\n=== Verification Completed ===');
  }
}

run();
