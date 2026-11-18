import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function analyze() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      userId: true,
      createdAt: true
    }
  });

  console.log(`Total orders to analyze: ${orders.length}`);

  let unambiguousCount = 0;
  let multipleCount = 0;
  let zeroCount = 0;
  const userHouseholdMap = new Map();

  for (const order of orders) {
    if (!userHouseholdMap.has(order.userId)) {
      const [ownedHouseholds, memberHouseholds] = await Promise.all([
        prisma.household.findMany({ where: { userId: order.userId }, select: { id: true } }),
        prisma.householdMember.findMany({ where: { userId: order.userId }, select: { householdId: true } })
      ]);
      const allHhIds = Array.from(new Set([
        ...ownedHouseholds.map(h => h.id),
        ...memberHouseholds.map(m => m.householdId)
      ]));
      userHouseholdMap.set(order.userId, allHhIds);
    }

    const hhIds = userHouseholdMap.get(order.userId);
    if (hhIds.length === 1) {
      unambiguousCount++;
    } else if (hhIds.length > 1) {
      multipleCount++;
    } else {
      zeroCount++;
    }
  }

  console.log(JSON.stringify({
    totalOrders: orders.length,
    unambiguousSingleHouseholdOrders: unambiguousCount,
    multipleHouseholdOrders: multipleCount,
    zeroHouseholdOrders: zeroCount,
    uniqueUsers: userHouseholdMap.size
  }, null, 2));

  await prisma.$disconnect();
}

analyze().catch(err => {
  console.error(err);
  process.exit(1);
});
