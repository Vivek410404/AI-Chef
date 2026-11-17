import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [users, households, products, variants, retailers, orders, stores, storeProducts] = await Promise.all([
    prisma.user.count(),
    prisma.household.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.retailer.count(),
    prisma.order.count(),
    prisma.store.count(),
    prisma.storeProduct.count()
  ]);

  console.log('Database inspection:', {
    users,
    households,
    products,
    variants,
    retailers,
    stores,
    storeProducts,
    orders
  });

  const sampleProducts = await prisma.product.findMany({
    take: 5,
    include: { variants: true }
  });
  console.log('Sample Products in DB:', JSON.stringify(sampleProducts, null, 2));

  const sampleRetailers = await prisma.retailer.findMany({
    include: { stores: true }
  });
  console.log('Sample Retailers in DB:', JSON.stringify(sampleRetailers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

async function inspectRetailers() {
  const majorRetailers = await prisma.retailer.findMany({
    where: {
      OR: [
        { name: { contains: 'Blinkit', mode: 'insensitive' } },
        { name: { contains: 'Zepto', mode: 'insensitive' } },
        { name: { contains: 'DMart', mode: 'insensitive' } },
        { name: { contains: 'BigBasket', mode: 'insensitive' } }
      ]
    }
  });
  console.log('Major Retailers:', majorRetailers);
}
inspectRetailers();
