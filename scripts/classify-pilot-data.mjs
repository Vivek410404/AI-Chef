import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== PILOT DATASET CLASSIFICATION AUDIT ===\n');

  // Users
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, role: true, status: true, createdAt: true }
  });

  let seedUsers = 0;
  let testUsers = 0;
  let pilotUsers = 0;

  for (const u of allUsers) {
    const email = u.email.toLowerCase();
    if (email.includes('test') || email.includes('fresh_pilot') || email.includes('mock') || email.includes('sample')) {
      testUsers++;
    } else if (u.id.startsWith('user-demo') || u.id.startsWith('usr-') || u.id.startsWith('admin-') || email.includes('sharma') || email.includes('patel') || email.includes('mehta') || email.includes('blinkit')) {
      seedUsers++;
    } else {
      pilotUsers++;
    }
  }

  console.log(`Total Users: ${allUsers.length}`);
  console.log(`  - Seed / Benchmark Users: ${seedUsers}`);
  console.log(`  - Automated Test Generated Users: ${testUsers}`);
  console.log(`  - Supervised Pilot Participant Cohorts: ${pilotUsers}`);

  // Households
  const allHouseholds = await prisma.household.findMany({
    select: { id: true, name: true, city: true, dietaryPreference: true, createdAt: true }
  });

  let benchmarkHouseholds = 0;
  let testHouseholds = 0;
  let supervisedPilotHouseholds = 0;

  for (const h of allHouseholds) {
    const name = h.name.toLowerCase();
    if (name.includes('test') || name.includes('fresh')) {
      testHouseholds++;
    } else if (h.id.startsWith('hh-sharma') || h.id.startsWith('hh-patel') || h.id.startsWith('hh-mehta')) {
      benchmarkHouseholds++;
    } else {
      supervisedPilotHouseholds++;
    }
  }

  console.log(`\nTotal Households: ${allHouseholds.length}`);
  console.log(`  - Benchmark Exemplar Households (Sharma, Patel, Mehta): ${benchmarkHouseholds}`);
  console.log(`  - Automated Test Households: ${testHouseholds}`);
  console.log(`  - Supervised Pilot Candidate Households: ${supervisedPilotHouseholds}`);

  // Orders
  const allOrders = await prisma.order.findMany({
    select: { id: true, isDemoOrder: true, status: true, createdAt: true, totalAmountInr: true }
  });

  let demoSeedOrders = 0;
  let testHarnessOrders = 0;
  let activePilotOrders = 0;

  for (const o of allOrders) {
    if (o.status === 'DEMO ORDER CONFIRMED' || o.id.startsWith('ord-seed-')) {
      demoSeedOrders++;
    } else if (o.id.startsWith('ord-gate-') || o.id.startsWith('ord-test-')) {
      testHarnessOrders++;
    } else {
      activePilotOrders++;
    }
  }

  console.log(`\nTotal Orders: ${allOrders.length}`);
  console.log(`  - Legacy Demo / Seed Orders: ${demoSeedOrders}`);
  console.log(`  - Test Harness Verification Orders: ${testHarnessOrders}`);
  console.log(`  - Supervised Simulation Orders: ${activePilotOrders}`);

  await prisma.$disconnect();
}

main().catch(console.error);
