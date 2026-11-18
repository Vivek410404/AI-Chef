import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function verifyMigration() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      householdId: true,
      userId: true
    }
  });

  const total = orders.length;
  let nullOrEmptyCount = 0;
  const householdCountMap = new Map();

  for (const o of orders) {
    if (!o.householdId || o.householdId.trim() === '') {
      nullOrEmptyCount++;
    } else {
      householdCountMap.set(o.householdId, (householdCountMap.get(o.householdId) || 0) + 1);
    }
  }

  console.log(JSON.stringify({
    totalOrders: total,
    ordersWithNullOrEmptyHouseholdId: nullOrEmptyCount,
    distinctHouseholdsWithOrders: householdCountMap.size,
    sharmaFamilyOrders: householdCountMap.get('hh-sharma-family'),
    patelFamilyOrders: householdCountMap.get('hh-patel-family'),
    mehtaFamilyOrders: householdCountMap.get('hh-mehta-family')
  }, null, 2));

  await prisma.$disconnect();
}

verifyMigration().catch(console.error);
