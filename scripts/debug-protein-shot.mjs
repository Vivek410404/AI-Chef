import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'test' },
  JWT_SECRET
);

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/#planner', { waitUntil: 'networkidle2' });

  // Click 'Adjust Protein Goal' button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Adjust Protein Goal'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const outPath = 'C:\\Users\\vivek\\.gemini\\antigravity\\brain\\dad403ea-3687-47ef-95af-a010ad0af209\\screenshots\\protein_tracker_debug.png';
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);
  await browser.close();
}

run();
