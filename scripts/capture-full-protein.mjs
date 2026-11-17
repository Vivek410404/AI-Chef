import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\vivek\\.gemini\\antigravity\\brain\\dad403ea-3687-47ef-95af-a010ad0af209\\screenshots';
const JWT_SECRET = 'rasoi_iq_super_secret_jwt_key_2026';
const token = jwt.sign(
  { id: 'cmwjb5fej003ql3gghywo88u2', email: 'acbd4104@gmail.com', fullName: 'Vivek Panchani', role: 'CUSTOMER', householdId: 'cmwjbo8tb0001l3rks9ymiw4i', jti: 'test-3' },
  JWT_SECRET
);

async function run() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100 });
  await page.setCookie({ name: 'rasoi_access_token', value: token, domain: 'localhost', path: '/' });

  await page.goto('http://localhost:3000/#planner', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Open Goal Editor
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent?.includes('Adjust Protein Goal'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to Protein Goal Tracker
  await page.evaluate(() => {
    const el = document.querySelector('.bg-amber-50\\/40, div:has(> div > h3)');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 500));

  const shot = path.join(SCREENSHOT_DIR, '06_protein_tracker_full_view.png');
  await page.screenshot({ path: shot });
  console.log('Saved full view screenshot to:', shot);
  await browser.close();
}

run();
