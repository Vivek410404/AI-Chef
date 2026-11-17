import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'addr-no-hardcode-test' },
  JWT_SECRET
);

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 900 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });

  console.log('--- Step 1: Clean Visit (Zero Hardcoded Addresses) ---');
  await page.goto('http://localhost:3000/#basket', { waitUntil: 'networkidle2' });

  // Clear any existing localStorage to simulate clean fresh user experience
  await page.evaluate(() => {
    localStorage.removeItem('rasoi_delivery_addresses');
    localStorage.removeItem('rasoi_selected_address_id');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Verify that NO hardcoded Bengaluru or 560103 appears
  const pageText = await page.evaluate(() => document.body.innerText);
  if (pageText.includes('Green Glen Layout') || pageText.includes('Mindspace Tech Park') || pageText.includes('560103')) {
    console.error('FAIL: Hardcoded address detected on clean load!');
    process.exit(1);
  }
  console.log('PASS: Clean load contains zero hardcoded addresses.');

  await page.screenshot({ path: 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots/10_no_hardcoded_address_clean.png', fullPage: true });
  console.log('Saved screenshot 10_no_hardcoded_address_clean.png');

  console.log('--- Step 2: Open Address Modal & Fill Custom User Address ---');
  // Click "Add Delivery Address"
  const addButtons = await page.$$('button');
  let clickedAdd = false;
  for (const btn of addButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Add Delivery Address')) {
      await btn.click();
      clickedAdd = true;
      break;
    }
  }

  if (!clickedAdd) {
    console.error('FAIL: Could not find "Add Delivery Address" button');
    process.exit(1);
  }
  await new Promise(r => setTimeout(r, 600));

  // Verify modal is open and fields are completely blank
  const flatValue = await page.$eval('input[placeholder*="Sunshine Heights"]', el => el.value);
  const cityValue = await page.$eval('input[placeholder*="Mumbai, Ahmedabad"]', el => el.value);
  if (flatValue !== '' || cityValue !== '') {
    console.error(`FAIL: Modal fields are not blank! flat='${flatValue}', city='${cityValue}'`);
    process.exit(1);
  }
  console.log('PASS: Modal opened with completely clean/empty inputs.');

  // Type user's custom address
  await page.type('input[placeholder*="Sunshine Heights"]', 'Penthouse 702, Skyline Residency');
  await page.type('input[placeholder*="Near City Mall"]', 'Opposite Science City Road');
  await page.type('input[placeholder*="Mumbai, Ahmedabad"]', 'Ahmedabad');
  await page.type('input[placeholder*="Maharashtra, Gujarat"]', 'Gujarat');
  await page.type('input[placeholder*="380015"]', '380060');

  await page.screenshot({ path: 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots/11_address_entered_clean_modal.png' });
  console.log('Saved screenshot 11_address_entered_clean_modal.png');

  // Submit Save
  const saveBtn = await page.$('button[type="submit"]');
  await saveBtn.click();
  await new Promise(r => setTimeout(r, 800));

  console.log('--- Step 3: Verify Saved Address Renders on Page ---');
  const postSaveText = await page.evaluate(() => document.body.innerText);
  if (!postSaveText.includes('Ahmedabad (380060)') || !postSaveText.includes('Skyline Residency')) {
    console.error('FAIL: Newly saved address not rendered on basket view!');
    process.exit(1);
  }
  console.log('PASS: Custom user address rendered immediately after save.');

  console.log('--- Step 4: Page Reload Persistence Test ---');
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const reloadedText = await page.evaluate(() => document.body.innerText);
  if (!reloadedText.includes('Ahmedabad (380060)') || !reloadedText.includes('Skyline Residency')) {
    console.error('FAIL: Custom address did NOT persist after page reload!');
    process.exit(1);
  }
  if (reloadedText.includes('Green Glen Layout') || reloadedText.includes('560103')) {
    console.error('FAIL: Old hardcoded address leaked back on reload!');
    process.exit(1);
  }
  console.log('PASS: Custom address persists 100% across page reload without any hardcoded leaks.');

  await page.screenshot({ path: 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots/12_user_address_persists_after_reload.png', fullPage: true });
  console.log('Saved screenshot 12_user_address_persists_after_reload.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL DELIVERY ADDRESS TESTS PASSED WITH ZERO HARDCODED VALUES!');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
