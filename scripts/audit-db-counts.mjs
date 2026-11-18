import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getCounts() {
  const [
    users,
    households,
    householdMembers,
    recipes,
    products,
    productVariants,
    storeProducts,
    pantryItems,
    orders,
    orderItems,
    orderStatusHistory
  ] = await Promise.all([
    prisma.user.count(),
    prisma.household.count(),
    prisma.householdMember.count(),
    prisma.recipe.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.storeProduct.count(),
    prisma.pantryItem.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.orderStatusHistory.count()
  ]);

  return {
    users,
    households,
    householdMembers,
    recipes,
    products,
    productVariants,
    storeProducts,
    pantryItems,
    orders,
    orderItems,
    orderStatusHistory,
    timestamp: new Date().toISOString()
  };
}

async function main() {
  const counts = await getCounts();
  console.log('DATABASE_COUNTS_BASELINE:', JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
