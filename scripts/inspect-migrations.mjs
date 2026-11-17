import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const rows = await prisma.$queryRawUnsafe('SELECT id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count FROM _prisma_migrations ORDER BY started_at ASC;');
    console.log('Migrations in _prisma_migrations:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Failed to query _prisma_migrations:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
