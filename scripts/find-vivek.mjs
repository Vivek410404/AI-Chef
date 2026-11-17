import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findUnique({
    where: { id: 'cmwjb5fej003ql3gghywo88u2' }
  });
  console.log('Vivek Panchani user:', u);
}

main().finally(() => prisma.$disconnect());
