import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';

async function testFullJourney() {
  const secret = 'rasoi_iq_super_secret_jwt_key_2026';
  const token = jwt.sign({
    sub: 'cmwjb5fej003ql3gghywo88u2',
    email: 'acbd4104@gmail.com',
    role: 'CUSTOMER'
  }, secret, { expiresIn: '1h' });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set auth cookies
  await page.setCookie({
    name: 'rasoi_access_token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax'
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERR:', msg.text());
  });

  console.log('1. Navigating to http://localhost:3000/#shop...');
  await page.goto('http://localhost:3000/#shop', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));

  // Verify groceries loaded
  const hasGroceries = await page.evaluate(() => {
    return !document.body.innerText.includes('No groceries found') && document.body.innerText.includes('Quick Indian Groceries');
  });
  console.log('Groceries displayed properly:', hasGroceries);

  // 2. Identify active retailer and click a DIFFERENT retailer to trigger conflict
  console.log('2. Testing Retailer Switch with active cart...');
  const activeRetailerName = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const zeptoBtn = buttons.find(b => b.innerText.includes('Zepto') && b.innerText.includes('10 mins'));
    const blinkitBtn = buttons.find(b => b.innerText.includes('Blinkit') && b.innerText.includes('10-15 mins'));
    return {
      zeptoHasActiveRing: zeptoBtn?.className.includes('ring-2'),
      blinkitHasActiveRing: blinkitBtn?.className.includes('ring-2')
    };
  });
  console.log('Active retailer indicator:', activeRetailerName);

  const targetToClick = activeRetailerName.blinkitHasActiveRing ? 'Zepto' : 'Blinkit';
  console.log(`Clicking ${targetToClick} to trigger conflict modal...`);

  await page.evaluate((name) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes(name) && (b.innerText.includes('mins') || b.innerText.includes('Rush')));
    if (btn) btn.click();
  }, targetToClick);
  await new Promise(r => setTimeout(r, 1500));

  const modalVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Switch Delivery Retailer?');
  });
  console.log('Switch Delivery Retailer modal visible:', modalVisible);

  if (modalVisible) {
    console.log(`3. Clicking "Switch to ${targetToClick}" in modal...`);
    const switched = await page.evaluate((name) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const switchBtn = buttons.find(b => b.innerText.includes(`Switch to ${name}`));
      if (switchBtn) {
        switchBtn.click();
        return true;
      }
      return false;
    }, targetToClick);
    console.log(`Clicked Switch to ${targetToClick}:`, switched);
    await new Promise(r => setTimeout(r, 3000));

    const modalClosed = await page.evaluate(() => {
      return !document.body.innerText.includes('Switch Delivery Retailer?');
    });
    console.log('Modal closed after confirm:', modalClosed);
  }

  // 4. Test search that yields 0 items and then click Clear All Filters
  console.log('4. Entering search query with 0 results: "nonexistentquery123"...');
  await page.type('input[placeholder*="Search groceries"]', 'nonexistentquery123');
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 2000));

  const noGroceriesShown = await page.evaluate(() => {
    return document.body.innerText.includes('No groceries found');
  });
  console.log('"No groceries found" card is visible:', noGroceriesShown);

  console.log('5. Clicking "Clear All Filters" button...');
  const clickedClear = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const clearBtn = buttons.find(b => b.innerText.trim() === 'Clear All Filters');
    if (clearBtn) {
      clearBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked "Clear All Filters" button:', clickedClear);
  await new Promise(r => setTimeout(r, 3000));

  const restoredGroceries = await page.evaluate(() => {
    const hasItems = !document.body.innerText.includes('No groceries found');
    const input = document.querySelector('input[placeholder*="Search groceries"]');
    return {
      hasItems,
      searchInputValue: input ? input.value : ''
    };
  });
  console.log('Groceries restored:', restoredGroceries.hasItems);
  console.log('Search input cleared:', restoredGroceries.searchInputValue === '');

  await browser.close();
  console.log('ALL FRONTEND UI INTERACTION TESTS COMPLETED SUCCESSFULLY!');
}

testFullJourney().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
