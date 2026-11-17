import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const vCount = await prisma.productVariant.count();
  const oCount = await prisma.order.count();
  const oiCount = await prisma.orderItem.count();
  console.log(JSON.stringify({ vCount, oCount, oiCount }, null, 2));

  const sampleV = await prisma.productVariant.findFirst({
    select: { id: true, sku: true, brand: true, title: true, ingredientId: true }
  });
  console.log('Sample variant:', sampleV);

  const sampleOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  console.log('Sample order:', sampleOrder);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
