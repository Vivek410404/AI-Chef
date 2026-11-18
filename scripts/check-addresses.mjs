import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAddresses() {
  const addresses = await prisma.order.findMany({
    where: { userId: 'user-demo-1' },
    select: { deliveryAddress: true },
    distinct: ['deliveryAddress']
  });
  console.log('user-demo-1 distinct delivery addresses:', addresses);
  await prisma.$disconnect();
}
checkAddresses();
