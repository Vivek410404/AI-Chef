import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

let host = '127.0.0.1';
try {
  const wslIp = execSync('wsl -d Ubuntu hostname -I').toString().trim().split(' ')[0];
  if (wslIp) host = wslIp;
} catch {}

const dbUrl = process.env.DATABASE_URL || `postgresql://postgres:postgres@${host}:5432/rasoi_iq?schema=public`;

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

async function main() {
  console.log('--- Verifying Real PostgreSQL Database Rows ---');
  const userCount = await prisma.user.count();
  const householdCount = await prisma.household.count();
  const memberCount = await prisma.householdMember.count();
  const recipeCount = await prisma.recipe.count();
  const ingredientCount = await prisma.ingredient.count();
  const retailerCount = await prisma.retailer.count();
  const variantCount = await prisma.productVariant.count();
  const pantryCount = await prisma.pantryItem.count();

  console.log(`Users: ${userCount}`);
  console.log(`Households: ${householdCount}`);
  console.log(`Household Members: ${memberCount}`);
  console.log(`Recipes: ${recipeCount}`);
  console.log(`Ingredients: ${ingredientCount}`);
  console.log(`Retailers: ${retailerCount}`);
  console.log(`Product Variants: ${variantCount}`);
  console.log(`Pantry Items: ${pantryCount}`);

  const households = await prisma.household.findMany({
    include: { members: true, pantryItems: true }
  });

  console.log('\n--- Seeded Households in PostgreSQL ---');
  for (const h of households) {
    console.log(`Household: "${h.name}" (ID: ${h.id}, Budget: ₹${h.weeklyBudgetInr}, Members: ${h.members.length}, Pantry: ${h.pantryItems.length})`);
    h.members.forEach(m => console.log(`   - Member: ${m.name} (${m.dietaryPreference})`));
  }

  await prisma.$disconnect();
}

main();
