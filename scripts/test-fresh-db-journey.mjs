import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import assert from 'node:assert';

const FRESH_DB_URL = 'postgresql://postgres:postgres@172.18.158.240:5432/rasoi_iq_phase624_fresh?schema=public';

async function main() {
  console.log('========================================================================');
  console.log('🧪 RasoiIQ Workstream B3: Fresh Database Full Customer Journey Test');
  console.log('========================================================================');

  const prisma = new PrismaClient({
    datasources: { db: { url: FRESH_DB_URL } }
  });

  try {
    // 1. Verify Seed Data
    const usersCount = await prisma.user.count();
    const recipeCount = await prisma.recipe.count();
    const productCount = await prisma.product.count();
    const retailerCount = await prisma.retailer.count();
    console.log(`Seeded State: ${usersCount} users, ${recipeCount} recipes, ${productCount} products, ${retailerCount} retailers.`);
    assert(usersCount > 0, 'Users must be seeded');
    assert(recipeCount > 0, 'Recipes must be seeded');

    // 2. Perform Customer Registration
    const testEmail = `fresh_pilot_${Date.now()}@example.in`;
    const passwordHash = await bcrypt.hash('PilotSecurePass2026!', 10);
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        normalizedEmail: testEmail.toLowerCase(),
        passwordHash,
        fullName: 'Aarav Patel',
        role: 'CUSTOMER',
        status: 'ACTIVE'
      }
    });
    console.log(`✅ Step 7a: Registered new customer: ${newUser.id} (${newUser.email})`);

    // 3. Customer Login Verification
    const loggedInUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    assert(loggedInUser, 'Customer must be found by email');
    const passValid = await bcrypt.compare('PilotSecurePass2026!', loggedInUser.passwordHash);
    assert.strictEqual(passValid, true, 'Password verification must succeed');
    console.log(`✅ Step 7b: Customer login verified with bcrypt hash matching`);

    // 4. Create a Household
    const newHousehold = await prisma.household.create({
      data: {
        userId: newUser.id,
        name: 'Patel Fresh Household',
        dietaryPreference: 'JAIN',
        cuisinePreference: 'GUJARATI',
        size: 3,
        weeklyBudgetInr: 4500
      }
    });
    await prisma.householdMember.create({
      data: {
        householdId: newHousehold.id,
        userId: newUser.id,
        name: 'Aarav Patel',
        role: 'OWNER',
        dietaryPreference: 'JAIN'
      }
    });
    console.log(`✅ Step 8: Created household: ${newHousehold.id} ("${newHousehold.name}") with owner member`);

    // 5. Create and Retrieve a Test Order
    const retailer = await prisma.retailer.findFirst();
    assert(retailer, 'Must have seeded retailer');

    const testOrderId = `ord-fresh-${Date.now()}`;
    const testOrder = await prisma.order.create({
      data: {
        id: testOrderId,
        userId: newUser.id,
        retailerName: retailer.name,
        status: 'ORDER_CONFIRMED',
        totalAmountInr: 650,
        deliveryFeeInr: 30,
        deliveryAddress: 'Flat 402, Shivalik Residency, Satellite, Ahmedabad 380015',
        isDemoOrder: true,
        statusReason: 'Demo checkout completed',
        updatedBy: newUser.email,
        items: {
          create: [
            {
              productName: 'Amul Taaza Milk 1L',
              brand: 'Amul',
              packSize: '1L',
              quantityPacks: 2,
              unitPriceInr: 54
            }
          ]
        },
        statusHistory: {
          create: {
            fromStatus: 'START',
            toStatus: 'ORDER_CONFIRMED',
            reason: 'Demo order placed by customer',
            changedBy: newUser.email
          }
        }
      },
      include: { items: true, statusHistory: true }
    });
    console.log(`✅ Step 9: Created test order: ${testOrder.id} in status "${testOrder.status}" with ${testOrder.items.length} items`);

    // 6. Advance status and verify OrderStatusHistory persistence
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: testOrderId },
        data: {
          status: 'HUB_PACKING',
          statusReason: 'Store partner started packing items',
          updatedBy: 'partner@blinkit.test'
        }
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId: testOrderId,
          fromStatus: 'ORDER_CONFIRMED',
          toStatus: 'HUB_PACKING',
          reason: 'Store partner started packing items',
          changedBy: 'partner@blinkit.test'
        }
      });
    });

    const retrievedOrder = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } }
    });
    assert(retrievedOrder, 'Must retrieve created order');
    assert.strictEqual(retrievedOrder.status, 'HUB_PACKING', 'Status must be updated to HUB_PACKING');
    assert.strictEqual(retrievedOrder.statusHistory.length, 2, 'OrderStatusHistory must contain 2 entries');
    console.log(`✅ Step 10: Order status history persisted successfully (${retrievedOrder.statusHistory.length} entries):`);
    retrievedOrder.statusHistory.forEach((h, idx) => {
      console.log(`   ${idx + 1}. [${h.createdAt.toISOString()}] ${h.fromStatus} -> ${h.toStatus} (by: ${h.changedBy}) - "${h.reason}"`);
    });

    console.log('========================================================================');
    console.log('🎉 Workstream B3: Fresh Database Verification Gate: 100% PASS');
    console.log('========================================================================');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
