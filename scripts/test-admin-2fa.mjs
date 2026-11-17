#!/usr/bin/env node
/**
 * Test Suite: Admin 2FA Hardening & Backdoor Elimination
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let host = '127.0.0.1';
try {
  const wslIp = execSync('wsl -d Ubuntu hostname -I').toString().trim().split(' ')[0];
  if (wslIp) host = wslIp;
} catch {}

const dbUrl = process.env.DATABASE_URL || `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

const API_BASE = 'http://localhost:4000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let body = null;
  try {
    body = await res.json();
  } catch {}
  return { status: res.status, ok: res.ok, body };
}

async function run() {
  console.log('========================================================================');
  console.log('  TEST SUITE: RASOIIQ ADMIN 2FA EMAIL OTP & HARDENING AUDIT             ');
  console.log('========================================================================\n');

  // 1. Backdoor Elimination: /api/auth/demo-session must block ADMIN & SUPER_ADMIN
  console.log('--- TEST 1: Unauthenticated Demo Backdoor Blocked for Admins ---');
  const demoAdmin = await request('/auth/demo-session?role=ADMIN', { method: 'POST' });
  assert(demoAdmin.status === 403, `Demo session blocked for ADMIN role (status: ${demoAdmin.status})`);
  assert(
    demoAdmin.body?.message?.includes('cannot be accessed via unauthenticated demo') ||
    demoAdmin.body?.message?.includes('Privilege escalation blocked'),
    `Informative security rejection returned: "${demoAdmin.body?.message}"`
  );

  const demoSuperAdmin = await request('/auth/demo-session?role=SUPER_ADMIN', { method: 'POST' });
  assert(demoSuperAdmin.status === 403, `Demo session blocked for SUPER_ADMIN role (status: ${demoSuperAdmin.status})`);

  // 2. Reject non-admin / customer accounts from admin login
  console.log('\n--- TEST 2: Customer Account Rejected from Admin Portal ---');
  // Find or check a customer account in DB
  let customerUser = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
  if (customerUser) {
    const custLogin = await request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: customerUser.email, password: 'AnyPassword123!' })
    });
    assert(
      custLogin.status === 403 || custLogin.status === 401,
      `Customer account rejected from admin login (status: ${custLogin.status}, message: "${custLogin.body?.message}")`
    );
  } else {
    console.log('  ℹ️ Skipped (no customer user found)');
  }

  // 3. Reject invalid admin credentials
  console.log('\n--- TEST 3: Invalid Admin Credentials Rejected ---');
  const wrongPass = await request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@rasoiiq.in', password: 'WrongPassword@123' })
  });
  assert(wrongPass.status === 401, `Wrong password rejected with 401 Unauthorized (status: ${wrongPass.status})`);

  // 4. Valid Admin Credentials -> Generates MFA Session & Dispatches 6-Digit OTP
  console.log('\n--- TEST 4: Valid Admin Credentials Triggers 2FA Email OTP ---');
  const adminLoginRes = await request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@rasoiiq.in',
      password: 'RasoiAdminSecretPassphrase@2026'
    })
  });

  assert(adminLoginRes.status === 200 || adminLoginRes.status === 201, `Admin credentials accepted (status: ${adminLoginRes.status})`);
  assert(adminLoginRes.body?.requiresMfa === true, 'Response specifies requiresMfa: true');
  assert(typeof adminLoginRes.body?.mfaSessionId === 'string', 'Received cryptographically random mfaSessionId');
  assert(adminLoginRes.body?.maskedEmail?.includes('***'), `Email safely masked for frontend: ${adminLoginRes.body?.maskedEmail}`);

  const mfaSessionId = adminLoginRes.body?.mfaSessionId;

  // 5. Inspect Dispatched OTP in Email Service / Dev Inbox
  console.log('\n--- TEST 5: Verify 6-digit OTP in Dispatched Email ---');
  const devEmailsRes = await request('/dev/emails');
  const latestOtpMail = devEmailsRes.body?.find(m => m.type === 'ADMIN_OTP' && m.to === 'admin@rasoiiq.in');
  assert(latestOtpMail !== undefined, 'Admin OTP email was dispatched and captured');
  assert(typeof latestOtpMail?.token === 'string' && latestOtpMail.token.length === 6, `Valid 6-digit OTP generated: ${latestOtpMail?.token}`);
  assert(latestOtpMail?.subject?.includes(latestOtpMail.token), `Email subject includes OTP: "${latestOtpMail?.subject}"`);

  const realOtp = latestOtpMail?.token;

  // 6. OTP Verification: Bad OTP Rejected
  console.log('\n--- TEST 6: Incorrect 6-Digit OTP Rejected ---');
  const badOtpRes = await request('/auth/admin/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      mfaSessionId,
      otp: '000000'
    })
  });
  assert(badOtpRes.status === 401, `Incorrect OTP rejected with 401 (status: ${badOtpRes.status})`);

  // 7. OTP Resend Cooldown Test
  console.log('\n--- TEST 7: Resend OTP Cooldown Enforced ---');
  const fastResend = await request('/auth/admin/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ mfaSessionId })
  });
  assert(fastResend.status === 400, `Immediate resend rejected due to cooldown (status: ${fastResend.status}, msg: "${fastResend.body?.message}")`);

  // 8. Correct OTP Verification -> Grants Admin Session
  console.log('\n--- TEST 8: Correct OTP Grants Full Admin Access ---');
  const verifyRes = await request('/auth/admin/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      mfaSessionId,
      otp: realOtp
    })
  });

  assert(verifyRes.status === 200 || verifyRes.status === 201, `OTP verified successfully (status: ${verifyRes.status})`);
  assert(typeof verifyRes.body?.accessToken === 'string', 'Access token issued upon 2FA verification');
  assert(typeof verifyRes.body?.refreshToken === 'string', 'Rotating refresh token issued');
  assert(verifyRes.body?.user?.role === 'ADMIN', `User role verified as ${verifyRes.body?.user?.role}`);

  const adminToken = verifyRes.body?.accessToken;

  // 9. Access Protected Admin Endpoint with Issued Token
  console.log('\n--- TEST 9: Authenticated Admin Endpoint Access ---');
  const overviewRes = await request('/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(overviewRes.status === 200, `Admin overview accessed successfully (status: ${overviewRes.status})`);

  // 10. Audit Log Recorded
  console.log('\n--- TEST 10: Audit Log Verification ---');
  const auditLogs = await prisma.auditLog.findMany({
    where: { action: 'ADMIN_LOGIN_SUCCESS' },
    orderBy: { createdAt: 'desc' },
    take: 1
  });
  assert(auditLogs.length > 0, 'AuditLog entry recorded for ADMIN_LOGIN_SUCCESS');
  assert(auditLogs[0]?.metadata?.mfa === 'EMAIL_OTP', 'AuditLog metadata confirms 2FA verification');

  console.log('\n========================================================================');
  console.log(`RESULTS: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} ASSERTIONS`);
  console.log('========================================================================');

  await prisma.$disconnect();
  process.exit(failedTests > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal error running test:', err);
  process.exit(1);
});
