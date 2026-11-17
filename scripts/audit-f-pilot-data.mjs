import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const usersByRole = await prisma.user.groupBy({ by: ['role'], _count: { _all: true } });
    const totalUsers = await prisma.user.count();
    const households = await prisma.household.count();
    const members = await prisma.householdMember.count();
    const products = await prisma.product.count();
    const variants = await prisma.productVariant.count();
    const storeProducts = await prisma.storeProduct.count();
    const retailers = await prisma.retailer.count();
    const stores = await prisma.store.count();
    const orders = await prisma.order.count();
    const history = await prisma.orderStatusHistory.count();

    console.log('--- Entity Summary ---');
    console.log('Total Users:', totalUsers);
    console.log('Users by Role:', usersByRole);
    console.log('Total Households:', households);
    console.log('Total Household Members:', members);
    console.log('Products:', products);
    console.log('Variants:', variants);
    console.log('Store Listings (storeProduct):', storeProducts);
    console.log('Retailers:', retailers);
    console.log('Stores:', stores);
    console.log('Orders:', orders);
    console.log('Order Status History:', history);

    // Distribution of users by creation day
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    const usersByDay = {};
    for (const u of allUsers) {
      const day = u.createdAt.toISOString().slice(0, 10);
      usersByDay[day] = (usersByDay[day] || 0) + 1;
    }
    console.log('\nUsers Created By Date:', usersByDay);

    // Distribution of households by creation day
    const allHouseholds = await prisma.household.findMany({
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    const hhByDay = {};
    for (const h of allHouseholds) {
      const day = h.createdAt.toISOString().slice(0, 10);
      hhByDay[day] = (hhByDay[day] || 0) + 1;
    }
    console.log('\nHouseholds Created By Date:', hhByDay);

    // Check test users vs seed users
    const testUsers = allUsers.filter(u => u.email.includes('test') || u.email.includes('pilot') || u.email.includes('sharma') || u.email.includes('patel') || u.email.includes('mehta') || u.email.includes('admin') || u.email.includes('retailer'));
    console.log(`\nIdentified named demo/test users: ${testUsers.length} of ${totalUsers}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
