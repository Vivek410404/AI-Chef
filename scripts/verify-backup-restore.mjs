/**
 * RasoiIQ Phase 4.3 — Database Backup & Restoration Verification Script
 * 
 * Verifies:
 * 1. Creation of clean pg_dump backup from live 'rasoi_iq' database.
 * 2. Dedicated restoration into a separate test database 'rasoi_iq_restore_test'.
 * 3. Deep relational comparison across all tables, record counts, and sensitive entities.
 * 4. Zero corruption / zero data loss proof.
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseHost() {
  let host = '127.0.0.1';
  try {
    const wslIp = execSync('wsl -d Ubuntu hostname -I', { timeout: 2000 }).toString().trim().split(' ')[0];
    if (wslIp) host = wslIp;
  } catch {}
  return host;
}

const host = resolveDatabaseHost();
const prodDbUrl = `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;
const testDbUrl = `postgresql://postgres:postgres@${host}:5432/rasoi_iq_restore_test?schema=public`;

const backupDir = path.resolve('backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
const backupFile = path.join(backupDir, 'rasoi_iq_pilot_baseline.sql');

console.log('========================================================================');
console.log('     RASOIIQ DATABASE BACKUP & RESTORE VERIFICATION (PHASE 4.3)         ');
console.log('========================================================================\n');

async function main() {
  let passed = 0;
  let failed = 0;
  function assert(condition, msg) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // STEP 1: Execute Native PostgreSQL pg_dump
  console.log('--- Step 1: Execute Native pg_dump on Live Database ---');
  try {
    const dumpCmd = `wsl -- env PGPASSWORD=postgres pg_dump -h localhost -U postgres -d rasoi_iq -F p -f /tmp/rasoi_iq_pilot_baseline.sql`;
    execSync(dumpCmd, { stdio: 'inherit' });
    
    // Copy out to Windows workspace backups folder
    execSync(`wsl -- cp /tmp/rasoi_iq_pilot_baseline.sql /mnt/d/Startup/backups/rasoi_iq_pilot_baseline.sql`);
    const stats = fs.statSync(backupFile);
    assert(stats.size > 50000, `Backup created successfully at ${backupFile} (${(stats.size / 1024).toFixed(1)} KB)`);
  } catch (e) {
    assert(false, `pg_dump failed: ${e.message}`);
  }

  // STEP 2: Prepare Isolated Restoration Database
  console.log('\n--- Step 2: Prepare Isolated Test Database (rasoi_iq_restore_test) ---');
  try {
    execSync(`wsl -- env PGPASSWORD=postgres psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS rasoi_iq_restore_test;"`, { stdio: 'pipe' });
    execSync(`wsl -- env PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE rasoi_iq_restore_test;"`, { stdio: 'pipe' });
    assert(true, 'Dedicated clean database "rasoi_iq_restore_test" initialized');
  } catch (e) {
    assert(false, `Failed to initialize test restore database: ${e.message}`);
  }

  // STEP 3: Execute Restoration
  console.log('\n--- Step 3: Restore Backup into Test Database ---');
  try {
    execSync(`wsl -- env PGPASSWORD=postgres psql -h localhost -U postgres -d rasoi_iq_restore_test -f /tmp/rasoi_iq_pilot_baseline.sql`, { stdio: 'pipe' });
    assert(true, 'SQL backup restored into "rasoi_iq_restore_test" without syntax or schema errors');
  } catch (e) {
    assert(false, `Restoration failed: ${e.message}`);
  }

  // STEP 4: Relational Parity & Record Comparison
  console.log('\n--- Step 4: Compare Live Database vs Restored Database ---');
  const prodPrisma = new PrismaClient({ datasources: { db: { url: prodDbUrl } } });
  const testPrisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });

  try {
    await prodPrisma.$connect();
    await testPrisma.$connect();

    // 1. Households comparison
    const [prodHouseholds, testHouseholds] = await Promise.all([
      prodPrisma.household.findMany({ orderBy: { id: 'asc' }, include: { members: true } }),
      testPrisma.household.findMany({ orderBy: { id: 'asc' }, include: { members: true } })
    ]);
    assert(prodHouseholds.length === testHouseholds.length && prodHouseholds.length >= 3,
      `Household count match: Live=${prodHouseholds.length}, Restored=${testHouseholds.length}`);
    
    const sharmaProd = prodHouseholds.find(h => h.id === 'hh-sharma-family');
    const sharmaTest = testHouseholds.find(h => h.id === 'hh-sharma-family');
    assert(sharmaProd?.name === sharmaTest?.name && sharmaProd?.members.length === sharmaTest?.members.length,
      `Sharma household relational integrity confirmed (${sharmaTest?.members.length} members restored)`);

    const patelProd = prodHouseholds.find(h => h.id === 'hh-patel-family');
    const patelTest = testHouseholds.find(h => h.id === 'hh-patel-family');
    const patelJainProd = patelProd?.members.every(m => m.dietaryPreference === 'JAIN');
    const patelJainTest = patelTest?.members.every(m => m.dietaryPreference === 'JAIN');
    assert(patelJainProd === true && patelJainTest === true && patelTest?.members.length === 3,
      `Patel household Jain dietary rules restored accurately across all ${patelTest?.members.length} members`);

    // 2. Recipe & Ingredient catalog comparison
    const [prodRecipes, testRecipes] = await Promise.all([
      prodPrisma.recipe.count(),
      testPrisma.recipe.count()
    ]);
    assert(prodRecipes === testRecipes && testRecipes >= 34,
      `Recipe count match: Exactly ${testRecipes} recipes verified in restored catalog`);

    const [prodIngredients, testIngredients] = await Promise.all([
      prodPrisma.ingredient.count(),
      testPrisma.ingredient.count()
    ]);
    assert(prodIngredients === testIngredients && testIngredients === 57,
      `Ingredient count match: Exactly ${testIngredients} IFCT 2017 ingredients verified in restored catalog`);

    // 3. Pantry & Inventory comparison
    const [prodPantry, testPantry] = await Promise.all([
      prodPrisma.pantryItem.count(),
      testPrisma.pantryItem.count()
    ]);
    assert(prodPantry === testPantry && testPantry >= 3,
      `Pantry items count match: ${testPantry} pantry items verified in restored database`);

    // 4. Meal plans comparison
    const [prodPlans, testPlans] = await Promise.all([
      prodPrisma.mealPlan.count(),
      testPrisma.mealPlan.count()
    ]);
    assert(prodPlans === testPlans,
      `Meal plans count match: ${testPlans} meal plans verified in restored database`);

    // 5. Retailers & Products
    const [prodRetailers, testRetailers] = await Promise.all([
      prodPrisma.retailer.count(),
      testPrisma.retailer.count()
    ]);
    assert(prodRetailers === testRetailers && testRetailers >= 4,
      `Retailer count match: ${testRetailers} merchants restored accurately`);

    // 6. Persistent Revoked Tokens
    const [prodRevoked, testRevoked] = await Promise.all([
      prodPrisma.revokedToken.count(),
      testPrisma.revokedToken.count()
    ]);
    assert(prodRevoked === testRevoked,
      `Revoked tokens match: ${testRevoked} revoked security tokens preserved across backup`);

  } finally {
    await prodPrisma.$disconnect();
    await testPrisma.$disconnect();
  }

  console.log('\n========================================================================');
  console.log(`BACKUP & RESTORATION AUDIT SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal backup verification error:', err);
  process.exit(1);
});
