import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cutoff = new Date('2026-11-17T12:13:00Z');

  // Total orders
  const totalOrders = await prisma.order.count();
  const totalHistories = await prisma.orderStatusHistory.count();

  const preOrders = await prisma.order.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true, status: true, createdAt: true, userId: true, isDemoOrder: true }
  });

  const postOrders = await prisma.order.findMany({
    where: { createdAt: { gte: cutoff } },
    select: { id: true, status: true, createdAt: true, userId: true, isDemoOrder: true, statusHistory: true }
  });

  console.log(`=== OVERALL COUNTS ===`);
  console.log(`Total Orders: ${totalOrders}`);
  console.log(`Total OrderStatusHistory rows: ${totalHistories}`);
  console.log(`Pre-Cutoff (< 2026-11-17 12:13 UTC): ${preOrders.length}`);
  console.log(`Post-Cutoff (>= 2026-11-17 12:13 UTC): ${postOrders.length}`);

  const preStatusCounts = {};
  for (const o of preOrders) {
    preStatusCounts[o.status] = (preStatusCounts[o.status] || 0) + 1;
  }
  console.log('\n=== PRE-CUTOFF STATUS BREAKDOWN ===');
  console.log(JSON.stringify(preStatusCounts, null, 2));

  const nonDemoPre = preOrders.filter(o => o.status !== 'DEMO ORDER CONFIRMED');
  console.log(`\n=== 8 NON-DEMO PRE-CUTOFF ORDERS (${nonDemoPre.length}) ===`);
  console.log(JSON.stringify(nonDemoPre, null, 2));

  // Check history count for each post-cutoff order
  let postZeroHistory = 0;
  let postOneHistory = 0;
  let postMultipleHistory = 0;

  for (const o of postOrders) {
    const hCount = o.statusHistory.length;
    if (hCount === 0) postZeroHistory++;
    else if (hCount === 1) postOneHistory++;
    else postMultipleHistory++;
  }

  console.log('\n=== POST-CUTOFF HISTORY COVERAGE ===');
  console.log(`Orders with 0 history rows: ${postZeroHistory}`);
  console.log(`Orders with 1 history row (initial snapshot): ${postOneHistory}`);
  console.log(`Orders with >1 history rows (lifecycle transitions): ${postMultipleHistory}`);

  // Also check pre-cutoff history coverage
  const preOrdersWithHistory = await prisma.order.findMany({
    where: {
      createdAt: { lt: cutoff },
      statusHistory: { some: {} }
    },
    select: { id: true, status: true, createdAt: true, statusHistory: true }
  });
  console.log(`\nPre-cutoff orders with any history: ${preOrdersWithHistory.length}`);

  const postStatusCounts = {};
  for (const o of postOrders) {
    postStatusCounts[o.status] = (postStatusCounts[o.status] || 0) + 1;
  }
  console.log('\n=== POST-CUTOFF STATUS BREAKDOWN ===');
  console.log(JSON.stringify(postStatusCounts, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
