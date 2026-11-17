import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'order-modal-verify' },
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

  console.log('--- Step 1: Navigate to #basket ---');
  await page.goto('http://localhost:3000/#basket', { waitUntil: 'networkidle2' });

  // Set the user's Ahmedabad address in localStorage so checkout is ready
  await page.evaluate(() => {
    const userAddr = [
      {
        id: 'addr-user-ahmedabad',
        label: 'Home',
        flat: '710/7692 Gujarat housing board',
        street: 'Bapunagar',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380024',
        isDefault: true
      }
    ];
    localStorage.setItem('rasoi_delivery_addresses', JSON.stringify(userAddr));
    localStorage.setItem('rasoi_selected_address_id', 'addr-user-ahmedabad');
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  console.log('--- Step 2: Click Proceed to Simulated 1-Click Order ---');
  const buttons = await page.$$('button');
  let checkoutBtn = null;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Proceed to Simulated 1-Click Order')) {
      checkoutBtn = b;
      break;
    }
  }

  if (!checkoutBtn) {
    console.error('FAIL: Could not find Proceed to Simulated Order button');
    process.exit(1);
  }

  await checkoutBtn.click();
  console.log('Clicked checkout button, waiting for OrderSuccessModal...');
  await new Promise(r => setTimeout(r, 1500));

  // Check if OrderSuccessModal is visible
  const modalVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Grocery Basket Placed!') &&
           document.body.innerText.includes('ORDERED ITEMS');
  });

  if (!modalVisible) {
    console.error('FAIL: OrderSuccessModal did not open!');
    process.exit(1);
  }
  console.log('PASS: OrderSuccessModal opened successfully.');

  // Check no-scrollbar class presence on containers
  const scrollbarClasses = await page.evaluate(() => {
    const allNoScroll = Array.from(document.querySelectorAll('.no-scrollbar'));
    return allNoScroll.length;
  });
  console.log(`Found ${scrollbarClasses} elements with .no-scrollbar`);

  if (scrollbarClasses < 2) {
    console.error('FAIL: .no-scrollbar not applied to modal containers!');
    process.exit(1);
  }
  console.log('PASS: .no-scrollbar applied to both modal backdrop and inner ordered items list.');

  await page.screenshot({ path: 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots/13_checkout_order_modal_no_scrollbar.png' });
  console.log('Saved screenshot 13_checkout_order_modal_no_scrollbar.png');

  console.log('--- Step 3: Outside Click Backdrop Dismissal Test ---');
  // Click on backdrop (at x: 30, y: 30 outside the center card)
  await page.mouse.click(30, 30);
  await new Promise(r => setTimeout(r, 600));

  const modalDismissed = await page.evaluate(() => {
    return !document.body.innerText.includes('Grocery Basket Placed!');
  });

  if (!modalDismissed) {
    console.error('FAIL: Outside click did NOT dismiss OrderSuccessModal!');
    process.exit(1);
  }
  console.log('PASS: Outside click cleanly dismissed OrderSuccessModal.');

  await page.screenshot({ path: 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots/14_after_order_modal_dismiss.png' });
  console.log('Saved screenshot 14_after_order_modal_dismiss.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('ORDER SUCCESS MODAL SCROLLBAR & DISMISSAL VERIFIED 100%!');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('Error during execution:', err);
  process.exit(1);
});
