import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'rasoi_iq_super_secret_jwt_key_2026';
const API_URL = 'http://localhost:4000/api';

async function testCsrf() {
  console.log('================================================================');
  console.log('🛡️  RasoiIQ Phase 6 — Strict CSRF & Origin Validation Suite');
  console.log('================================================================\n');

  // Find pilot user
  const user = await prisma.user.findFirst({
    where: { email: 'acbd4104@gmail.com' },
    include: { householdMembers: true }
  });
  const householdId = user.householdMembers[0]?.householdId;

  const token = jwt.sign({
    sub: user.id,
    id: user.id,
    email: user.email,
    role: user.role,
    householdId
  }, JWT_SECRET, { expiresIn: '1h' });

  const cookieCsrfToken = 'csrf_token_secret_1234567890abcdef1234567890abcdef';
  const cookieHeader = `rasoi_access_token=${token}; rasoi_csrf_token=${cookieCsrfToken}`;

  const tests = [
    {
      name: '1. Legitimate same-origin request with valid CSRF token succeeds',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': 'http://localhost:3000',
        'X-CSRF-Token': cookieCsrfToken
      },
      expectedStatus: 201
    },
    {
      name: '2. Malicious cross-origin request (Origin: http://evil-attacker.com) rejected (403)',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': 'http://evil-attacker.com',
        'X-CSRF-Token': cookieCsrfToken
      },
      expectedStatus: 403
    },
    {
      name: '3. Malicious cross-origin request via Referer (Referer: http://malicious.org/path) rejected (403)',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Referer': 'http://malicious.org/csrf-exploit',
        'X-CSRF-Token': cookieCsrfToken
      },
      expectedStatus: 403
    },
    {
      name: '4. Cookie-authenticated request missing both Origin and Referer rejected (403)',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'X-CSRF-Token': cookieCsrfToken
      },
      expectedStatus: 403
    },
    {
      name: '5. Request with X-Requested-With alone (missing X-CSRF-Token) rejected (403)',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': 'http://localhost:3000',
        'X-Requested-With': 'XMLHttpRequest'
      },
      expectedStatus: 403
    },
    {
      name: '6. Request with mismatched/tampered X-CSRF-Token rejected (403)',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': 'http://localhost:3000',
        'X-CSRF-Token': 'forged_csrf_token_value_9999'
      },
      expectedStatus: 403
    },
    {
      name: '7. Non-browser API client with Authorization: Bearer bypasses CSRF safely',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      expectedStatus: 201
    }
  ];

  let passed = 0;
  for (const t of tests) {
    const res = await fetch(`${API_URL}/grocery/cart/switch-retailer`, {
      method: 'POST',
      headers: t.headers,
      body: JSON.stringify({ retailerId: 'ret-zepto', householdId })
    });

    const isMatch = res.status === t.expectedStatus;
    if (isMatch) passed++;
    let body = {};
    try { body = await res.json(); } catch {}
    console.log(`  ${isMatch ? '✅ PASS' : '❌ FAIL'}: ${t.name}`);
    console.log(`     Status: ${res.status} (Expected: ${t.expectedStatus}) ${body.message ? `-> "${body.message}"` : ''}`);
  }

  console.log('\n================================================================');
  console.log(`📊 CSRF VERIFICATION RESULT: ${passed}/${tests.length} PASSED`);
  console.log('================================================================\n');

  if (passed !== tests.length) process.exit(1);
}

testCsrf().catch(err => {
  console.error('CSRF test failed:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());
