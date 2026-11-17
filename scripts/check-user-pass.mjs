import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { id: { in: ['user-demo-1', 'user-demo-patel', 'user-demo-mehta'] } },
    select: { id: true, email: true, passwordHash: true }
  });
  console.log('Users found:', users.map(u => ({ id: u.id, email: u.email })));

  const testPasses = ['RasoiHousehold@2026', 'Rasoi@2026', 'password', 'demo123', 'Demo@123', 'DemoPass@2026', 'RasoiHousehold@123'];
  for (const u of users) {
    console.log(`Checking user: ${u.email}`);
    for (const p of testPasses) {
      const match = await bcrypt.compare(p, u.passwordHash);
      if (match) {
        console.log(`  -> Password for ${u.email} is: "${p}"`);
        break;
      }
    }
  }

  await prisma.$disconnect();
}
main();
