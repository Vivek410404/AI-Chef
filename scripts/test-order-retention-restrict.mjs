import { PrismaClient } from '@prisma/client';
import assert from 'node:assert';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing Audit Retention: ON DELETE RESTRICT on OrderStatusHistory...');

    // Find an order that has status history
    const orderWithHistory = await prisma.order.findFirst({
      where: {
        statusHistory: { some: {} }
      },
      include: { statusHistory: true }
    });

    assert(orderWithHistory, 'Must find an order with status history');
    console.log(`Found Order #${orderWithHistory.id} with ${orderWithHistory.statusHistory.length} status history records.`);

    // Attempt to delete the order - should fail due to ON DELETE RESTRICT
    let deleteFailed = false;
    let errorCode = null;
    try {
      await prisma.order.delete({
        where: { id: orderWithHistory.id }
      });
    } catch (err) {
      deleteFailed = true;
      errorCode = err.code || err.message;
      console.log('✅ Delete operation was strictly rejected as expected:');
      console.log('   Error Code:', err.code);
      console.log('   Error Message:', err.message);
    }

    assert.strictEqual(deleteFailed, true, 'Deleting order with audit history MUST be blocked by database');
    console.log('✅ Audit Retention Test Passed: OrderStatusHistory cannot be erased by deleting an order.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
