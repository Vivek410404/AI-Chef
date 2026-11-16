import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let host = '127.0.0.1';
try {
  const wslIp = execSync('wsl -d Ubuntu hostname -I').toString().trim().split(' ')[0];
  if (wslIp) host = wslIp;
} catch {}

const DATABASE_URL = process.env.DATABASE_URL || `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

async function main() {
  try {
    await prisma.$connect();
    const count = await prisma.household.count();
    const households = await prisma.household.findMany({ select: { id: true, name: true } });
    console.log(`Household count: ${count}`);
    console.log('Households in DB:', JSON.stringify(households, null, 2));
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection or query error:', err.message);
    process.exit(1);
  }
}

main();
