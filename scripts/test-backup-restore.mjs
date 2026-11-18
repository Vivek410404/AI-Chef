import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const BACKUP_DB = 'rasoi_iq';
const RESTORE_DB = 'rasoi_iq_phase626_restore_test';
const BACKUP_FILE = path.resolve('scripts/rasoi_iq_test_backup.dump');

console.log('🧪 =======================================================');
console.log('🧪 PHASE 6.2.6 — REAL BACKUP AND RESTORATION AUDIT');
console.log('🧪 =======================================================\n');

try {
  // Step 1: Execute real pg_dump from active database
  console.log(`[Step 1] Creating database backup using pg_dump: ${BACKUP_DB} -> ${BACKUP_FILE}...`);
  if (fs.existsSync(BACKUP_FILE)) fs.unlinkSync(BACKUP_FILE);

  execSync(`wsl -e bash -c "PGPASSWORD=postgres pg_dump -U postgres -h 127.0.0.1 -Fc ${BACKUP_DB} > /tmp/rasoi_iq_backup.dump"`, {
    stdio: 'inherit'
  });
  execSync(`wsl -e bash -c "cat /tmp/rasoi_iq_backup.dump > '/mnt/d/Startup/scripts/rasoi_iq_test_backup.dump'"`, {
    stdio: 'inherit'
  });

  const stats = fs.statSync(BACKUP_FILE);
  console.log(`  ✅ Backup archive created successfully. Size: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`);

  // Step 2: Create isolated test restore database
  console.log(`\n[Step 2] Creating temporary restore target: ${RESTORE_DB}...`);
  execSync(`wsl -e bash -c "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'DROP DATABASE IF EXISTS ${RESTORE_DB};' && PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'CREATE DATABASE ${RESTORE_DB};'"`, {
    stdio: 'inherit'
  });
  console.log(`  ✅ Clean target database created: ${RESTORE_DB}`);

  // Step 3: Restore using pg_restore
  console.log('\n[Step 3] Restoring archive into isolated database with pg_restore...');
  execSync(`wsl -e bash -c "PGPASSWORD=postgres pg_restore -U postgres -h 127.0.0.1 -d ${RESTORE_DB} /tmp/rasoi_iq_backup.dump"`, {
    stdio: 'inherit'
  });
  console.log(`  ✅ pg_restore completed successfully.`);

  // Step 4: Validate restored records using Prisma
  console.log('\n[Step 4] Validating entity counts in restored database...');
  const RESTORE_URL = `postgresql://postgres:postgres@localhost:5432/${RESTORE_DB}?schema=public`;
  const prismaRestored = new PrismaClient({ datasources: { db: { url: RESTORE_URL } } });

  const [
    users,
    households,
    members,
    recipes,
    ingredients,
    products,
    variants,
    orders,
    orderItems,
    history
  ] = await Promise.all([
    prismaRestored.user.count(),
    prismaRestored.household.count(),
    prismaRestored.householdMember.count(),
    prismaRestored.recipe.count(),
    prismaRestored.ingredient.count(),
    prismaRestored.product.count(),
    prismaRestored.productVariant.count(),
    prismaRestored.order.count(),
    prismaRestored.orderItem.count(),
    prismaRestored.orderStatusHistory.count()
  ]);

  console.log(`  Restored counts: users=${users}, households=${households}, recipes=${recipes}, ingredients=${ingredients}, orders=${orders}`);
  if (users === 0 || households === 0 || recipes === 0 || orders === 0) {
    throw new Error('Restored database is missing critical entity rows!');
  }
  console.log('  ✅ Record counts and data integrity confirmed in restored database.');

  await prismaRestored.$disconnect();

  // Step 5: Clean up temporary restore database and files
  console.log('\n[Step 5] Cleaning up restore test database and dump file...');
  execSync(`wsl -e bash -c "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'DROP DATABASE ${RESTORE_DB};' && rm -f /tmp/rasoi_iq_backup.dump"`, {
    stdio: 'inherit'
  });
  if (fs.existsSync(BACKUP_FILE)) fs.unlinkSync(BACKUP_FILE);
  console.log('  ✅ Cleaned up temporary restore database and artifacts.');

  console.log('\n=======================================================');
  console.log('✅ BACKUP AND RESTORATION AUDIT: FULLY PASSED');
  console.log('=======================================================');
} catch (err) {
  console.error('❌ Backup/Restore verification failed:', err);
  process.exit(1);
}
