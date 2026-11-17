import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/vivek/.gemini/antigravity/brain/dad403ea-3687-47ef-95af-a010ad0af209/screenshots';

async function main() {
  console.log('Launching browser to capture Phase 6.2.1 screenshots...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 1. Capture Orders page with disclosure notice
  console.log('Navigating to http://localhost:3000/orders...');
  await page.goto('http://localhost:3000/orders', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const ordersScreenshotPath = path.join(ARTIFACT_DIR, '26_orders_page_demo_disclosure_stepper.png');
  await page.screenshot({ path: ordersScreenshotPath, fullPage: false });
  console.log(`Captured: ${ordersScreenshotPath}`);

  // 2. Capture Shop page with normalized restock alert
  console.log('Navigating to http://localhost:3000/shop...');
  await page.goto('http://localhost:3000/shop', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  const shopScreenshotPath = path.join(ARTIFACT_DIR, '27_shop_pantry_restock_normalized.png');
  await page.screenshot({ path: shopScreenshotPath, fullPage: false });
  console.log(`Captured: ${shopScreenshotPath}`);

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
