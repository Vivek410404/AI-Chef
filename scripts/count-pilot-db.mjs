import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function countAll() {
  const [
    users,
    households,
    members,
    recipes,
    ingredients,
    products,
    variants,
    retailers,
    storeProducts,
    mealPlanItems,
    pantryItems,
    baskets,
    basketItems,
    orders,
    orderItems,
    history,
    sessions,
    revoked,
    audits
  ] = await Promise.all([
    prisma.user.count(),
    prisma.household.count(),
    prisma.householdMember.count(),
    prisma.recipe.count(),
    prisma.ingredient.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.retailer.count(),
    prisma.storeProduct.count(),
    prisma.mealPlanItem.count(),
    prisma.pantryItem.count(),
    prisma.basket.count(),
    prisma.basketItem.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.orderStatusHistory.count(),
    prisma.refreshSession.count(),
    prisma.revokedToken.count(),
    prisma.auditLog.count()
  ]);
  console.log(JSON.stringify({
    users, households, members, recipes, ingredients, products, variants, retailers,
    storeProducts, mealPlanItems, pantryItems, baskets, basketItems, orders, orderItems, history,
    sessions, revoked, audits
  }, null, 2));
}

countAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
