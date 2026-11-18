import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSmokeUsers() {
  const ids = ['cmwkwxauo008ll3mos42pjnr3', 'cmwkwz25k00adl3mo0v3y8ki4'];
  for (const id of ids) {
    const o = await prisma.order.findMany({ where: { userId: id } });
    console.log(`User ${id} orders:`, o);
  }
  await prisma.$disconnect();
}
checkSmokeUsers();
