import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function inspectUsers() {
  const users = await prisma.user.findMany({
    where: {
      orders: { some: {} }
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      households: { select: { id: true, name: true } },
      householdMembers: { select: { householdId: true, role: true, household: { select: { name: true } } } },
      _count: { select: { orders: true } }
    }
  });

  for (const u of users) {
    const owned = u.households.map(h => `${h.id} (${h.name})`);
    const member = u.householdMembers.map(m => `${m.householdId} (${m.household?.name}, role=${m.role})`);
    console.log(`User: ${u.id} | Email: ${u.email} | Orders: ${u._count.orders}`);
    console.log(`  Owned households (${owned.length}):`, owned);
    console.log(`  Member households (${member.length}):`, member);
  }

  await prisma.$disconnect();
}

inspectUsers().catch(console.error);
