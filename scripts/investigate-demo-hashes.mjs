import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      passwordHash: {
        contains: 'demo_hash_rasoi_iq'
      }
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      suspensionReason: true,
      createdAt: true
    }
  });

  console.log(`Found ${users.length} accounts with demo_hash_rasoi_iq:`);
  console.log(JSON.stringify(users, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
