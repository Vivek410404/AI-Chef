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
  const tables = await prisma.$queryRawUnsafe("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;");
  console.log('PostgreSQL Public Tables:');
  tables.forEach((t, i) => console.log(`  ${i+1}. ${t.tablename}`));
  await prisma.$disconnect();
}

main();
