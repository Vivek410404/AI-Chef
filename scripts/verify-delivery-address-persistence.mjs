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
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'addr-persist-test' },
  JWT_SECRET
);

async function run() {
  console.log('=== Starting Real-Browser Delivery Address Persistence Verification ===\n');

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });

  try {
    // -------------------------------------------------------------
    // STEP 1: Navigate to Basket
    // -------------------------------------------------------------
    console.log('--- Step 1: Navigate to #basket ---');
    await page.goto('http://localhost:3000/#basket', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const initial = await page.evaluate(() => {
      const banner = document.querySelector('.bg-surface .shrink-0')?.innerText.replace(/\n+/g, ' ');
      const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50 p')?.innerText;
      return { banner, summary };
    });
    console.log('Initial address:', initial);

    // -------------------------------------------------------------
    // STEP 2: Open Modal & Test Outside Click Dismissal
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Test Modal Open & Outside Click ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Change') && b.closest('.rounded-2xl'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const isModalOpen1 = await page.evaluate(() => !!document.querySelector('form button[type="submit"]'));
    console.log('Modal opened:', isModalOpen1);

    // Click outside on backdrop (x: 100, y: 150)
    await page.mouse.click(100, 150);
    await new Promise(r => setTimeout(r, 800));
    const isModalOpenAfterOutsideClick = await page.evaluate(() => !!document.querySelector('form button[type="submit"]'));
    console.log('Modal closed after clicking backdrop outside:', !isModalOpenAfterOutsideClick);

    // -------------------------------------------------------------
    // STEP 3: Reopen Modal, Edit Address & Save
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Edit Address & Click Save Address ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent?.includes('Change') && b.closest('.rounded-2xl'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Fill Flat
    const flatInput = await page.$('input[placeholder*="Flat"]');
    await flatInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await flatInput.type('Villa 42, Palm Meadows');

    // Fill Street
    const streetInput = await page.$('input[placeholder*="Bellandur"]');
    await streetInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await streetInput.type('Ramdev Nagar Road, Satellite');

    // Fill City
    const cityInput = await page.$('input[placeholder*="Bengaluru"]');
    await cityInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await cityInput.type('Ahmedabad');

    // Fill State
    const stateInput = await page.$('input[placeholder*="Karnataka"]');
    await stateInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await stateInput.type('Gujarat');

    // Fill Pincode
    const pinInput = await page.$('input[placeholder*="560103"]');
    await pinInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await pinInput.type('380015');

    // Take screenshot of filled modal
    const modalShot = path.join(SCREENSHOT_DIR, '07_address_modal_filled.png');
    await page.screenshot({ path: modalShot });
    console.log('Saved modal screenshot to:', modalShot);

    // Submit form
    console.log('Clicking Save Address button...');
    const saveBtn = await page.$('form button[type="submit"]');
    await saveBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    // Verify immediate UI update
    const afterSave = await page.evaluate(() => {
      const banner = document.querySelector('.bg-surface .shrink-0')?.innerText.replace(/\n+/g, ' ');
      const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50 p')?.innerText;
      const toast = document.querySelector('.animate-slide-up')?.innerText;
      return { banner, summary, toast };
    });
    console.log('Address display immediately after Save:');
    console.log('  Banner:', afterSave.banner);
    console.log('  Summary:', afterSave.summary);
    console.log('  Toast:', afterSave.toast);

    const savedShot = path.join(SCREENSHOT_DIR, '08_address_saved_toast.png');
    await page.screenshot({ path: savedShot });
    console.log('Saved post-save screenshot to:', savedShot);

    // -------------------------------------------------------------
    // STEP 4: Reload Page & Verify Persistence
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Reloading Page to Verify localStorage Persistence ---');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const afterReload = await page.evaluate(() => {
      const banner = document.querySelector('.bg-surface .shrink-0')?.innerText.replace(/\n+/g, ' ');
      const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50 p')?.innerText;
      return { banner, summary };
    });
    console.log('Address display after Reload:');
    console.log('  Banner:', afterReload.banner);
    console.log('  Summary:', afterReload.summary);

    const isPersisted = afterReload.banner.includes('Ahmedabad (380015)') &&
                        afterReload.summary.includes('Villa 42, Palm Meadows') &&
                        afterReload.summary.includes('Ahmedabad 380015');

    console.log('\n>>> PERSISTENCE VERIFICATION:', isPersisted ? 'PASSED (100% PERSISTED!)' : 'FAILED');

    // -------------------------------------------------------------
    // STEP 5: Quick Pill Switch (e.g. Office) & Persistence
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Test Quick Pill Switch (Office) ---');
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('.p-3\\.5.rounded-2xl.bg-cream-50 button'));
      const officePill = pills.find(b => b.textContent?.trim() === 'Office');
      if (officePill) officePill.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const officeAddress = await page.evaluate(() => {
      const banner = document.querySelector('.bg-surface .shrink-0')?.innerText.replace(/\n+/g, ' ');
      const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50 p')?.innerText;
      return { banner, summary };
    });
    console.log('After clicking Office pill:');
    console.log('  Banner:', officeAddress.banner);
    console.log('  Summary:', officeAddress.summary);

    // Reload again to check Office persistence
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const officeAfterReload = await page.evaluate(() => {
      const banner = document.querySelector('.bg-surface .shrink-0')?.innerText.replace(/\n+/g, ' ');
      const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50 p')?.innerText;
      return { banner, summary };
    });
    console.log('Office display after Reload:');
    console.log('  Banner:', officeAfterReload.banner);
    console.log('  Summary:', officeAfterReload.summary);

    const isOfficePersisted = officeAfterReload.banner.includes('Mumbai (400064)');
    console.log('>>> OFFICE PILL PERSISTENCE:', isOfficePersisted ? 'PASSED' : 'FAILED');

    // Switch back to Home (Ahmedabad)
    console.log('\n--- Step 6: Switch back to Home (Ahmedabad) ---');
    await page.evaluate(() => {
      const pills = Array.from(document.querySelectorAll('.p-3\\.5.rounded-2xl.bg-cream-50 button'));
      const homePill = pills.find(b => b.textContent?.trim() === 'Home');
      if (homePill) homePill.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const finalShot = path.join(SCREENSHOT_DIR, '09_address_ahmedabad_persisted.png');
    await page.screenshot({ path: finalShot });
    console.log('Saved final screenshot to:', finalShot);

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
    console.log('\n=== Delivery Address Persistence Verification Complete ===');
  }
}

run();
