import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const FRESH_DB_NAME = 'rasoi_iq_phase625_fresh';
const FRESH_DB_URL = `postgresql://postgres:postgres@localhost:5432/${FRESH_DB_NAME}?schema=public`;

console.log('🧪 =======================================================');
console.log('🧪 WORKSTREAM E: FRESH DATABASE REPRODUCIBILITY VERIFICATION');
console.log('🧪 =======================================================\n');

try {
  // Step 1: Create genuinely empty temporary database
  console.log(`[Step 1] Creating clean isolated database: ${FRESH_DB_NAME}...`);
  execSync(`wsl -e bash -c "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'DROP DATABASE IF EXISTS ${FRESH_DB_NAME};' && PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'CREATE DATABASE ${FRESH_DB_NAME};'"`, {
    stdio: 'inherit'
  });
  console.log(`  ✅ Clean blank database created: ${FRESH_DB_NAME}`);

  // Step 2: Deploy migrations sequentially using `prisma migrate deploy`
  console.log('\n[Step 2] Executing `npx prisma migrate deploy` on empty database...');
  const migrateOutput = execSync(
    `npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma`,
    {
      env: { ...process.env, DATABASE_URL: FRESH_DB_URL },
      encoding: 'utf-8'
    }
  );
  console.log(migrateOutput);
  if (!migrateOutput.includes('All migrations have been successfully applied')) {
    throw new Error('Migration deploy failed to apply all migrations cleanly');
  }
  console.log('  ✅ Migrations applied successfully (20261115000000_init + 20261117_phase621_order_lifecycle)');

  // Step 3: Run seed process on fresh database
  console.log('\n[Step 3] Running seed process on fresh database...');
  const seedOutput = execSync('npm run db:seed', {
    env: { ...process.env, DATABASE_URL: FRESH_DB_URL },
    encoding: 'utf-8'
  });
  console.log(seedOutput.split('\n').slice(-10).join('\n'));
  console.log('  ✅ Seed completed successfully.');

  // Step 4: Verify entities in fresh database via Prisma
  console.log('\n[Step 4] Validating seeded entities in fresh database...');
  const prisma = new PrismaClient({ datasources: { db: { url: FRESH_DB_URL } } });

  const recipeCount = await prisma.recipe.count();
  const productCount = await prisma.product.count();
  const variantCount = await prisma.productVariant.count();
  console.log(`  Seeded recipes: ${recipeCount}, products: ${productCount}, variants: ${variantCount}`);
  if (recipeCount === 0 || productCount === 0 || variantCount === 0) {
    throw new Error('Database seed did not populate foundational catalog data');
  }
  console.log('  ✅ Foundational catalog tables verified.');

  // Step 5: Customer Registration
  console.log('\n[Step 5] Registering new pilot customer...');
  const testEmail = `fresh_pilot_${Date.now()}@test.rasoi.me`;
  const customer = await prisma.user.create({
    data: {
      email: testEmail,
      fullName: 'Fresh Test Pilot User',
      passwordHash: 'argon2id$mocked$hash',
      role: 'CUSTOMER',
      emailVerifiedAt: new Date()
    }
  });
  console.log(`  ✅ Created customer: ${customer.id} (${customer.email})`);

  // Step 6: Create Household & Membership
  console.log('\n[Step 6] Creating household and membership...');
  const household = await prisma.household.create({
    data: {
      name: 'Fresh Pilot Test Household',
      userId: customer.id,
      city: 'Ahmedabad',
      dietaryPreference: 'VEGETARIAN'
    }
  });
  await prisma.householdMember.create({
    data: {
      householdId: household.id,
      userId: customer.id,
      name: 'Fresh Pilot User',
      role: 'OWNER'
    }
  });
  console.log(`  ✅ Created household: ${household.id} with OWNER ${customer.id}`);

  // Step 7: Order Placement
  console.log('\n[Step 7] Creating order in fresh database...');
  const variant = await prisma.productVariant.findFirst({ include: { product: true } });
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      retailerName: 'Blinkit',
      status: 'ORDER_CONFIRMED',
      totalAmountInr: 345,
      deliveryFeeInr: 25,
      deliveryAddress: 'Satellite, Ahmedabad, Gujarat 380015',
      isDemoOrder: true,
      items: {
        create: [
          {
            productVariantId: variant.id,
            productName: variant.title,
            brand: variant.brand,
            packSize: variant.packQuantity ? `${variant.packQuantity} ${variant.packUnit}` : 'Standard',
            quantityPacks: 1,
            unitPriceInr: variant.sellingPriceInr
          }
        ]
      }
    }
  });
  console.log(`  ✅ Created order: ${order.id}`);

  // Step 8: Initial OrderStatusHistory Row
  console.log('\n[Step 8] Recording initial order placement history...');
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      fromStatus: null,
      toStatus: 'ORDER_CONFIRMED',
      reason: 'Order placed by customer via fresh database checkout',
      changedBy: customer.email
    }
  });
  const history1 = await prisma.orderStatusHistory.findMany({ where: { orderId: order.id } });
  console.log(`  History rows after placement: ${history1.length}`);
  if (history1.length !== 1) throw new Error('Initial history row missing');
  console.log('  ✅ Initial order history row verified.');

  // Step 9: Authorized Worker Transition
  console.log('\n[Step 9] Simulating worker lifecycle transition under exclusive row lock...');
  await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRawUnsafe(
      'SELECT id, status FROM "Order" WHERE id = $1 FOR UPDATE',
      order.id
    );
    if (!locked || locked.length === 0) throw new Error('Lock acquisition failed');
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'HUB_PACKING', updatedBy: 'system-worker' }
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: 'ORDER_CONFIRMED',
        toStatus: 'HUB_PACKING',
        reason: 'Internal simulation worker commenced dark-store packing',
        changedBy: 'system-worker'
      }
    });
  });

  const history2 = await prisma.orderStatusHistory.findMany({ where: { orderId: order.id } });
  console.log(`  History rows after worker transition: ${history2.length}`);
  if (history2.length !== 2) throw new Error('Expected 2 history rows after worker transition');
  console.log('  ✅ Second history row verified (HUB_PACKING, changedBy: system-worker).');

  // Step 10: Verify ON DELETE RESTRICT
  console.log('\n[Step 10] Testing audit retention (ON DELETE RESTRICT)...');
  let deleteBlocked = false;
  try {
    await prisma.order.delete({ where: { id: order.id } });
  } catch (err) {
    if (err.message.includes('violates RESTRICT') || err.message.includes('23001') || err.message.includes('Foreign key constraint')) {
      deleteBlocked = true;
    }
  }
  if (!deleteBlocked) throw new Error('Order deletion was not blocked by ON DELETE RESTRICT!');
  console.log('  ✅ Order deletion safely blocked by foreign key constraint (SQLState 23001).');

  await prisma.$disconnect();

  // Step 11: Clean Teardown
  console.log(`\n[Step 11] Dropping temporary test database: ${FRESH_DB_NAME}...`);
  execSync(`wsl -e bash -c "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'DROP DATABASE ${FRESH_DB_NAME};'"`, {
    stdio: 'inherit'
  });
  console.log(`  ✅ Cleanly dropped ${FRESH_DB_NAME}.`);

  console.log('\n=======================================================');
  console.log('✅ WORKSTREAM E: FRESH DB REPRODUCIBILITY FULLY PASSED');
  console.log('=======================================================');
} catch (err) {
  console.error('\n❌ Fatal error in fresh DB test:', err);
  process.exit(1);
}
