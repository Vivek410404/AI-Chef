import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkMembers() {
  const hhs = ['hh-sharma-family', 'hh-patel-family', 'hh-mehta-family'];
  for (const id of hhs) {
    const hh = await prisma.household.findUnique({ where: { id }, include: { members: true } });
    console.log(`Household: ${id} -> owner userId: ${hh?.userId}, members: ${hh?.members?.length}`);
    if (hh?.members) {
      for (const m of hh.members) {
        console.log(`   member: ${m.name}, userId: ${m.userId}, role: ${m.role}, status: ${m.status}`);
      }
    }
  }
  await prisma.$disconnect();
}
checkMembers();
