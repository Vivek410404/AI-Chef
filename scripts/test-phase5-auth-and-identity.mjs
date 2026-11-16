#!/usr/bin/env node
/**
 * RasoiIQ - Phase 5.0 Comprehensive Authentication, Identity & Multi-Tenant Test Suite
 *
 * Validates:
 * - Public Registration & Password Policies (Argon2id, >=12 chars, blocklist)
 * - Email Verification & Dev Delivery Abstraction
 * - Secure Login, Sessions & Refresh Rotation with Replay Detection
 * - Password Recovery & Session Revocation
 * - Household Creation (Owner Assignment) & Membership Authorization
 * - Household Invitations Workflow (Email match, Expiry, Revocation, Atomic Acceptance)
 * - Retailer Applications & Admin Provisioning Guardrails
 * - Cross-Household IDOR & Permission Defenses
 * - PostgreSQL Persistence & Existing Data Integrity
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

let API_BASE = process.env.API_URL || 'http://localhost:4000/api';
if (!API_BASE.endsWith('/api')) {
  API_BASE = `${API_BASE}/api`;
}

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedAssertions++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runTests() {
  console.log('========================================================================');
  console.log('      RASOIIQ PHASE 5.0: AUTHENTICATION, IDENTITY & SECURITY TESTS      ');
  console.log('========================================================================\n');

  const testRunId = Date.now().toString(36);
  const testUserEmail = `pilot.user.${testRunId}@testrasoi.in`;
  const testInvitedEmail = `invited.family.${testRunId}@testrasoi.in`;
  const strongPassword = 'MySecretSecurePassphrase@2026';

  // -------------------------------------------------------------------------
  // 1. REGISTRATION & INPUT VALIDATION
  // -------------------------------------------------------------------------
  console.log('--- 1. Customer Registration & Password Policy Tests ---');

  // Weak password (<12 chars)
  const weakRes = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Test User',
      email: testUserEmail,
      password: 'short',
      confirmPassword: 'short',
      acceptTerms: true
    }
  });
  assert(weakRes.status === 400 && weakRes.data?.message?.includes('12 characters'), 'Rejects password shorter than 12 characters');

  // Common password in blocklist
  const commonRes = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Test User',
      email: testUserEmail,
      password: 'password12345',
      confirmPassword: 'password12345',
      acceptTerms: true
    }
  });
  assert(commonRes.status === 400 && commonRes.data?.message?.includes('common'), 'Rejects commonly used / blocklisted password');

  // Password mismatch
  const mismatchRes = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Test User',
      email: testUserEmail,
      password: strongPassword,
      confirmPassword: 'DifferentPassword@2026',
      acceptTerms: true
    }
  });
  assert(mismatchRes.status === 400 && mismatchRes.data?.message?.includes('match'), 'Rejects mismatched confirm password');

  // Missing terms acceptance
  const noTermsRes = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Test User',
      email: testUserEmail,
      password: strongPassword,
      confirmPassword: strongPassword,
      acceptTerms: false
    }
  });
  assert(noTermsRes.status === 400 && noTermsRes.data?.message?.includes('Terms'), 'Rejects registration without Terms of Service acceptance');

  // Successful Registration
  const regRes = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Vivek Joshi',
      email: testUserEmail,
      phoneNumber: '+91 9988776655',
      password: strongPassword,
      confirmPassword: strongPassword,
      acceptTerms: true
    }
  });
  assert(regRes.status === 201 || regRes.status === 200, 'Public customer registration succeeds');
  assert(regRes.data?.success === true, 'Registration returns success payload');

  // Duplicate registration enumeration resistance
  const dupRes = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Vivek Joshi',
      email: testUserEmail,
      password: strongPassword,
      confirmPassword: strongPassword,
      acceptTerms: true
    }
  });
  assert(dupRes.status === 200 || dupRes.status === 201, 'Duplicate registration returns generic success (prevents email enumeration)');

  // Verify database record: Status is PENDING_VERIFICATION and Argon2id hash is used
  const dbUser = await prisma.user.findFirst({
    where: { email: testUserEmail }
  });
  assert(dbUser !== null, 'User persisted in PostgreSQL database');
  assert(dbUser?.status === 'PENDING_VERIFICATION', 'New user status is PENDING_VERIFICATION');
  assert(dbUser?.emailVerifiedAt === null, 'emailVerifiedAt is null upon registration');
  assert(dbUser?.passwordHash.startsWith('$argon2id$'), 'Password stored as secure Argon2id hash (never plaintext)');
  assert(!JSON.stringify(regRes.data).includes(strongPassword), 'Plaintext password never returned in API response');

  // -------------------------------------------------------------------------
  // 2. EMAIL VERIFICATION & DEV INBOX ABSTRACTION
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Email Verification & Token Lifecycle ---');

  // Attempt login before email verification -> Must fail
  const unverifiedLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: strongPassword }
  });
  assert(unverifiedLogin.status === 401 && unverifiedLogin.data?.message?.includes('verify'), 'Login rejected for unverified account');

  // Inspect development inbox for captured verification email
  const devEmailsRes = await fetchJson(`/dev/emails?email=${testUserEmail}`);
  assert(devEmailsRes.status === 200, 'Development email preview endpoint reachable');
  const capturedEmail = devEmailsRes.data?.[0];
  assert(capturedEmail?.to === testUserEmail, 'Verification email captured for registered user');
  assert(Boolean(capturedEmail?.token), 'Captured email contains verification token');

  const verificationToken = capturedEmail.token;

  // Invalid verification token
  const invalidTokenRes = await fetchJson('/auth/verify-email', {
    method: 'POST',
    body: { token: 'invalid_dummy_token_12345' }
  });
  assert(invalidTokenRes.status === 400, 'Rejects invalid email verification token');

  // Valid Email Verification
  const verifyRes = await fetchJson('/auth/verify-email', {
    method: 'POST',
    body: { token: verificationToken }
  });
  assert(verifyRes.status === 200 || verifyRes.status === 201, 'Email verification succeeds with valid token');

  // Verify user updated to ACTIVE in database
  const verifiedDbUser = await prisma.user.findFirst({
    where: { email: testUserEmail }
  });
  assert(verifiedDbUser?.status === 'ACTIVE', 'User status transitioned to ACTIVE in PostgreSQL');
  assert(verifiedDbUser?.emailVerifiedAt !== null, 'emailVerifiedAt recorded with valid timestamp');

  // Reused token rejection
  const reuseTokenRes = await fetchJson('/auth/verify-email', {
    method: 'POST',
    body: { token: verificationToken }
  });
  assert(reuseTokenRes.status === 400, 'Rejects already consumed email verification token');

  // Resend verification generic response
  const resendRes = await fetchJson('/auth/resend-verification', {
    method: 'POST',
    body: { email: testUserEmail }
  });
  assert(resendRes.status === 200 || resendRes.status === 201, 'Resend verification returns generic anti-enumeration response');

  // -------------------------------------------------------------------------
  // 3. SECURE LOGIN & REFRESH TOKEN ROTATION
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Secure Login, Rotating Refresh Tokens & Replay Detection ---');

  // Wrong password rejection with generic error
  const wrongPassRes = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: 'WrongPassword123@2026' }
  });
  assert(wrongPassRes.status === 401 && wrongPassRes.data?.message?.includes('Invalid email or password'), 'Rejects incorrect password with generic error');

  // Successful Login
  const loginRes = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: strongPassword, deviceName: 'Chrome on Mac' }
  });
  assert(loginRes.status === 200 || loginRes.status === 201, 'Successful login returns HTTP 200/201');
  assert(Boolean(loginRes.data?.accessToken), 'Login returns short-lived JWT access token');
  assert(Boolean(loginRes.data?.refreshToken), 'Login returns rotating refresh token');
  assert(loginRes.data?.user?.email === testUserEmail, 'Login response user matches authenticated identity');

  let accessToken = loginRes.data.accessToken;
  let refreshToken = loginRes.data.refreshToken;

  // Verify session persisted in PostgreSQL
  const dbSession = await prisma.refreshSession.findFirst({
    where: { userId: verifiedDbUser.id, revokedAt: null }
  });
  assert(dbSession !== null, 'Active refresh session persisted in PostgreSQL RefreshSession table');
  assert(dbSession?.deviceName === 'Chrome on Mac', 'Device information recorded in session');

  // Refresh Token Rotation: Use refresh token to obtain new access and refresh tokens
  const refreshRes = await fetchJson('/auth/refresh', {
    method: 'POST',
    body: { refreshToken }
  });
  assert(refreshRes.status === 200 || refreshRes.status === 201, 'Token refresh succeeds');
  assert(Boolean(refreshRes.data?.accessToken), 'New access token issued on refresh');
  assert(Boolean(refreshRes.data?.refreshToken), 'New refresh token issued on refresh (rotation)');

  const rotatedOldRefreshToken = refreshToken;
  const newRefreshToken = refreshRes.data.refreshToken;
  accessToken = refreshRes.data.accessToken;

  // REPLAY DETECTION: Attempt to use the already rotated refresh token
  const replayRes = await fetchJson('/auth/refresh', {
    method: 'POST',
    body: { refreshToken: rotatedOldRefreshToken }
  });
  assert(replayRes.status === 401, 'Reusing rotated refresh token triggers security detection (HTTP 401)');

  // Verify entire token family was revoked in PostgreSQL
  const activeFamilySessions = await prisma.refreshSession.findMany({
    where: { tokenFamilyId: dbSession.tokenFamilyId, revokedAt: null }
  });
  assert(activeFamilySessions.length === 0, 'Token replay detection successfully revoked entire token family');

  // -------------------------------------------------------------------------
  // 4. PASSWORD RECOVERY & CHANGE WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Password Recovery & Session Revocation ---');

  // Request password reset
  const forgotRes = await fetchJson('/auth/forgot-password', {
    method: 'POST',
    body: { email: testUserEmail }
  });
  assert(forgotRes.status === 200 || forgotRes.status === 201, 'Forgot password request accepted');

  // Inspect dev inbox for reset link
  const resetEmailsRes = await fetchJson(`/dev/emails?email=${testUserEmail}`);
  const resetEmail = resetEmailsRes.data?.find(e => e.type === 'PASSWORD_RESET');
  assert(Boolean(resetEmail?.token), 'Password reset token captured in dev inbox');

  const resetToken = resetEmail.token;
  const newStrongPassword = 'UpdatedNewPassword@2026';

  // Execute password reset
  const resetRes = await fetchJson('/auth/reset-password', {
    method: 'POST',
    body: {
      token: resetToken,
      newPassword: newStrongPassword,
      confirmPassword: newStrongPassword
    }
  });
  assert(resetRes.status === 200 || resetRes.status === 201, 'Password reset completes successfully');

  // Login with old password must now fail
  const oldLoginRes = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: strongPassword }
  });
  assert(oldLoginRes.status === 401, 'Old password rejected after password reset');

  // Login with new password must succeed
  const newLoginRes = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: testUserEmail, password: newStrongPassword }
  });
  assert(newLoginRes.status === 200 || newLoginRes.status === 201, 'Login with new password succeeds');
  accessToken = newLoginRes.data.accessToken;
  refreshToken = newLoginRes.data.refreshToken;

  // -------------------------------------------------------------------------
  // 5. HOUSEHOLD CREATION & OWNER PERMISSIONS
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Household Creation & Owner Assignment ---');

  // Create household
  const createHhRes = await fetchJson('/households', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      name: 'Joshi Family Kitchen',
      country: 'India',
      state: 'Gujarat',
      city: 'Ahmedabad',
      dietaryPreference: 'VEGETARIAN',
      cuisinePreference: 'ALL_INDIAN',
      weeklyBudgetInr: 4500
    }
  });
  assert(createHhRes.status === 201 || createHhRes.status === 200, 'Household creation succeeds');
  const household = createHhRes.data;
  assert(household?.name === 'Joshi Family Kitchen', 'Household name persisted');

  // Verify database: First user is OWNER
  const ownerMember = await prisma.householdMember.findFirst({
    where: { householdId: household.id, userId: verifiedDbUser.id }
  });
  assert(ownerMember !== null, 'Creator member record persisted in HouseholdMember table');
  assert(ownerMember?.role === 'OWNER', 'Creator automatically designated as household OWNER');

  // -------------------------------------------------------------------------
  // 6. HOUSEHOLD INVITATION & ACCEPTANCE WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Household Invitation & Member Onboarding ---');

  // Owner invites another family member
  const inviteRes = await fetchJson(`/households/${household.id}/invitations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      invitedEmail: testInvitedEmail,
      role: 'MEMBER'
    }
  });
  assert(inviteRes.status === 201 || inviteRes.status === 200, 'Household OWNER successfully creates invitation');
  assert(Boolean(inviteRes.data?.rawToken), 'Invitation token generated');

  const inviteToken = inviteRes.data.rawToken;

  // Validate invitation publicly
  const validateRes = await fetchJson(`/households/invitations/validate?token=${inviteToken}`);
  assert(validateRes.status === 200 && validateRes.data?.valid === true, 'Public invitation token validation succeeds');
  assert(validateRes.data?.householdName === 'Joshi Family Kitchen', 'Invitation reveals correct household name');

  // Register invited user account
  const invitedUserPassword = 'InvitedFamilyPassphrase@2026';
  await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Aarti Joshi',
      email: testInvitedEmail,
      password: invitedUserPassword,
      confirmPassword: invitedUserPassword,
      acceptTerms: true
    }
  });

  // Verify invited user email via dev preview
  const invitedEmailPreview = await fetchJson(`/dev/emails?email=${testInvitedEmail}`);
  const invitedVerifyToken = invitedEmailPreview.data?.find(e => e.type === 'VERIFICATION')?.token;
  await fetchJson('/auth/verify-email', {
    method: 'POST',
    body: { token: invitedVerifyToken }
  });

  // Login as invited user
  const invitedLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: testInvitedEmail, password: invitedUserPassword }
  });
  const invitedAccessToken = invitedLogin.data.accessToken;

  // Accept invitation as invited user
  const acceptRes = await fetchJson('/households/invitations/accept', {
    method: 'POST',
    headers: { Authorization: `Bearer ${invitedAccessToken}` },
    body: { token: inviteToken }
  });
  assert(acceptRes.status === 200 || acceptRes.status === 201, 'Invited user successfully accepts household invitation');

  // Verify membership created in PostgreSQL
  const newMember = await prisma.householdMember.findFirst({
    where: { householdId: household.id, user: { email: testInvitedEmail } }
  });
  assert(newMember !== null, 'New member persisted in PostgreSQL HouseholdMember');
  assert(newMember?.role === 'MEMBER', 'Accepted member assigned correct MEMBER role');

  // Duplicate membership attempt must fail
  const dupAcceptRes = await fetchJson('/households/invitations/accept', {
    method: 'POST',
    headers: { Authorization: `Bearer ${invitedAccessToken}` },
    body: { token: inviteToken }
  });
  assert(dupAcceptRes.status === 400, 'Rejects duplicate acceptance of consumed invitation');

  // -------------------------------------------------------------------------
  // 7. CROSS-HOUSEHOLD IDOR & PERMISSION BOUNDARIES
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Household Authorization & IDOR Defense ---');

  // Non-owner (MEMBER) attempts to invite another user -> Must be blocked (HTTP 403)
  const unauthorizedInvite = await fetchJson(`/households/${household.id}/invitations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${invitedAccessToken}` },
    body: { invitedEmail: 'intruder@test.in', role: 'MEMBER' }
  });
  assert(unauthorizedInvite.status === 403, 'MEMBER blocked from creating invitations (OWNER only)');

  // Cross-household IDOR attempt: Joshi token accessing Sharma household
  const idorHhRes = await fetchJson('/households/hh-sharma-family', {
    headers: { Authorization: `Bearer ${invitedAccessToken}` }
  });
  assert(idorHhRes.status === 403, 'Cross-household data access strictly blocked with HTTP 403');

  // -------------------------------------------------------------------------
  // 8. RETAILER APPLICATION & ADMIN PRIVILEGE GUARDRAILS
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Retailer Application & Admin Security ---');

  // Public customer submits retailer application
  const retailAppRes = await fetchJson('/marketplace/retailer/apply', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: {
      businessName: 'Joshi Organic Groceries',
      contactInformation: { phone: '+91 98980 12345', city: 'Ahmedabad' }
    }
  });
  assert(retailAppRes.status === 201 || retailAppRes.status === 200, 'Customer successfully submits retailer application');
  assert(retailAppRes.data?.applicationStatus === 'PENDING', 'Submitted application status is PENDING');

  // Customer role must NOT be elevated automatically
  const meRes = await fetchJson('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert(meRes.data?.role === 'CUSTOMER', 'Applicant retains CUSTOMER role until approved (no auto-escalation)');

  // Non-admin attempting to access admin endpoints -> Must be blocked (HTTP 403)
  const unauthAdminRes = await fetchJson('/marketplace/admin/retailer-applications', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert(unauthAdminRes.status === 403, 'Normal customer blocked from accessing administrative endpoints');

  // Platform admin login using CLI-bootstrapped credentials
  const adminLoginRes = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'admin@rasoiiq.in', password: 'RasoiAdminSecretPassphrase@2026' }
  });
  assert(adminLoginRes.status === 200 || adminLoginRes.status === 201, 'Platform administrator logs in with Argon2id credentials');
  const adminToken = adminLoginRes.data.accessToken;

  // Admin approves retailer application
  const pendingApps = await fetchJson('/marketplace/admin/retailer-applications', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(pendingApps.data?.length > 0, 'Admin retrieves pending retailer applications');
  const myApp = pendingApps.data?.find(a => a.businessName === 'Joshi Organic Groceries');

  const reviewRes = await fetchJson(`/marketplace/admin/retailer-applications/${myApp.id}/review`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'APPROVED' }
  });
  assert(reviewRes.status === 200 || reviewRes.status === 201, 'Admin successfully approves retailer application');

  // -------------------------------------------------------------------------
  // 9. LOGOUT & SESSION TERMINATION
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Session Termination & Revocation ---');

  // Single device logout
  const logoutRes = await fetchJson('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert(logoutRes.status === 200 || logoutRes.status === 201, 'Single-device logout succeeds');

  // Revoked access token cannot be used again
  const afterLogoutMe = await fetchJson('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  assert(afterLogoutMe.status === 401, 'Revoked access token rejected with HTTP 401');

  // -------------------------------------------------------------------------
  // 10. EXISTING DATA PERSISTENCE & SYSTEM HEALTH
  // -------------------------------------------------------------------------
  console.log('\n--- 10. Database Health & Pre-existing Data Integrity ---');

  const healthRes = await fetchJson('/health');
  assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
  assert(healthRes.data?.storageMode === 'postgres', 'Storage mode confirmed as PostgreSQL');
  assert(healthRes.data?.databaseConnected === true, 'Database actively connected');

  // Verify pre-existing seeded households survived
  const sharmaHh = await prisma.household.findUnique({ where: { id: 'hh-sharma-family' } });
  const patelHh = await prisma.household.findUnique({ where: { id: 'hh-patel-family' } });
  const mehtaHh = await prisma.household.findUnique({ where: { id: 'hh-mehta-family' } });
  assert(sharmaHh !== null, 'Pre-existing Sharma household preserved in PostgreSQL');
  assert(patelHh !== null, 'Pre-existing Patel household preserved in PostgreSQL');
  assert(mehtaHh !== null, 'Pre-existing Mehta household preserved in PostgreSQL');

  // Verify recipes intact
  const recipeCount = await prisma.recipe.count();
  assert(recipeCount >= 24, `Recipe catalog preserved (${recipeCount} recipes verified in database)`);

  // Cleanup test-created household and users to preserve exactly 3 seeded households for regression suites
  try {
    await prisma.householdInvitation.deleteMany({ where: { householdId: household.id } });
    await prisma.householdMember.deleteMany({ where: { householdId: household.id } });
    await prisma.household.delete({ where: { id: household.id } });
    await prisma.refreshSession.deleteMany({ where: { userId: verifiedDbUser.id } });
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUserEmail },
          { email: testInvitedEmail }
        ]
      }
    });
  } catch {}

  console.log('\n========================================================================');
  console.log(`PHASE 5.0 TEST EXECUTION SUMMARY: ${passedAssertions} / ${totalAssertions} ASSERTIONS PASSED (${failedAssertions} FAILED)`);
  console.log('========================================================================\n');

  await prisma.$disconnect();

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error('Unhandled test suite failure:', e);
  await prisma.$disconnect();
  process.exit(1);
});
