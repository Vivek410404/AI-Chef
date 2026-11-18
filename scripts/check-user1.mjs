import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser1() {
  const members = await prisma.householdMember.findMany({
    where: { userId: 'user-demo-1' },
    include: { household: true }
  });
  console.log('user-demo-1 memberships:', JSON.stringify(members, null, 2));
  await prisma.$disconnect();
}
checkUser1();
