import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "OrderStatusHistory" DROP CONSTRAINT IF EXISTS "OrderStatusHistory_orderId_fkey"`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    console.log('Successfully updated OrderStatusHistory constraint to ON DELETE RESTRICT');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
