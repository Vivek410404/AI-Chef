import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.count();
  const households = await prisma.household.count();
  const orders = await prisma.order.count();
  const pantry = await prisma.pantryItem.count();
  const history = await prisma.orderStatusHistory.count();

  console.log(JSON.stringify({ users, households, orders, pantry, history }, null, 2));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
