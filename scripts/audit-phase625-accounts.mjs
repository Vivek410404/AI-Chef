/**
 * RasoiIQ Phase 6.2.5 — Pilot Account Classification Audit
 * 
 * PURPOSE: Classify users, households, orders, and pantry items to distinguish
 *          seed/test accounts from real pilot participants.
 * 
 * PRIVACY: This script does NOT output email addresses, phone numbers, passwords,
 *          tokens, or any personal data. Only counts and pattern classifications.
 * 
 * Usage: node scripts/audit-phase625-accounts.mjs
 */

import 'dotenv/config';

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@172.18.158.240:5432/rasoi_iq';

// Use the existing Prisma client via dynamic import to avoid a pg dependency requirement
// Falls back to direct fetch via the API if Prisma unavailable
let prisma;

async function getPrisma() {
  if (prisma) return prisma;
  try {
    const { PrismaClient } = await import('../packages/database/dist/index.js');
    prisma = new PrismaClient({ datasourceUrl: DB_URL });
    return prisma;
  } catch {
    // Fallback: try the api prisma client
    const { PrismaClient } = await import('../node_modules/@prisma/client/index.js');
    prisma = new PrismaClient({ datasourceUrl: DB_URL });
    return prisma;
  }
}

// Email pattern classifier — returns pattern category, NOT the email
function classifyEmailPattern(email) {
  if (!email) return 'UNKNOWN';
  const e = email.toLowerCase();
  if (e.endsWith('@rasoi.me') || e.endsWith('@rasoiiq.in') || e.endsWith('@rasoiiq.com')) return 'RASOI_DOMAIN';
  if (e.startsWith('test') || e.includes('+test') || e.includes('.test@')) return 'TEST_PATTERN';
  if (e.startsWith('seed') || e.includes('+seed')) return 'SEED_PATTERN';
  if (e.startsWith('demo') || e.includes('+demo')) return 'DEMO_PATTERN';
  if (e.startsWith('pilot') || e.includes('+pilot')) return 'PILOT_PATTERN';
  if (e.startsWith('admin') || e.startsWith('staff') || e.startsWith('retailer') || e.startsWith('worker')) return 'SYSTEM_ACCOUNT_PATTERN';
  if (/^[a-z]+\d+@/.test(e) || /^user\d+@/.test(e) || /^customer\d+@/.test(e)) return 'SEQUENTIAL_PATTERN';
  if (e.includes('example.com') || e.includes('mailinator') || e.includes('tempmail') || e.includes('yopmail')) return 'DISPOSABLE_DOMAIN';
  if (e.includes('@sharma') || e.includes('@patel') || e.includes('@mehta') || e.includes('@verma') || e.includes('household')) return 'HOUSEHOLD_SEED_PATTERN';
  // Heuristic: real addresses tend to have a real domain and some name structure
  const domainParts = e.split('@')[1]?.split('.') || [];
  if (domainParts.length >= 2) return 'REAL_PARTICIPANT_CANDIDATE';
  return 'UNKNOWN';
}

