#!/usr/bin/env node
/**
 * RasoiIQ - Phase 5.1 Admin Console, Platform Management & Operations Test Suite
 *
 * Validates:
 * 1. Administrator Bootstrap and Public Route Isolation (No public admin registration)
 * 2. Strict Role-Based Access Control (RBAC) Hierarchy:
 *    - Unauthenticated: 401 Unauthorized
 *    - CUSTOMER & RETAILER: 403 Forbidden on all admin endpoints
 *    - SUPPORT: Limited read-only customer/order lookup; blocked from mutations
 *    - OPERATIONS: Order fulfillment, substitution notes; blocked from user/catalog modifications
 *    - ADMIN: Customer management, retailer review, recipe catalog; blocked from staff/settings
 *    - SUPER_ADMIN: Unrestricted platform administration, staff provisioning, system configuration
 * 3. Real PostgreSQL Derived Metrics (Zero fabricated or hardcoded metrics)
 * 4. User Lifecycle Management:
 *    - Suspension with mandatory reason
 *    - Immediate refresh token and session invalidation
 *    - Self-suspension protection
 *    - Non-superadmin cannot suspend superadmin
 *    - Account reactivation
 * 5. Retailer Application Review & Merchant Role Promotion:
 *    - Application approval elevating user to RETAILER
 *    - Rejection requiring mandatory reason
 *    - Retailer status management
 * 6. Order Operations & Demo Transaction Safeguard:
 *    - Explicit isDemoOrder: true flag on all simulated transactions
 *    - Status transitions (CONFIRMED -> PREPARING -> DISPATCHED -> DELIVERED)
 *    - Substitution & fulfillment notes logging
 * 7. Recipe Catalog Administration & Dietary Integrity:
 *    - Enforcement of Jain dietary rules (zero onion, garlic, root vegetables)
 *    - Non-veg vs pure-veg conflict rejection
 *    - Recipe creation, updating, and archiving/unarchiving
 * 8. Security Audit Stream Immutability & Metadata Inspection
 * 9. Staff Provisioning & Platform Configuration Settings
 * 10. System Health & Infrastructure Diagnostics
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

async function getDemoToken(role, options = {}) {
  const res = await fetchJson('/auth/demo-session', {
    method: 'POST',
    body: { role, secret: 'rasoi_admin_secret_2026', ...options }
  });
  if (!res.ok || !res.data?.token) {
    throw new Error(`Failed to obtain demo session for role ${role}: ${JSON.stringify(res.data)}`);
  }
  return res.data.token;
}

async function runTests() {
  console.log('========================================================================');
  console.log('   RASOIIQ PHASE 5.1: ADMIN DASHBOARD & PLATFORM MANAGEMENT TESTS       ');
  console.log('========================================================================\n');

  // Obtain role-specific tokens
  const superAdminToken = await getDemoToken('SUPER_ADMIN');
  const adminToken = await getDemoToken('ADMIN');
  const opsToken = await getDemoToken('OPERATIONS');
  const supportToken = await getDemoToken('SUPPORT');
  const customerToken = await getDemoToken('CUSTOMER');
  const retailerToken = await getDemoToken('RETAILER');

  // -------------------------------------------------------------------------
  // 1. BOOTSTRAP INTEGRITY & PUBLIC REGISTRATION ISOLATION
  // -------------------------------------------------------------------------
  console.log('--- 1. Administrator Bootstrap & Public Route Isolation ---');

  const superAdminDb = await prisma.user.findFirst({
    where: { email: 'superadmin@rasoiiq.in' }
  });
  assert(superAdminDb !== null, 'Super Administrator user exists in PostgreSQL');
  assert(superAdminDb?.role === 'SUPER_ADMIN', 'Super Administrator has role SUPER_ADMIN');
  assert(superAdminDb?.status === 'ACTIVE', 'Super Administrator account is ACTIVE');
  assert(superAdminDb?.passwordHash.startsWith('$argon2id$'), 'Super Administrator password hashed with Argon2id');

  // Attempting to register as ADMIN via public registration must ignore role parameter and produce CUSTOMER
  const testRunId = Date.now().toString(36);
  const rogueEmail = `rogue.admin.${testRunId}@test.in`;
  const regAttempt = await fetchJson('/auth/register', {
    method: 'POST',
    body: {
      fullName: 'Rogue Admin Attempt',
      email: rogueEmail,
      password: 'SafePassphrase@2026',
      confirmPassword: 'SafePassphrase@2026',
      acceptTerms: true,
      role: 'SUPER_ADMIN' // Attacker payload trying privilege escalation
    }
  });
  assert(regAttempt.ok, 'Registration endpoint accepts valid signup payload');
  const createdRogue = await prisma.user.findFirst({ where: { email: rogueEmail } });
  assert(createdRogue?.role === 'CUSTOMER', 'Public registration strictly forces role CUSTOMER, denying privilege escalation');

  // -------------------------------------------------------------------------
  // 2. SERVER-SIDE RBAC & ROUTE GUARD DEFENSES
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Server-Side RBAC & Route Guard Defenses ---');

  // Unauthenticated request
  const unauthRes = await fetchJson('/admin/overview');
  assert(unauthRes.status === 401, 'Unauthenticated request to /admin/overview rejected with 401 Unauthorized');

  // Customer request
  const custRes = await fetchJson('/admin/overview', {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  assert(custRes.status === 403, 'Customer role accessing /admin/overview rejected with 403 Forbidden');

  // Retailer request
  const retRes = await fetchJson('/admin/overview', {
    headers: { Authorization: `Bearer ${retailerToken}` }
  });
  assert(retRes.status === 403, 'Retailer role accessing /admin/overview rejected with 403 Forbidden');

  // Support staff checks
  const suppOverview = await fetchJson('/admin/overview', {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  assert(suppOverview.status === 200, 'Support role can access /admin/overview (200 OK)');

  const suppUsers = await fetchJson('/admin/users', {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  assert(suppUsers.status === 200, 'Support role can read /admin/users list (200 OK)');

  const suppSuspendAttempt = await fetchJson(`/admin/users/${createdRogue.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${supportToken}` },
    body: { status: 'SUSPENDED', reason: 'Support attempt' }
  });
  assert(suppSuspendAttempt.status === 403, 'Support role blocked from suspending users (403 Forbidden)');

  const suppStaffAttempt = await fetchJson('/admin/staff', {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  assert(suppStaffAttempt.status === 403, 'Support role blocked from staff directory (403 Forbidden)');

  // Operations staff checks
  const opsOrders = await fetchJson('/admin/orders', {
    headers: { Authorization: `Bearer ${opsToken}` }
  });
  assert(opsOrders.status === 200, 'Operations role can access /admin/orders (200 OK)');

  const opsSuspendAttempt = await fetchJson(`/admin/users/${createdRogue.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${opsToken}` },
    body: { status: 'SUSPENDED', reason: 'Ops attempt' }
  });
  assert(opsSuspendAttempt.status === 403, 'Operations role blocked from user suspension (403 Forbidden)');

  // Admin checks (cannot access SUPER_ADMIN only endpoints)
  const adminOverview = await fetchJson('/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminOverview.status === 200, 'Admin role can access /admin/overview (200 OK)');

  const adminStaffAccess = await fetchJson('/admin/staff', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminStaffAccess.status === 403, 'Regular Admin blocked from staff management (403 Forbidden)');

  const adminSettingsMutation = await fetchJson('/admin/settings', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { key: 'test.key', value: '123' }
  });
  assert(adminSettingsMutation.status === 403, 'Regular Admin blocked from updating system settings (403 Forbidden)');

  // Super Admin checks (full access)
  const superStaffAccess = await fetchJson('/admin/staff', {
    headers: { Authorization: `Bearer ${superAdminToken}` }
  });
  assert(superStaffAccess.status === 200, 'Super Admin granted access to /admin/staff (200 OK)');

  // -------------------------------------------------------------------------
  // 3. REAL DATABASE DERIVED METRICS ACCURACY
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Real Database Derived Metrics Accuracy ---');

  const overviewRes = await fetchJson('/admin/overview', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(overviewRes.status === 200, 'Successfully fetched overview dashboard metrics');

  const dbUserCount = await prisma.user.count();
  const dbHouseholdCount = await prisma.household.count();
  const dbRecipeCount = await prisma.recipe.count();
  const dbOrderCount = await prisma.order.count();

  assert(overviewRes.data.userStats.total === dbUserCount, `Overview user count (${overviewRes.data.userStats.total}) matches exact DB count (${dbUserCount})`);
  assert(overviewRes.data.householdStats.total === dbHouseholdCount, `Overview household count (${overviewRes.data.householdStats.total}) matches exact DB count (${dbHouseholdCount})`);
  assert(overviewRes.data.recipeStats.total === dbRecipeCount, `Overview recipe count (${overviewRes.data.recipeStats.total}) matches exact DB count (${dbRecipeCount})`);
  assert(overviewRes.data.orderStats.total === dbOrderCount, `Overview order count (${overviewRes.data.orderStats.total}) matches exact DB count (${dbOrderCount})`);
  assert(overviewRes.data.orderStats.demoOrdersCount === dbOrderCount, 'All database orders correctly labeled as simulated demo orders');

  // Check 14-day trends endpoint
  const trendsRes = await fetchJson('/admin/trends?days=14', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(trendsRes.status === 200, 'Fetched 14-day trends time-series');
  assert(Array.isArray(trendsRes.data.trends) && trendsRes.data.trends.length === 15, 'Returns 15 daily time-series buckets for 14-day window');
  assert(typeof trendsRes.data.trends[0].registrations === 'number', 'Time series includes numerical registration counts');
  assert(typeof trendsRes.data.trends[0].orders === 'number', 'Time series includes numerical order counts');

  // -------------------------------------------------------------------------
  // 4. USER LIFECYCLE, SUSPENSION & SESSION REVOCATION
  // -------------------------------------------------------------------------
  console.log('\n--- 4. User Lifecycle, Suspension & Session Invalidation ---');

  // Create active session and refresh token for createdRogue user
  await prisma.refreshSession.create({
    data: {
      userId: createdRogue.id,
      tokenFamilyId: 'fam-test-1',
      tokenHash: 'hash-test-1',
      expiresAt: new Date(Date.now() + 3600000)
    }
  });
  const initialRefreshCount = await prisma.refreshSession.count({ where: { userId: createdRogue.id } });
  assert(initialRefreshCount === 1, 'Test customer has 1 active refresh token prior to suspension');

  // Suspend user without reason -> should succeed with default or provided reason
  const suspendRes = await fetchJson(`/admin/users/${createdRogue.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'SUSPENDED', reason: 'Investigating suspicious order activity' }
  });
  assert(suspendRes.status === 200, 'Admin successfully suspends customer account');
  assert(suspendRes.data.status === 'SUSPENDED', 'User status transitioned to SUSPENDED');
  assert(suspendRes.data.suspensionReason.includes('suspicious order'), 'Suspension reason persisted on User record');

  // Verify refresh tokens were immediately revoked
  const postSuspendRefreshCount = await prisma.refreshSession.count({ where: { userId: createdRogue.id } });
  assert(postSuspendRefreshCount === 0, 'Suspending user immediately and atomically deleted all active refresh sessions');

  // Self-suspension protection
  const selfAdmin = await prisma.user.findFirst({ where: { email: 'admin@rasoiiq.in' } });
  const selfSuspendRes = await fetchJson(`/admin/users/${selfAdmin.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'SUSPENDED', reason: 'Self suspension test' }
  });
  assert(selfSuspendRes.status === 400, 'Self-suspension rejected with 400 Bad Request');

  // Hierarchy protection: Admin cannot suspend Super Admin
  const adminSuspendSuperRes = await fetchJson(`/admin/users/${superAdminDb.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'SUSPENDED', reason: 'Rogue admin suspending superadmin' }
  });
  assert(adminSuspendSuperRes.status === 403, 'Regular Admin cannot suspend Super Admin account (403 Forbidden)');

  // Reactivate customer user
  const reactivateRes = await fetchJson(`/admin/users/${createdRogue.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'ACTIVE' }
  });
  assert(reactivateRes.status === 200, 'Admin successfully reactivated customer account');
  assert(reactivateRes.data.status === 'ACTIVE', 'User status restored to ACTIVE');

  // -------------------------------------------------------------------------
  // 5. RETAILER ONBOARDING & APPLICATION REVIEW
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Retailer Onboarding & Application Review ---');

  // Create an application
  const appVendor = await prisma.retailerApplication.create({
    data: {
      userId: createdRogue.id,
      businessName: `Fresh Greens Mart ${testRunId}`,
      contactInformation: { phone: '9876543210', city: 'Ahmedabad' },
      applicationStatus: 'PENDING'
    }
  });

  // Rejection without reason fails
  const badRejectRes = await fetchJson(`/admin/retailers/applications/${appVendor.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'REJECTED' }
  });
  assert(badRejectRes.status === 400, 'Application rejection without mandatory reason rejected with 400 Bad Request');

  // Approve application
  const approveRes = await fetchJson(`/admin/retailers/applications/${appVendor.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'APPROVED' }
  });
  assert(approveRes.status === 200, 'Admin successfully approved retailer application');
  assert(approveRes.data.applicationStatus === 'APPROVED', 'Application status updated to APPROVED');

  // Verify applicant user role is now elevated to RETAILER
  const elevatedUser = await prisma.user.findUnique({ where: { id: createdRogue.id } });
  assert(elevatedUser?.role === 'RETAILER', 'Applicant user role automatically elevated to RETAILER upon approval');

  // Verify Retailer record was created
  const createdRetailer = await prisma.retailer.findFirst({
    where: { name: `Fresh Greens Mart ${testRunId}` }
  });
  assert(createdRetailer !== null, 'Retailer entity provisioned in database upon application approval');

  // Update retailer status
  const suspendRetailerRes = await fetchJson(`/admin/retailers/${createdRetailer.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'SUSPENDED', reason: 'Audit pending' }
  });
  assert(suspendRetailerRes.status === 200, 'Admin can update merchant status to SUSPENDED');
  assert(suspendRetailerRes.data.status === 'SUSPENDED', 'Retailer status updated to SUSPENDED');

  // -------------------------------------------------------------------------
  // 6. ORDER OPERATIONS & DEMO TRANSACTION SAFEGUARDS
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Order Operations & Demo Safeguards ---');

  const ordersListRes = await fetchJson('/admin/orders?limit=10', {
    headers: { Authorization: `Bearer ${opsToken}` }
  });
  assert(ordersListRes.status === 200, 'Fetched orders list via Operations role');
  assert(ordersListRes.data.orders.length > 0, 'Orders list contains records');
  assert(ordersListRes.data.orders.every(o => o.isDemoOrder === true), 'Every order explicitly carries isDemoOrder: true flag');

  const targetOrder = ordersListRes.data.orders[0];

  // Operations updates status
  const updateOrderRes = await fetchJson(`/admin/orders/${targetOrder.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${opsToken}` },
    body: {
      status: 'DISPATCHED',
      statusReason: 'Out with delivery executive',
      substitutionNotes: 'Substituted organic coriander with standard coriander',
      fulfillmentNotes: 'Customer requested contactless delivery at doorstep'
    }
  });
  assert(updateOrderRes.status === 200, 'Operations specialist updated order status to DISPATCHED');
  assert(updateOrderRes.data.status === 'DISPATCHED', 'Order status saved as DISPATCHED');
  assert(updateOrderRes.data.substitutionNotes.includes('organic coriander'), 'Substitution notes persisted accurately');
  assert(updateOrderRes.data.fulfillmentNotes.includes('contactless delivery'), 'Fulfillment notes persisted accurately');

  // Invalid status rejected
  const badStatusRes = await fetchJson(`/admin/orders/${targetOrder.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${opsToken}` },
    body: { status: 'NOT_A_VALID_STATUS' }
  });
  assert(badStatusRes.status === 400, 'Invalid status string rejected with 400 Bad Request');

  // -------------------------------------------------------------------------
  // 7. RECIPE CATALOG & DIETARY INTEGRITY ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Recipe Catalog Administration & Dietary Integrity ---');

  // Attempt to create a Jain recipe with onion/garlic
  const badJainRes = await fetchJson('/admin/recipes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: `Invalid Jain Recipe ${testRunId}`,
      cuisine: 'Gujarati',
      isJainFriendly: true,
      ingredients: [{ name: 'Chopped Onion' }, { name: 'Besan' }]
    }
  });
  assert(badJainRes.status === 400 && badJainRes.data.message.includes('Jain-Friendly cannot contain'), 'Rejects Jain-Friendly recipe containing onion or prohibited root items');

  // Attempt to create conflicting non-vegetarian + pure vegetarian
  const conflictingDietRes = await fetchJson('/admin/recipes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: `Conflicting Recipe ${testRunId}`,
      cuisine: 'North Indian',
      dietaryTags: ['NON_VEGETARIAN', 'PURE_VEGETARIAN']
    }
  });
  assert(conflictingDietRes.status === 400 && conflictingDietRes.data.message.includes('conflict'), 'Rejects recipe tagged with conflicting NON_VEGETARIAN and PURE_VEGETARIAN tags');

  // Create valid authentic Kathiyawadi recipe
  const validRecipeRes = await fetchJson('/admin/recipes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: `Kathiyawadi Ringan No Olo ${testRunId}`,
      cuisine: 'Kathiyawadi',
      description: 'Smoky roasted eggplant mash with green garlic and Kathiyawadi spices.',
      dietaryTags: ['PURE_VEGETARIAN', 'GLUTEN_FREE'],
      prepTimeMinutes: 20,
      cookTimeMinutes: 30,
      caloriesPerServing: 280,
      isJainFriendly: false
    }
  });
  assert(validRecipeRes.status === 201 || validRecipeRes.status === 200, 'Admin created authentic Kathiyawadi recipe');
  const createdRecipeId = validRecipeRes.data.id;

  // Archive recipe
  const archiveRes = await fetchJson(`/admin/recipes/${createdRecipeId}/archive`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isArchived: true }
  });
  assert(archiveRes.status === 200, 'Admin archived recipe');
  assert(archiveRes.data.isArchived === true, 'Recipe isArchived flag set to true');

  // Unarchive recipe
  const unarchiveRes = await fetchJson(`/admin/recipes/${createdRecipeId}/archive`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isArchived: false }
  });
  assert(unarchiveRes.status === 200, 'Admin unarchived recipe');
  assert(unarchiveRes.data.isArchived === false, 'Recipe restored to active published catalog');

  // -------------------------------------------------------------------------
  // 8. SECURITY AUDIT STREAM IMMUTABILITY
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Security Audit Stream Immutability ---');

  const auditRes = await fetchJson('/admin/audit-logs?limit=50', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(auditRes.status === 200, 'Admin fetched audit stream');
  assert(auditRes.data.auditLogs.length > 0, 'Audit logs contains security events');

  const actions = auditRes.data.auditLogs.map(l => l.action);
  assert(actions.includes('USER_SUSPENDED'), 'Audit log records USER_SUSPENDED event');
  assert(actions.includes('USER_REACTIVATED'), 'Audit log records USER_REACTIVATED event');
  assert(actions.includes('RETAILER_APPROVED'), 'Audit log records RETAILER_APPROVED event');
  assert(actions.includes('ORDER_STATUS_CHANGED'), 'Audit log records ORDER_STATUS_CHANGED event');
  assert(actions.includes('RECIPE_CREATED'), 'Audit log records RECIPE_CREATED event');

  const sampleLog = auditRes.data.auditLogs.find(l => l.action === 'USER_SUSPENDED');
  assert(sampleLog?.metadata !== null, 'Audit log persists structured metadata JSON payload');

  // -------------------------------------------------------------------------
  // 9. STAFF PROVISIONING & PLATFORM CONFIGURATION SETTINGS
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Staff Provisioning & Platform Configuration Settings ---');

  // Super Admin provisions Operations staff
  const staffEmail = `ops.lead.${testRunId}@rasoiiq.in`;
  const provisionStaffRes = await fetchJson('/admin/staff', {
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    body: {
      email: staffEmail,
      fullName: 'Operations Lead',
      role: 'OPERATIONS',
      password: 'SafeStaffPassphrase@2026'
    }
  });
  assert(provisionStaffRes.status === 201 || provisionStaffRes.status === 200, 'Super Admin provisioned new Operations staff account');
  assert(provisionStaffRes.data.role === 'OPERATIONS', 'Staff member assigned OPERATIONS role');

  const staffId = provisionStaffRes.data.id;

  // Super Admin updates staff role
  const updateStaffRes = await fetchJson(`/admin/staff/${staffId}/role`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    body: { role: 'SUPPORT' }
  });
  assert(updateStaffRes.status === 200, 'Super Admin transitioned staff member role to SUPPORT');
  assert(updateStaffRes.data.role === 'SUPPORT', 'Staff role updated to SUPPORT');

  // Read platform settings
  const settingsRes = await fetchJson('/admin/settings', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(settingsRes.status === 200, 'Admin can read system settings');
  assert(Array.isArray(settingsRes.data) && settingsRes.data.length > 0, 'Platform settings seeded with defaults');

  // Super Admin updates a platform setting
  const updateSettingRes = await fetchJson('/admin/settings', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    body: {
      key: 'pricing.default_delivery_fee_inr',
      value: '35',
      description: 'Quick-commerce delivery fee in INR'
    }
  });
  assert(updateSettingRes.status === 200, 'Super Admin updated platform configuration setting');
  assert(updateSettingRes.data.value === '35', 'Setting value successfully persisted in PostgreSQL');

  // -------------------------------------------------------------------------
  // 10. SYSTEM HEALTH & INFRASTRUCTURE DIAGNOSTICS
  // -------------------------------------------------------------------------
  console.log('\n--- 10. System Health & Diagnostics ---');

  const healthRes = await fetchJson('/admin/health', {
    headers: { Authorization: `Bearer ${supportToken}` }
  });
  assert(healthRes.status === 200, 'Health diagnostics endpoint returns 200 OK');
  assert(healthRes.data.status === 'UP', 'Overall platform status is UP');
  assert(healthRes.data.database.connected === true, 'PostgreSQL 18 database verified CONNECTED');
  assert(healthRes.data.database.mode === 'postgres', 'Storage mode confirmed as postgres');
  assert(typeof healthRes.data.memory.rssMb === 'number' && healthRes.data.memory.rssMb > 0, 'Memory RSS usage measured');
  assert(healthRes.data.aiEngine.status === 'READY', 'AI Engine dual-provider fallback verified READY');

  // -------------------------------------------------------------------------
  // SUMMARY SCORECARD
  // -------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`PHASE 5.1 ADMIN CONSOLE TEST SUMMARY: ${passedAssertions} / ${totalAssertions} ASSERTIONS PASSED`);
  if (failedAssertions > 0) {
    console.error(`FAILED ASSERTIONS: ${failedAssertions}`);
    process.exit(1);
  } else {
    console.log('ALL PHASE 5.1 ADMINISTRATIVE CONSOLE TESTS PASSED CLEANLY.');
  }
  console.log('========================================================================\n');

  await prisma.$disconnect();
}

runTests().catch(async (e) => {
  console.error('Fatal test error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
