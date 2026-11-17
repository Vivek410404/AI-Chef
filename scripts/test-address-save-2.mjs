import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'addr-test-2' },
  JWT_SECRET
);

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });

  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto('http://localhost:3000/#basket', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Click "Change" button
  console.log('Clicking Change address button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Change') && b.closest('.rounded-2xl'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Clear and type Flat
  const flatInput = await page.$('input[placeholder*="Flat"]');
  if (flatInput) {
    await flatInput.click({ clickCount: 3 });
    await flatInput.type('Shivalik Villa 101');
  }

  // Clear and type City
  const cityInput = await page.$('input[placeholder*="Bengaluru"]');
  if (cityInput) {
    await cityInput.click({ clickCount: 3 });
    await cityInput.type('Ahmedabad');
  }

  // Clear and type PIN
  const pinInput = await page.$('input[placeholder*="560103"]');
  if (pinInput) {
    await pinInput.click({ clickCount: 3 });
    await pinInput.type('380015');
  }

  // Click Save
  const saveBtn = await page.$('button[type="submit"]');
  await saveBtn.click();
  await new Promise(r => setTimeout(r, 1000));

  const afterSaveText = await page.evaluate(() => {
    const banner = document.querySelector('.bg-surface .shrink-0')?.innerText;
    const summary = document.querySelector('.p-3\\.5.rounded-2xl.bg-cream-50')?.innerText;
    return { banner, summary };
  });
  console.log('Address display after real typing and Save:', afterSaveText);

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
