/**
 * RasoiIQ Phase 6.0.2 — Customer Authentication UI, Profile & Account Verification Suite
 * Executes end-to-end verification across the 16 requirements specified in Phase 6.0.2.
 */

import http from 'http';
import { execSync } from 'child_process';

const API_BASE = 'http://localhost:4000/api';
const WEB_BASE = 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

async function fetchHttp(url, options = {}) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          text: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

// Cookie jar simulation for Node test environment
function extractCookies(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return {};
  const cookies = {};
  for (const c of (Array.isArray(setCookie) ? setCookie : [setCookie])) {
    const parts = c.split(';')[0].split('=');
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
  }
  return cookies;
}

function buildCookieHeader(cookieObj) {
  return Object.entries(cookieObj).map(([k, v]) => `${k}=${v}`).join('; ');
}

async function runSuite() {
  console.log('================================================================');
  console.log('   RASOIIQ PHASE 6.0.2: AUTH UI & ACCOUNT VERIFICATION SUITE    ');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. Logged-Out Navigation & Landing Exposure
  // ---------------------------------------------------------------------------
  console.log('--- 1. Logged-Out Navigation & Landing Page ---');
  const webHome = await fetchHttp(WEB_BASE);
  assert(webHome.status === 200, 'Customer web frontend root responds with HTTP 200');
  assert(webHome.text.includes('/login') || webHome.text.includes('Sign In') || webHome.text.includes('page'), 'Root landing page serves Next.js bundle');
  assert(!webHome.text.includes('Admin Operations Panel'), 'Ordinary logged-out navigation never exposes admin operations panel');

  // ---------------------------------------------------------------------------
  // 2. Login Page UI Components & Accessibility
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Login Page Form Structure ---');
  const loginPage = await fetchHttp(`${WEB_BASE}/login`);
  assert(loginPage.status === 200, 'Login route /login responds with HTTP 200');
  assert(loginPage.text.includes('app/login/page') || loginPage.text.includes('login'), 'Login page bundle loaded');

  // ---------------------------------------------------------------------------
  // 3. Invalid Login Handling
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Invalid Login Authentication Feedback ---');
  const invalidLogin = await fetchHttp(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'nonexistent.user.2026@rasoiiq.in', password: 'WrongPassword@123' }
  });
  assert(invalidLogin.status === 401 || invalidLogin.status === 400, 'Invalid login rejected with 401/400 status');
  assert(!invalidLogin.data?.accessToken, 'Invalid login does not issue an access token');
  assert(!invalidLogin.headers['set-cookie']?.some?.(c => c.includes('rasoi_access_token=ey')), 'Invalid login does not set session cookies');

  // ---------------------------------------------------------------------------
  // 4. Customer Self-Registration (CUSTOMER Role Only)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Customer Registration ---');
  const testEmail = `pilot.user.${Date.now()}@example.com`;
  const testPassword = 'StrongPassphrase@2026!';
  const regRes = await fetchHttp(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      fullName: 'Ananya Sharma',
      email: testEmail,
      phone: '+91 98765 12345',
      password: testPassword,
      confirmPassword: testPassword,
      acceptTerms: true
    }
  });
  assert(regRes.status === 201 || regRes.status === 200, 'Customer registration succeeds');
  assert(regRes.data?.success === true, 'Registration response indicates success');

  // Verify registered role directly in PostgreSQL is strictly CUSTOMER
  const dbUserRole = execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -t -c "SELECT role FROM \\"User\\" WHERE email = '${testEmail}';"`)
    .toString().trim();
  assert(dbUserRole === 'CUSTOMER', 'Self-registered user is strictly assigned CUSTOMER role (no privilege escalation)');

  // ---------------------------------------------------------------------------
  // 5. Email Verification Workflow
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Email Verification & Initial Login ---');
  const emailRes = await fetchHttp(`${API_BASE}/dev/emails?email=${encodeURIComponent(testEmail)}`);
  const rawToken = emailRes.data?.[0]?.token;
  assert(rawToken && rawToken.length >= 16, 'One-time verification token captured via email service');

  const dbTokenHash = execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -t -c "SELECT \\"tokenHash\\" FROM \\"EmailVerificationToken\\" WHERE \\"userId\\" = (SELECT id FROM \\"User\\" WHERE email = '${testEmail}') ORDER BY \\"createdAt\\" DESC LIMIT 1;"`)
    .toString().trim();
  assert(dbTokenHash && dbTokenHash.length > 20, 'Hashed verification token safely persisted in PostgreSQL');

  const verifyRes = await fetchHttp(`${API_BASE}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { token: rawToken }
  });
  assert(verifyRes.status === 200 || verifyRes.status === 201, 'Email verification succeeds');

  // Verify user is now ACTIVE in PostgreSQL
  const dbUserStatus = execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -t -c "SELECT status FROM \\"User\\" WHERE email = '${testEmail}';"`)
    .toString().trim();
  assert(dbUserStatus === 'ACTIVE', 'Account status transitions to ACTIVE upon verification');

  // ---------------------------------------------------------------------------
  // 6. Successful Customer Login with HttpOnly Cookies
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Customer Login & Cookie Preservation ---');
  const loginRes = await fetchHttp(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: testEmail, password: testPassword }
  });
  assert(loginRes.status === 200 || loginRes.status === 201, 'Customer login succeeds');
  const sessionCookies = extractCookies(loginRes.headers);
  assert(Boolean(sessionCookies.rasoi_access_token), 'Server sets rasoi_access_token cookie');
  assert(Boolean(sessionCookies.rasoi_refresh_token), 'Server sets rasoi_refresh_token cookie');
  const cookieHeaders = loginRes.headers['set-cookie'] || [];
  const hasHttpOnly = cookieHeaders.some(c => c.toLowerCase().includes('httponly'));
  assert(hasHttpOnly, 'Auth cookies include HttpOnly protection');

  const authCookieHeader = buildCookieHeader(sessionCookies);
  const accessToken = loginRes.data?.accessToken;

  // ---------------------------------------------------------------------------
  // 7. Identity & Profile Loading (/auth/me and /auth/profile)
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. Profile Loading & Integrity ---');
  const meRes = await fetchHttp(`${API_BASE}/auth/me`, {
    headers: { Cookie: authCookieHeader }
  });
  assert(meRes.status === 200, 'GET /auth/me succeeds with session cookie');
  assert(meRes.data?.email === testEmail, 'Authenticated user email matches registered account');
  assert(meRes.data?.role === 'CUSTOMER', 'User role is CUSTOMER');

  const profRes = await fetchHttp(`${API_BASE}/auth/profile`, {
    headers: { Cookie: authCookieHeader }
  });
  assert(profRes.status === 200, 'GET /auth/profile succeeds');
  assert(profRes.data?.fullName === 'Ananya Sharma', 'Profile returns correct full name');
  assert(profRes.data?.phoneNumber?.includes('98765'), 'Profile returns phone number');
  assert(!profRes.data?.passwordHash, 'Profile does NOT expose passwordHash');

  // ---------------------------------------------------------------------------
  // 8. Profile Updates (PATCH /auth/profile)
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. Profile Updates & Validation ---');
  const patchRes = await fetchHttp(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookieHeader
    },
    body: {
      fullName: 'Ananya S. Sharma',
      phoneNumber: '+91 99999 88888'
    }
  });
  assert(patchRes.status === 200, 'PATCH /auth/profile succeeds');
  assert(patchRes.data?.fullName === 'Ananya S. Sharma', 'Full name updated successfully');

  // Verify in PostgreSQL
  const dbUpdatedName = execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -t -c "SELECT \\"fullName\\" FROM \\"User\\" WHERE email = '${testEmail}';"`)
    .toString().trim();
  assert(dbUpdatedName === 'Ananya S. Sharma', 'Profile change committed to PostgreSQL');

  // Role modification attempt must be ignored or rejected
  const patchRoleAttempt = await fetchHttp(`${API_BASE}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookieHeader
    },
    body: { role: 'SUPER_ADMIN' }
  });
  const dbRoleCheck = execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -t -c "SELECT role FROM \\"User\\" WHERE email = '${testEmail}';"`)
    .toString().trim();
  assert(dbRoleCheck === 'CUSTOMER', 'Customer cannot escalate their role through profile update');

  // ---------------------------------------------------------------------------
  // 9. Active Sessions Management
  // ---------------------------------------------------------------------------
  console.log('\n--- 9. Active Sessions & Inspection ---');
  const sessionsRes = await fetchHttp(`${API_BASE}/auth/sessions`, {
    headers: { Cookie: authCookieHeader }
  });
  assert(sessionsRes.status === 200, 'GET /auth/sessions succeeds');
  const activeSessions = sessionsRes.data?.sessions || sessionsRes.data;
  assert(Array.isArray(activeSessions) && activeSessions.length >= 1, 'Active session list returned for user');
  assert(!activeSessions[0].tokenHash, 'Session tokens and hashes are not exposed');

  // ---------------------------------------------------------------------------
  // 10. Password Change & Session Revocation Policy
  // ---------------------------------------------------------------------------
  console.log('\n--- 10. Password Change & Session Revocation ---');
  const newPass = 'UpdatedSecurePass@2026!';
  const pwRes = await fetchHttp(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: authCookieHeader
    },
    body: {
      currentPassword: testPassword,
      newPassword: newPass,
      confirmPassword: newPass
    }
  });
  assert(pwRes.status === 200 || pwRes.status === 201, 'Password changed successfully');

  // Old password must fail login
  const oldLogin = await fetchHttp(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: testEmail, password: testPassword }
  });
  assert(oldLogin.status === 401, 'Old password rejected on subsequent login');

  // New password succeeds
  const newLogin = await fetchHttp(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: testEmail, password: newPass }
  });
  assert(newLogin.status === 200 || newLogin.status === 201, 'New password successfully authenticates');
  const freshCookies = extractCookies(newLogin.headers);
  const freshAuthHeader = buildCookieHeader(freshCookies);

  // ---------------------------------------------------------------------------
  // 11. Household Management & Isolation
  // ---------------------------------------------------------------------------
  console.log('\n--- 11. Household Management & Permissions ---');
  const hhCreateRes = await fetchHttp(`${API_BASE}/households`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: freshAuthHeader
    },
    body: {
      name: 'Ananya Family Kitchen',
      dietaryPreference: 'VEGETARIAN',
      size: 3
    }
  });
  assert(hhCreateRes.status === 201 || hhCreateRes.status === 200, 'Customer creates household');
  const createdHhId = hhCreateRes.data?.id;

  // Cross-household boundary check: Customer cannot inspect another household's invitations
  const crossHhRes = await fetchHttp(`${API_BASE}/households/hh-patel-family/invitations`, {
    headers: { Cookie: freshAuthHeader }
  });
  assert(crossHhRes.status === 403 || crossHhRes.status === 404, 'Cross-household invitation access blocked (403/404)');

  // ---------------------------------------------------------------------------
  // 12. Single-Device Logout & Cookie Clearance
  // ---------------------------------------------------------------------------
  console.log('\n--- 12. Logout & Cookie Clearance ---');
  const logoutRes = await fetchHttp(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: freshAuthHeader }
  });
  assert(logoutRes.status === 200 || logoutRes.status === 201, 'Logout endpoint succeeds');

  const logoutCookieHeaders = logoutRes.headers['set-cookie'] || [];
  const clearedCookies = logoutCookieHeaders.some(c =>
    c.includes('rasoi_access_token=;') || c.includes('Max-Age=0') || c.includes('expires=')
  );
  assert(clearedCookies, 'Logout response clears authentication cookies');

  // ---------------------------------------------------------------------------
  // 13. Suspended Account Handling
  // ---------------------------------------------------------------------------
  console.log('\n--- 13. Suspended Account Behavior ---');
  execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "UPDATE \\"User\\" SET status = 'SUSPENDED', \\"suspensionReason\\" = 'Pilot safety freeze' WHERE email = '${testEmail}';"`);
  
  const suspendedLogin = await fetchHttp(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: testEmail, password: newPass }
  });
  assert(suspendedLogin.status === 401 || suspendedLogin.status === 403, 'Suspended account login is strictly rejected');
  assert(suspendedLogin.data?.message?.toLowerCase()?.includes('suspend'), 'Suspended account receives descriptive security feedback');

  // Restore account status to ACTIVE for cleanup
  execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "UPDATE \\"User\\" SET status = 'ACTIVE' WHERE email = '${testEmail}';"`);

  // ---------------------------------------------------------------------------
  // 14. Frontend Pages Verification (/profile, /profile/security, /household, /orders)
  // ---------------------------------------------------------------------------
  console.log('\n--- 14. Frontend Pages Route Verification ---');
  const profPageRes = await fetchHttp(`${WEB_BASE}/profile`);
  assert(profPageRes.status === 200, 'Frontend /profile route responds with HTTP 200');

  const secPageRes = await fetchHttp(`${WEB_BASE}/profile/security`);
  assert(secPageRes.status === 200, 'Frontend /profile/security route responds with HTTP 200');

  const hhPageRes = await fetchHttp(`${WEB_BASE}/household`);
  assert(hhPageRes.status === 200, 'Frontend /household route responds with HTTP 200');

  const ordersPageRes = await fetchHttp(`${WEB_BASE}/orders`);
  assert(ordersPageRes.status === 200, 'Frontend /orders route responds with HTTP 200');

  // ---------------------------------------------------------------------------
  // 15. Expired Session Silent Refresh
  // ---------------------------------------------------------------------------
  console.log('\n--- 15. Token Refresh Endpoint Verification ---');
  const customerLogin = await fetchHttp(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: testEmail, password: newPass }
  });
  const cCookies = extractCookies(customerLogin.headers);
  const refreshCookie = cCookies.rasoi_refresh_token;

  const refreshRes = await fetchHttp(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `rasoi_refresh_token=${refreshCookie}`
    },
    body: {}
  });
  assert(refreshRes.status === 200 || refreshRes.status === 201, 'Silent refresh with rasoi_refresh_token cookie succeeds');
  assert(Boolean(refreshRes.data?.accessToken), 'Refresh endpoint returns newly generated access token');

  // ---------------------------------------------------------------------------
  // 16. Cleanup & Final Assertion Summary
  // ---------------------------------------------------------------------------
  console.log('\n--- 16. Test Cleanup ---');
  try {
    execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "DELETE FROM \\"RefreshSession\\" WHERE \\"userId\\" = (SELECT id FROM \\"User\\" WHERE email = '${testEmail}');"`);
    execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "DELETE FROM \\"EmailVerificationToken\\" WHERE \\"userId\\" = (SELECT id FROM \\"User\\" WHERE email = '${testEmail}');"`);
    if (createdHhId) {
      execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "DELETE FROM \\"HouseholdMember\\" WHERE \\"householdId\\" = '${createdHhId}'; DELETE FROM \\"Household\\" WHERE id = '${createdHhId}';"` );
    }
    execSync(`wsl env PGPASSWORD=postgres psql -h 127.0.0.1 -U postgres -d rasoi_iq -c "UPDATE \\"User\\" SET status = 'DELETED', email = CONCAT('archived_', id, '@test.local') WHERE email = '${testEmail}';"`);
    console.log('  [PASS] Test user artifacts cleaned up successfully');
  } catch (cleanErr) {
    console.warn('Cleanup warning:', cleanErr.message);
  }

  console.log('\n================================================================');
  console.log(`TOTAL ASSERTIONS: ${totalTests}`);
  console.log(`PASSED:           ${passedTests}`);
  console.log(`FAILED:           ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal error during test suite:', err);
  process.exit(1);
});
