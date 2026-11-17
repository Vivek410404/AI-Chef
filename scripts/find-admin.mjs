import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'OPERATIONS'] } },
    select: { id: true, email: true, role: true }
  });
  console.log('Admins:', admins);
  await prisma.$disconnect();
}
main();
