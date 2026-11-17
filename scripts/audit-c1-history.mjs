import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const totalOrders = await prisma.order.count();
    const totalHistory = await prisma.orderStatusHistory.count();
    const grouped = await prisma.orderStatusHistory.groupBy({ by: ['orderId'] });
    const distinctOrdersInHistory = grouped.length;
    const ordersWithoutHistory = totalOrders - distinctOrdersInHistory;
    const cancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED' } });
    const cancelledHistory = await prisma.orderStatusHistory.count({ where: { toStatus: 'CANCELLED' } });

    console.log('--- Order & History Counts ---');
    console.log('Total Orders:', totalOrders);
    console.log('Total Status History Rows:', totalHistory);
    console.log('Distinct Orders in History:', distinctOrdersInHistory);
    console.log('Orders WITHOUT History:', ordersWithoutHistory);
    console.log('Cancelled Orders in Order table:', cancelledOrders);
    console.log('Cancelled History Rows:', cancelledHistory);

    const firstHistory = await prisma.orderStatusHistory.findFirst({ orderBy: { createdAt: 'asc' } });
    const lastHistory = await prisma.orderStatusHistory.findFirst({ orderBy: { createdAt: 'desc' } });
    console.log('Earliest History Record:', firstHistory?.createdAt);
    console.log('Latest History Record:', lastHistory?.createdAt);

    if (firstHistory) {
      const ordersPredating = await prisma.order.count({ where: { createdAt: { lt: firstHistory.createdAt } } });
      const ordersPostdating = await prisma.order.count({ where: { createdAt: { gte: firstHistory.createdAt } } });
      console.log('Orders created BEFORE first history row (predated feature):', ordersPredating);
      console.log('Orders created ON/AFTER first history row:', ordersPostdating);
    }

    // Check newly placed orders: check if all orders created today have an ORDER_CONFIRMED history row
    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: new Date('2026-11-17T00:00:00.000Z') } },
      include: { statusHistory: true }
    });
    console.log('\n--- Orders Created Today (Nov 17, 2026) ---');
    console.log('Count of orders created today:', todayOrders.length);
    let withInitialConfirmed = 0;
    for (const o of todayOrders) {
      const hasInitial = o.statusHistory.some(h => h.toStatus === 'ORDER_CONFIRMED' || h.fromStatus === 'START');
      if (hasInitial) withInitialConfirmed++;
    }
    console.log('Orders created today with initial confirmed history row:', withInitialConfirmed);

    // Inspect cancelled orders without cancellation reason
    const cancelledWithoutReason = await prisma.order.count({
      where: {
        status: 'CANCELLED',
        OR: [
          { statusReason: null },
          { statusReason: '' }
        ]
      }
    });
    console.log('Cancelled orders missing reason in Order.statusReason:', cancelledWithoutReason);

    // Also check OrderStatusHistory for CANCELLED records
    const cancelledHistoryWithoutReason = await prisma.orderStatusHistory.count({
      where: {
        toStatus: 'CANCELLED',
        OR: [
          { reason: null },
          { reason: '' }
        ]
      }
    });
    console.log('Cancelled history rows missing reason in OrderStatusHistory.reason:', cancelledHistoryWithoutReason);

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