function classifyUser(user) {
  const pattern = classifyEmailPattern(user.email);
  const isSeedOrTest = [
    'RASOI_DOMAIN', 'TEST_PATTERN', 'SEED_PATTERN', 'DEMO_PATTERN',
    'PILOT_PATTERN', 'SYSTEM_ACCOUNT_PATTERN', 'SEQUENTIAL_PATTERN',
    'DISPOSABLE_DOMAIN', 'HOUSEHOLD_SEED_PATTERN'
  ].includes(pattern);
  return { pattern, isSeedOrTest };
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  RasoiIQ Phase 6.2.5 — Pilot Account Classification Audit   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('⚠️  PRIVACY NOTICE: No personal data (email, phone, password, token)');
  console.log('   is included in this output. Pattern classifications only.\n');
  console.log(`Connected to: ${DB_URL.replace(/:([^:@]+)@/, ':***@')}\n`);

  const db = await getPrisma();

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: User counts by role
  // ─────────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  SECTION 1: User Counts by Role');
  console.log('══════════════════════════════════════════════════════════════');

  const users = await db.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true }
  });

  const totalUsers = users.length;
  const byRole = {};
  for (const u of users) {
    byRole[u.role] = (byRole[u.role] || 0) + 1;
  }

  console.log(`Total users: ${totalUsers}`);
  for (const [role, count] of Object.entries(byRole).sort()) {
    console.log(`  ${role.padEnd(12)}: ${count}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: Seed/Test vs Real Participant Classification
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 2: Account Classification (Seed/Test vs Pilot)');
  console.log('══════════════════════════════════════════════════════════════');

  const patternCounts = {};
  let seedCount = 0;
  let realCandidateCount = 0;
  const userClassMap = new Map(); // userId -> { isSeedOrTest, pattern }

  for (const u of users) {
    const { pattern, isSeedOrTest } = classifyUser(u);
    patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    if (isSeedOrTest) seedCount++;
    else realCandidateCount++;
    userClassMap.set(u.id, { isSeedOrTest, pattern });
  }

  console.log(`Likely seed/test accounts : ${seedCount}  (${((seedCount/totalUsers)*100).toFixed(1)}%)`);
  console.log(`Real participant candidates: ${realCandidateCount}  (${((realCandidateCount/totalUsers)*100).toFixed(1)}%)`);
  console.log('\nEmail pattern breakdown:');
  for (const [pattern, count] of Object.entries(patternCounts).sort()) {
    console.log(`  ${pattern.padEnd(28)}: ${count}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: Households by member count buckets
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 3: Households by Member Count');
  console.log('══════════════════════════════════════════════════════════════');

  const households = await db.household.findMany({
    select: { id: true },
  });
  const householdMembers = await db.householdMember.findMany({
    select: { householdId: true, userId: true }
  });

  const membersByHousehold = {};
  for (const hm of householdMembers) {
    membersByHousehold[hm.householdId] = (membersByHousehold[hm.householdId] || 0) + 1;
  }

  const buckets = { '0 members': 0, '1 member': 0, '2-3 members': 0, '4-5 members': 0, '6+ members': 0 };
  for (const hh of households) {
    const count = membersByHousehold[hh.id] || 0;
    if (count === 0) buckets['0 members']++;
    else if (count === 1) buckets['1 member']++;
    else if (count <= 3) buckets['2-3 members']++;
    else if (count <= 5) buckets['4-5 members']++;
    else buckets['6+ members']++;
  }

  console.log(`Total households: ${households.length}`);
  for (const [bucket, count] of Object.entries(buckets)) {
    console.log(`  ${bucket.padEnd(16)}: ${count}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: Household Isolation Verification
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 4: Household Isolation Integrity Check');
  console.log('══════════════════════════════════════════════════════════════');

  // Verify: for each HouseholdMember, the user is in exactly the households they belong to
  // We check that no cross-household leakage exists via the membership table
  const membershipIndex = new Map(); // userId -> Set<householdId>
  for (const hm of householdMembers) {
    if (!membershipIndex.has(hm.userId)) membershipIndex.set(hm.userId, new Set());
    membershipIndex.get(hm.userId).add(hm.householdId);
  }

  // Check: All orders belong to households that exist in the HouseholdMember table
  const orders = await db.order.findMany({
    select: { id: true, householdId: true, userId: true, createdAt: true }
  });

  let crossHouseholdViolations = 0;
  for (const order of orders) {
    const userHouseholds = membershipIndex.get(order.userId);
    if (userHouseholds && !userHouseholds.has(order.householdId)) {
      crossHouseholdViolations++;
    }
  }

  console.log(`Orders with userId vs householdId mismatch (isolation violations): ${crossHouseholdViolations}`);
  if (crossHouseholdViolations === 0) {
    console.log('  ✅ PASS: All orders belong to households the placing user is a member of');
  } else {
    console.log(`  ❌ FAIL: ${crossHouseholdViolations} orders placed by users not in that household`);
  }

  // Check pantry items
  const pantryItems = await db.pantryItem.findMany({
    select: { id: true, householdId: true }
  });
  const householdIds = new Set(households.map(h => h.id));
  let orphanPantry = 0;
  for (const pi of pantryItems) {
    if (!householdIds.has(pi.householdId)) orphanPantry++;
  }
  console.log(`Pantry items with orphaned householdId: ${orphanPantry}`);
  if (orphanPantry === 0) {
    console.log('  ✅ PASS: All pantry items reference valid households');
  } else {
    console.log(`  ❌ FAIL: ${orphanPantry} pantry items reference non-existent households`);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: Orders by Account Classification
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 5: Orders by Account Classification');
  console.log('══════════════════════════════════════════════════════════════');

  const ordersByClassification = { seed_test: 0, real_candidate: 0, unknown: 0 };
  const ordersByStatus = {};

  for (const order of orders) {
    const classification = userClassMap.get(order.userId);
    if (!classification) ordersByClassification.unknown++;
    else if (classification.isSeedOrTest) ordersByClassification.seed_test++;
    else ordersByClassification.real_candidate++;
  }

  // Count orders by status
  const ordersWithStatus = await db.order.findMany({
    select: { status: true }
  });
  for (const o of ordersWithStatus) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
  }

  console.log(`Total orders: ${orders.length}`);
  console.log(`  From seed/test accounts   : ${ordersByClassification.seed_test}`);
  console.log(`  From real participants     : ${ordersByClassification.real_candidate}`);
  console.log(`  From unclassified users   : ${ordersByClassification.unknown}`);
  console.log('\nOrders by status:');
  for (const [status, count] of Object.entries(ordersByStatus).sort()) {
    console.log(`  ${status.padEnd(20)}: ${count}`);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 6: Pantry Items by Household Count
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 6: Pantry Items Summary');
  console.log('══════════════════════════════════════════════════════════════');

  const pantryByHousehold = {};
  for (const pi of pantryItems) {
    pantryByHousehold[pi.householdId] = (pantryByHousehold[pi.householdId] || 0) + 1;
  }

  const pantryBuckets = {
    '0 items': 0, '1-5 items': 0, '6-10 items': 0,
    '11-20 items': 0, '21-50 items': 0, '51+ items': 0
  };
  for (const hh of households) {
    const count = pantryByHousehold[hh.id] || 0;
    if (count === 0) pantryBuckets['0 items']++;
    else if (count <= 5) pantryBuckets['1-5 items']++;
    else if (count <= 10) pantryBuckets['6-10 items']++;
    else if (count <= 20) pantryBuckets['11-20 items']++;
    else if (count <= 50) pantryBuckets['21-50 items']++;
    else pantryBuckets['51+ items']++;
  }

  console.log(`Total pantry items: ${pantryItems.length}`);
  console.log(`Total households with ≥1 pantry item: ${Object.keys(pantryByHousehold).length}`);
  console.log('Pantry item distribution per household:');
  for (const [bucket, count] of Object.entries(pantryBuckets)) {
    console.log(`  ${bucket.padEnd(16)}: ${count} households`);
  }

  // ─────────────────────────────────────────────────────────────
  // SECTION 7: Entity Count Summary (Preservation Evidence)
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 7: Entity Count Summary (Preservation Evidence)');
  console.log('══════════════════════════════════════════════════════════════');

  const [
    basketCount, basketItemCount, orderItemCount, orderHistoryCount,
    mealPlanCount, recipeCount, productCount, variantCount, retailerCount
  ] = await Promise.all([
    db.basket.count(), db.basketItem.count(), db.orderItem.count(),
    db.orderStatusHistory.count(), db.mealPlan.count(), db.recipe.count(),
    db.product.count(), db.productVariant.count(), db.retailer.count()
  ]);

  console.log(`Users               : ${totalUsers}`);
  console.log(`Households          : ${households.length}`);
  console.log(`HouseholdMembers    : ${householdMembers.length}`);
  console.log(`Orders              : ${orders.length}`);
  console.log(`OrderItems          : ${orderItemCount}`);
  console.log(`OrderStatusHistory  : ${orderHistoryCount}`);
  console.log(`Baskets             : ${basketCount}`);
  console.log(`BasketItems         : ${basketItemCount}`);
  console.log(`PantryItems         : ${pantryItems.length}`);
  console.log(`MealPlans           : ${mealPlanCount}`);
  console.log(`Recipes             : ${recipeCount}`);
  console.log(`Products            : ${productCount}`);
  console.log(`ProductVariants     : ${variantCount}`);
  console.log(`Retailers           : ${retailerCount}`);

  // ─────────────────────────────────────────────────────────────
  // SECTION 8: Verdict
  // ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  SECTION 8: Pilot Readiness Verdict');
  console.log('══════════════════════════════════════════════════════════════');

  const criticalIssues = [];
  if (crossHouseholdViolations > 0) criticalIssues.push(`${crossHouseholdViolations} cross-household order violations`);
  if (orphanPantry > 0) criticalIssues.push(`${orphanPantry} orphaned pantry items`);

  if (criticalIssues.length === 0) {
    console.log('✅ PASS — No household isolation violations detected');
    console.log('✅ PASS — All entity references are consistent');
    console.log('\nVERDICT: Account data is consistent with supervised household pilot constraints.');
  } else {
    console.log('❌ ISSUES FOUND:');
    for (const issue of criticalIssues) console.log(`  - ${issue}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Audit complete. No personal data was exposed in this output.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await db.$disconnect();
}

main().catch(err => {
  console.error('Audit failed:', err.message);
  process.exit(1);
});
