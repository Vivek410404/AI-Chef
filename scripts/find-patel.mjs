import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'demo' } },
    select: { id: true, email: true, role: true }
  });
  console.log('Users:', users);
  await prisma.$disconnect();
}
main();
