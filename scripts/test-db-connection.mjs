import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let host = '127.0.0.1';
try {
  const wslIp = execSync('wsl -d Ubuntu hostname -I').toString().trim().split(' ')[0];
  if (wslIp) host = wslIp;
} catch {}

const DATABASE_URL = process.env.DATABASE_URL || `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;
console.log('Connecting with DATABASE_URL:', DATABASE_URL);

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } }
});

async function main() {
  try {
    await prisma.$connect();
    console.log(`✓ Prisma successfully connected to PostgreSQL on ${host}:5432!`);
    const tables = await prisma.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
    console.log('✓ Query executed successfully. Existing public tables count:', tables.length);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection or query error:', err.message);
    process.exit(1);
  }
}

main();
