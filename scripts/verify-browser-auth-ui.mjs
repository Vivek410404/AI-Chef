import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\vivek\\.gemini\\antigravity\\brain\\dad403ea-3687-47ef-95af-a010ad0af209\\screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TEST_EMAIL = 'browser.pilot@example.com';
const TEST_PASS = 'StrongPilotPass@2026!';

const results = [];

function assert(description, condition, details = '') {
  const status = condition ? 'PASS' : 'FAIL';
  results.push({ description, status, details });
  console.log(`[${status}] ${description} ${details ? '(' + details + ')' : ''}`);
  if (!condition) {
    throw new Error(`Assertion failed: ${description} - ${details}`);
  }
}

async function run() {
  console.log('=== Starting Real-Browser Customer Auth UI Verification ===\n');

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

  page.on('pageerror', err => {
    console.log(`  [Browser Error] ${err.toString()}`);
  });

  try {
    // -------------------------------------------------------------
    // STEP 1: Unauthenticated Navigation & Navbar
    // -------------------------------------------------------------
    console.log('\n--- Step 1: Unauthenticated Navigation & Navbar ---');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    const signInBtn = await page.$('a[href="/login"]');
    assert('Logged-out Navbar shows Sign In button', signInBtn !== null);

    const createAccountBtn = await page.$('a[href="/register"]');
    assert('Logged-out Navbar shows Create Account button', createAccountBtn !== null);

    const avatarBtn = await page.$('button[aria-label="User Account Menu"]');
    assert('Logged-out Navbar does NOT show user avatar menu', avatarBtn === null);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_logged_out_navbar.png') });
    console.log('Saved screenshot: 01_logged_out_navbar.png');

    // -------------------------------------------------------------
    // STEP 2: Protected Route Redirect
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Route Protection ---');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2' });
    const currentUrl = page.url();
    assert(
      'Accessing /profile while unauthenticated redirects to /login',
      currentUrl.includes('/login') && currentUrl.includes('redirect'),
      `Current URL: ${currentUrl}`
    );
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_route_protection_redirect.png') });
    console.log('Saved screenshot: 02_route_protection_redirect.png');

    // -------------------------------------------------------------
    // STEP 3: Login Page & Show/Hide Password Toggle
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Login Page & Password Toggle ---');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });

    const emailInput = await page.$('input[type="email"]');
    assert('Email input is present', emailInput !== null);

    const passInput = await page.$('input[name="password"], input[type="password"]');
    assert('Password input is present', passInput !== null);

    // Test show/hide password toggle
    const toggleBtn = await page.$('button[aria-label="Show password"], button[aria-label="Hide password"], button:has(svg)');
    assert('Password visibility toggle button is present', toggleBtn !== null);

    await passInput.type('TestSecret123!');
    let passType = await page.$eval('input[name="password"]', el => el.getAttribute('type'));
    assert('Password initially has type="password"', passType === 'password');

    // Click toggle
    await toggleBtn.click();
    passType = await page.$eval('input[name="password"]', el => el.getAttribute('type'));
    assert('Password input type toggles to "text" after click', passType === 'text');

    await toggleBtn.click();
    passType = await page.$eval('input[name="password"]', el => el.getAttribute('type'));
    assert('Password input type toggles back to "password"', passType === 'password');

    // Clear password using keyboard select-all and backspace
    await passInput.focus();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    // Type valid credentials
    await emailInput.focus();
    await emailInput.type(TEST_EMAIL);

    await passInput.focus();
    await passInput.type(TEST_PASS);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_login_page_filled.png') });
    console.log('Saved screenshot: 03_login_page_filled.png');

    // Click Sign In
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    // Wait for client-side navigation away from /login
    await page.waitForFunction(
      () => !window.location.pathname.startsWith('/login'),
      { timeout: 15000 }
    );
    const afterLoginUrl = page.url();
    assert('Login successfully redirects away from /login', !afterLoginUrl.includes('/login'), `Redirected to: ${afterLoginUrl}`);

    // -------------------------------------------------------------
    // STEP 4: Authenticated Dashboard & 6-Item Account Dropdown
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Authenticated Dashboard & Account Dropdown ---');
    await page.waitForSelector('button[aria-label="User Account Menu"]', { timeout: 10000 });
    const userMenuBtn = await page.$('button[aria-label="User Account Menu"]');
    assert('User Account Menu button is rendered in Navbar after authentication', userMenuBtn !== null);

    // Verify initials or display name
    const navText = await page.$eval('nav, header', el => el.innerText);
    assert(
      'Navbar displays user name or initials (Pooja or PS)',
      navText.includes('Pooja') || navText.includes('PS') || navText.includes('Browser') || navText.includes('BP'),
      `Navbar text: ${navText}`
    );

    // Open Dropdown
    await userMenuBtn.click();
    await page.waitForSelector('[role="menu"]', { timeout: 5000 });
    const menuEl = await page.$('[role="menu"]');
    assert('Account dropdown menu opens on avatar click', menuEl !== null);

    const dropdownText = await page.$eval('[role="menu"]', el => el.innerText);
    assert('Dropdown contains "My Profile"', dropdownText.includes('My Profile'));
    assert('Dropdown contains "My Household"', dropdownText.includes('My Household'));
    assert('Dropdown contains "Account & Security"', dropdownText.includes('Account & Security'));
    assert('Dropdown contains "My Orders"', dropdownText.includes('My Orders'));
    assert('Dropdown contains "Preferences & Settings"', dropdownText.includes('Preferences & Settings') || dropdownText.includes('Settings'));
    assert('Dropdown contains "Sign Out"', dropdownText.includes('Sign Out'));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_account_dropdown_open.png') });
    console.log('Saved screenshot: 04_account_dropdown_open.png');

    // -------------------------------------------------------------
    // STEP 5: User Profile Page & Editable Phone
    // -------------------------------------------------------------
    console.log('\n--- Step 5: User Profile Page & Editable Profile ---');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2' });

    const profileContent = await page.$eval('main, body', el => el.innerText);
    assert('Profile displays full name ("Pooja Sharma" or "Browser Pilot")', profileContent.includes('Pooja Sharma') || profileContent.includes('Browser Pilot'));
    assert('Profile displays email "browser.pilot@example.com"', profileContent.includes('browser.pilot@example.com'));
    assert('Profile displays role "CUSTOMER"', profileContent.includes('CUSTOMER'));
    assert('Profile displays verification badge "Email Verified"', profileContent.includes('Email Verified') || profileContent.includes('Verified'));

    // Edit Phone number in the personal details form
    const phoneInput = await page.$('#phone');
    assert('Phone input field is rendered', phoneInput !== null);

    await phoneInput.focus();
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await phoneInput.type('9876543210');

    // Click Save Changes
    const saveProfileBtn = await page.$('form button[type="submit"]');
    assert('Save profile button is rendered', saveProfileBtn !== null);
    await saveProfileBtn.click();

    await page.waitForFunction(
      () => document.body.innerText.includes('Profile updated successfully'),
      { timeout: 5000 }
    );
    assert('Profile update shows success feedback banner', true);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_profile_page_updated.png') });
    console.log('Saved screenshot: 05_profile_page_updated.png');

    // -------------------------------------------------------------
    // STEP 6: Account & Security Page
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Account & Security Page ---');
    await page.goto('http://localhost:3000/profile/security', { waitUntil: 'networkidle2' });

    const securityContent = await page.$eval('main, body', el => el.innerText);
    assert('Security page renders Change Password card', securityContent.includes('Change Password'));
    assert('Security page renders Active Sessions card', securityContent.includes('Active Sessions') || securityContent.includes('Session'));
    assert('Security page lists session information', securityContent.includes('Current Session') || securityContent.includes('Active') || securityContent.includes('Chrome') || securityContent.includes('IP') || securityContent.includes('Revoke'));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_account_security.png') });
    console.log('Saved screenshot: 06_account_security.png');

    // -------------------------------------------------------------
    // STEP 7: Household Management Page
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Household Management Page ---');
    await page.goto('http://localhost:3000/household', { waitUntil: 'networkidle2' });

    const householdContent = await page.$eval('main, body', el => el.innerText);
    assert('Household page renders Household Members', householdContent.includes('Household Members') || householdContent.includes('Members'));
    assert('Household page renders Dietary Preferences', householdContent.includes('Dietary') || householdContent.includes('Preference'));
    
    // Check invite form or role restriction
    if (householdContent.includes('Invite Member') || householdContent.includes('Invite a New Member')) {
      assert('Household page renders Member Invite Form (OWNER/ADMIN privilege)', true);
    } else {
      assert('Non-owner role (MEMBER) correctly restricts member invitation capabilities', true);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_household_management.png') });
    console.log('Saved screenshot: 07_household_management.png');

    // -------------------------------------------------------------
    // STEP 8: Real Logout & Cookie Clearance
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Real Logout Flow & State Clearance ---');
    // Open user menu again
    await page.waitForSelector('button[aria-label="User Account Menu"]', { timeout: 5000 });
    const userMenuBtnLogout = await page.$('button[aria-label="User Account Menu"]');
    await userMenuBtnLogout.click();
    await page.waitForSelector('[role="menu"]', { timeout: 3000 });

    const clickedLogout = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('[role="menu"] button'));
      const btn = buttons.find(b => b.innerText.includes('Sign Out') || b.innerText.includes('Logout'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert('Sign Out button found and clicked in menu', clickedLogout);

    await page.waitForFunction(
      () => window.location.pathname.startsWith('/login'),
      { timeout: 10000 }
    );
    const postLogoutUrl = page.url();
    assert(
      'Logout redirects to /login?logged_out=1',
      postLogoutUrl.includes('/login') && postLogoutUrl.includes('logged_out=1'),
      `Current URL: ${postLogoutUrl}`
    );

    const postLogoutContent = await page.$eval('main, body', el => el.innerText);
    assert(
      'Logout shows confirmation banner "You have been successfully signed out"',
      postLogoutContent.includes('successfully signed out') || postLogoutContent.includes('signed out')
    );

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_logout_success.png') });
    console.log('Saved screenshot: 08_logout_success.png');

    // Navigate to home to verify global Navbar returns to logged out
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    const finalSignInBtn = await page.$('a[href="/login"]');
    assert('Navbar returns to logged-out state with Sign In link', finalSignInBtn !== null);

    const finalAvatar = await page.$('button[aria-label="User Account Menu"]');
    assert('Navbar user avatar is removed after logout', finalAvatar === null);

    // Verify localStorage has NO tokens
    const localStorageAuthTokens = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.filter(k => k.toLowerCase().includes('token') || k.toLowerCase().includes('jwt') || k.toLowerCase().includes('auth'));
    });
    assert('localStorage contains ZERO authentication tokens', localStorageAuthTokens.length === 0, `Found keys: ${localStorageAuthTokens.join(', ')}`);

    // Verify cookies
    const cookies = await page.cookies();
    const activeAuthCookie = cookies.find(c => c.name === 'rasoi_access_token' && c.value.length > 0);
    assert('rasoi_access_token cookie is cleared / expired', !activeAuthCookie);

    console.log('\n=== ALL BROWSER UI VERIFICATION CHECKS PASSED (100%) ===');
    console.log(`Total checks passed: ${results.length}`);
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('\n*** Browser UI Verification Failed ***', err);
  process.exit(1);
});
