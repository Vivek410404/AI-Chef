import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAll() {
  const orders = await prisma.order.findMany();
  console.log(`Checking ${orders.length} orders...`);

  let resolved = 0;
  let unresolved = 0;
  const householdOrderCount = new Map();

  for (const o of orders) {
    let targetHouseholdId = null;
    if (o.userId === 'user-demo-1') {
      targetHouseholdId = 'hh-sharma-family';
    } else if (o.userId === 'user-demo-patel') {
      targetHouseholdId = 'hh-patel-family';
    } else if (o.userId === 'user-demo-mehta') {
      targetHouseholdId = 'hh-mehta-family';
    } else {
      const owned = await prisma.household.findMany({ where: { userId: o.userId }, orderBy: { createdAt: 'asc' } });
      if (owned.length > 0) {
        targetHouseholdId = owned[0].id;
      } else {
        const mem = await prisma.householdMember.findMany({ where: { userId: o.userId }, orderBy: { createdAt: 'asc' } });
        if (mem.length > 0) {
          targetHouseholdId = mem[0].householdId;
        }
      }
    }

    if (targetHouseholdId) {
      resolved++;
      householdOrderCount.set(targetHouseholdId, (householdOrderCount.get(targetHouseholdId) || 0) + 1);
    } else {
      unresolved++;
      console.log('UNRESOLVED ORDER:', o.id, o.userId);
    }
  }

  console.log(JSON.stringify({
    totalOrders: orders.length,
    resolved,
    unresolved,
    distinctHouseholds: householdOrderCount.size
  }, null, 2));

  await prisma.$disconnect();
}

checkAll().catch(console.error);
