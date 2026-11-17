import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true }
  });
  console.log('Users:', users);
  const households = await prisma.household.findMany({
    select: { id: true, name: true, members: true }
  });
  console.log('Households:', JSON.stringify(households, null, 2));
}

main().finally(() => prisma.$disconnect());
