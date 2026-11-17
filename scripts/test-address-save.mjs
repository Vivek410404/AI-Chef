import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'addr-test' },
  JWT_SECRET
);

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });

  await page.goto('http://localhost:3000/#basket', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Check initial address text
  const initialText = await page.evaluate(() => {
    const banner = document.querySelector('.bg-surface .shrink-0')?.innerText;
    const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50')?.innerText;
    return { banner, summary };
  });
  console.log('Initial address display:', initialText);

  // Click "Change" button
  console.log('Clicking Change address button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Change') && b.closest('.rounded-2xl'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Edit fields in modal
  console.log('Editing address modal fields...');
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('form input'));
    // flat
    const flat = inputs.find(i => i.placeholder?.includes('Flat'));
    if (flat) {
      flat.value = 'House 99, Shivalik Villa';
      flat.dispatchEvent(new Event('input', { bubbles: true }));
      flat.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // city
    const city = inputs.find(i => i.placeholder?.includes('Bengaluru') || i.value?.includes('Bengaluru'));
    if (city) {
      city.value = 'Ahmedabad';
      city.dispatchEvent(new Event('input', { bubbles: true }));
      city.dispatchEvent(new Event('change', { bubbles: true }));
    }
    // pincode
    const pin = inputs.find(i => i.placeholder?.includes('560103') || i.maxLength === 6);
    if (pin) {
      pin.value = '380015';
      pin.dispatchEvent(new Event('input', { bubbles: true }));
      pin.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 500));

  // Click "Save Address" button
  console.log('Submitting Save Address form...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('form button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check address display after save
  const afterSaveText = await page.evaluate(() => {
    const banner = document.querySelector('.bg-surface .shrink-0')?.innerText;
    const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50')?.innerText;
    return { banner, summary };
  });
  console.log('Address display after Save:', afterSaveText);

  // Now reload the page
  console.log('\nReloading page (simulating page refresh / next session)...');
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const afterReloadText = await page.evaluate(() => {
    const banner = document.querySelector('.bg-surface .shrink-0')?.innerText;
    const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50')?.innerText;
    return { banner, summary };
  });
  console.log('Address display after Reload:', afterReloadText);

  await browser.close();
}

run();
