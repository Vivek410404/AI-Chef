import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 RasoiIQ Phase 6.2.3 Database Integrity Audit');
  console.log('====================================================\n');

  // 1. Table Counts
  const counts = {
    users: await prisma.user.count(),
    households: await prisma.household.count(),
    products: await prisma.product.count(),
    productVariants: await prisma.productVariant.count(),
    storeProducts: await prisma.storeProduct.count(),
    pantryItems: await prisma.pantryItem.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    orderStatusHistory: await prisma.orderStatusHistory.count()
  };
  console.log('📊 Entity Row Counts:');
  console.table(counts);

  // 2. Foreign-Key Referential Integrity (Raw SQL checks for orphaned records)
  const [orphanItems] = await prisma.$queryRawUnsafe(`
    SELECT count(*)::int as count FROM "OrderItem" WHERE "orderId" NOT IN (SELECT "id" FROM "Order");
  `);
  const [orphanHistory] = await prisma.$queryRawUnsafe(`
    SELECT count(*)::int as count FROM "OrderStatusHistory" WHERE "orderId" NOT IN (SELECT "id" FROM "Order");
  `);
  const [orphanPantry] = await prisma.$queryRawUnsafe(`
    SELECT count(*)::int as count FROM "PantryItem" WHERE "householdId" NOT IN (SELECT "id" FROM "Household");
  `);

  console.log('\n🔒 Referential Integrity / Orphan Records:');
  console.log(`- Orphan OrderItems: ${orphanItems.count}`);
  console.log(`- Orphan OrderStatusHistory: ${orphanHistory.count}`);
  console.log(`- Orphan PantryItems: ${orphanPantry.count}`);

  // 3. Order-to-OrderItem consistency
  const ordersWithoutItems = await prisma.order.count({
    where: {
      items: { none: {} }
    }
  });
  console.log(`- Orders with zero items: ${ordersWithoutItems}`);

  // 4. Order status distribution
  const statusGroups = await prisma.order.groupBy({
    by: ['status'],
    _count: { _all: true }
  });
  console.log('\n📦 Order Status Distribution:');
  console.table(statusGroups.map(g => ({ status: g.status, count: g._count._all })));

  // 5. Test generated vs pilot baseline orders
  const testGeneratedOrders = await prisma.order.count({
    where: {
      id: { startsWith: 'ord-' }
    }
  });
  const baselineOrders = counts.orders - testGeneratedOrders;
  console.log('\n🏷️  Order Provenance Breakdown:');
  console.log(`- Baseline Pilot Orders: ${baselineOrders}`);
  console.log(`- Test-Generated Orders: ${testGeneratedOrders}`);
  console.log(`- Total Orders in Database: ${counts.orders}`);

  // 6. Snapshot Preservation Check
  const snapshotItems = await prisma.orderItem.findMany({
    where: {
      productName: { not: null }
    },
    take: 5,
    select: {
      id: true,
      orderId: true,
      productName: true,
      brand: true,
      packSize: true,
      unitPriceInr: true
    }
  });
  console.log('\n📸 Sample Preserved OrderItem Snapshots:');
  console.table(snapshotItems);

  await prisma.$disconnect();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
