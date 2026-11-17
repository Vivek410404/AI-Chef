import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count(),
    households: await prisma.household.count(),
    householdMembers: await prisma.householdMember.count(),
    recipes: await prisma.recipe.count(),
    ingredients: await prisma.ingredient.count(),
    products: await prisma.product.count(),
    productVariants: await prisma.productVariant.count(),
    storeProducts: await prisma.storeProduct.count(),
    pantryItems: await prisma.pantryItem.count(),
    baskets: await prisma.basket.count(),
    basketItems: await prisma.basketItem.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    orderStatusHistories: await prisma.orderStatusHistory.count(),
  };

  console.log('=== PILOT DATABASE TABLE COUNTS ===');
  console.log(JSON.stringify(counts, null, 2));

  // Check oldest and newest order timestamps
  const oldestOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'asc' } });
  const newestOrder = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } });
  const oldestUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  const newestUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });

  console.log('\n=== TIMELINE METRICS ===');
  console.log(`User Earliest: ${oldestUser?.createdAt?.toISOString()}`);
  console.log(`User Latest:   ${newestUser?.createdAt?.toISOString()}`);
  console.log(`Order Earliest: ${oldestOrder?.createdAt?.toISOString()}`);
  console.log(`Order Latest:   ${newestOrder?.createdAt?.toISOString()}`);

  // Count orders before and after Nov 17 12:13 UTC
  const preCutoff = await prisma.order.count({
    where: { createdAt: { lt: new Date('2026-11-17T12:13:00Z') } }
  });
  const postCutoff = await prisma.order.count({
    where: { createdAt: { gte: new Date('2026-11-17T12:13:00Z') } }
  });

  console.log(`Pre-migration Orders (< 2026-11-17 12:13 UTC): ${preCutoff}`);
  console.log(`Post-migration Orders (>= 2026-11-17 12:13 UTC): ${postCutoff}`);

  // Order status breakdown
  const statuses = await prisma.order.groupBy({
    by: ['status'],
    _count: true
  });
  console.log('\n=== ORDER STATUS BREAKDOWN ===');
  console.log(JSON.stringify(statuses, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
