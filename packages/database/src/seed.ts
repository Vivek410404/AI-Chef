import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import {
  SEED_INGREDIENTS,
  SEED_RECIPES,
  SEED_RETAILERS,
  SEED_PRODUCT_VARIANTS,
  SEED_DEMO_HOUSEHOLD,
  SEED_PATEL_HOUSEHOLD,
  SEED_MEHTA_HOUSEHOLD,
  SEED_PANTRY_ITEMS
} from './seed-data';

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
  console.log('🌱 Starting RasoiIQ database seed...');

  // 1. Seed Ingredients
  console.log(`Seeding ${SEED_INGREDIENTS.length} Indian ingredients...`);
  for (const ing of SEED_INGREDIENTS) {
    await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {
        hindiName: ing.hindiName,
        category: ing.category,
        standardUnit: ing.standardUnit,
        isJainPermissible: ing.isJainPermissible,
        shelfLifeDays: ing.shelfLifeDays
      },
      create: {
        id: ing.id,
        name: ing.name,
        hindiName: ing.hindiName,
        category: ing.category,
        standardUnit: ing.standardUnit,
        isJainPermissible: ing.isJainPermissible,
        shelfLifeDays: ing.shelfLifeDays
      }
    });
  }

  // 2. Seed Recipes with Steps and RecipeIngredients
  console.log(`Seeding ${SEED_RECIPES.length} Indian recipes...`);
  for (const rec of SEED_RECIPES) {
    await prisma.recipe.upsert({
      where: { slug: rec.slug },
      update: {
        title: rec.title,
        description: rec.description,
        cuisine: rec.cuisine,
        dietaryTags: rec.dietaryTags,
        mealTypes: rec.mealTypes,
        prepTimeMinutes: rec.prepTimeMinutes,
        cookTimeMinutes: rec.cookTimeMinutes,
        defaultServings: rec.defaultServings,
        difficulty: rec.difficulty,
        caloriesPerServing: rec.caloriesPerServing,
        proteinGrams: rec.proteinGrams,
        carbsGrams: rec.carbsGrams,
        fatGrams: rec.fatGrams,
        fiberGrams: rec.fiberGrams,
        imageUrl: rec.imageUrl,
        estimatedCostInr: rec.estimatedCostInr,
        isJainFriendly: rec.isJainFriendly,
        jainAlternativeNotes: rec.jainAlternativeNotes
      },
      create: {
        id: rec.id,
        title: rec.title,
        slug: rec.slug,
        description: rec.description,
        cuisine: rec.cuisine,
        dietaryTags: rec.dietaryTags,
        mealTypes: rec.mealTypes,
        prepTimeMinutes: rec.prepTimeMinutes,
        cookTimeMinutes: rec.cookTimeMinutes,
        defaultServings: rec.defaultServings,
        difficulty: rec.difficulty,
        caloriesPerServing: rec.caloriesPerServing,
        proteinGrams: rec.proteinGrams,
        carbsGrams: rec.carbsGrams,
        fatGrams: rec.fatGrams,
        fiberGrams: rec.fiberGrams,
        imageUrl: rec.imageUrl,
        estimatedCostInr: rec.estimatedCostInr,
        isJainFriendly: rec.isJainFriendly,
        jainAlternativeNotes: rec.jainAlternativeNotes,
        ingredients: {
          create: rec.ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ing.notes
          }))
        },
        steps: {
          create: rec.steps.map(s => ({
            stepNumber: s.stepNumber,
            instruction: s.instruction,
            tip: s.tip,
            durationMinutes: s.durationMinutes
          }))
        }
      }
    });
  }

  // 3. Seed Retailers
  console.log(`Seeding ${SEED_RETAILERS.length} Indian retailers...`);
  for (const ret of SEED_RETAILERS) {
    await prisma.retailer.upsert({
      where: { slug: ret.slug },
      update: {
        name: ret.name,
        logoUrl: ret.logoUrl,
        deliveryTimeEstimate: ret.deliveryTimeEstimate,
        deliveryFeeInr: ret.deliveryFeeInr,
        freeDeliveryThresholdInr: ret.freeDeliveryThresholdInr,
        minOrderValueInr: ret.minOrderValueInr,
        rating: ret.rating
      },
      create: {
        id: ret.id,
        name: ret.name,
        slug: ret.slug,
        logoUrl: ret.logoUrl,
        deliveryTimeEstimate: ret.deliveryTimeEstimate,
        deliveryFeeInr: ret.deliveryFeeInr,
        freeDeliveryThresholdInr: ret.freeDeliveryThresholdInr,
        minOrderValueInr: ret.minOrderValueInr,
        rating: ret.rating
      }
    });
  }

  // 4. Seed Products and Variants
  console.log(`Seeding ${SEED_PRODUCT_VARIANTS.length} retail product variants...`);
  for (const v of SEED_PRODUCT_VARIANTS) {
    // Upsert parent product
    const product = await prisma.product.upsert({
      where: { id: `prod-${v.brand}-${v.ingredientId}` },
      update: {
        brand: v.brand,
        title: v.title,
        category: 'Grocery',
        imageUrl: v.imageUrl
      },
      create: {
        id: `prod-${v.brand}-${v.ingredientId}`,
        brand: v.brand,
        title: v.title,
        category: 'Grocery',
        imageUrl: v.imageUrl
      }
    });

    await prisma.productVariant.upsert({
      where: { sku: v.sku },
      update: {
        title: v.title,
        brand: v.brand,
        packQuantity: v.packQuantity,
        packUnit: v.packUnit,
        mrpInr: v.mrpInr,
        sellingPriceInr: v.sellingPriceInr,
        imageUrl: v.imageUrl
      },
      create: {
        id: v.id,
        productId: product.id,
        ingredientId: v.ingredientId,
        sku: v.sku,
        brand: v.brand,
        title: v.title,
        packQuantity: v.packQuantity,
        packUnit: v.packUnit,
        mrpInr: v.mrpInr,
        sellingPriceInr: v.sellingPriceInr,
        imageUrl: v.imageUrl
      }
    });
  }

  // 5. Seed Demo User & Household
  console.log('Seeding demo user and household...');
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@rasoiiq.in' },
    update: {
      fullName: 'Pooja Sharma'
    },
    create: {
      id: 'user-demo-1',
      email: 'demo@rasoiiq.in',
      fullName: 'Pooja Sharma',
      passwordHash: '$2b$10$demo_hash_rasoi_iq_2026',
      phoneNumber: '+91 98765 43210'
    }
  });

  const household = await prisma.household.upsert({
    where: { id: SEED_DEMO_HOUSEHOLD.id },
    update: {
      name: SEED_DEMO_HOUSEHOLD.name,
      weeklyBudgetInr: SEED_DEMO_HOUSEHOLD.weeklyBudgetInr
    },
    create: {
      id: SEED_DEMO_HOUSEHOLD.id,
      userId: demoUser.id,
      name: SEED_DEMO_HOUSEHOLD.name,
      weeklyBudgetInr: SEED_DEMO_HOUSEHOLD.weeklyBudgetInr,
      members: {
        create: SEED_DEMO_HOUSEHOLD.members.map(m => ({
          id: m.id,
          name: m.name,
          ageGroup: m.ageGroup,
          dietaryPreference: m.dietaryPreference.toUpperCase() as any,
          allergies: m.allergies,
          dislikedIngredients: m.dislikedIngredients
        }))
      }
    }
  });

  // Seed Pantry Items
  for (const p of SEED_PANTRY_ITEMS) {
    const existing = await prisma.pantryItem.findFirst({
      where: { householdId: household.id, ingredientId: p.ingredientId }
    });
    if (!existing) {
      await prisma.pantryItem.create({
        data: {
          householdId: household.id,
          ingredientId: p.ingredientId,
          currentQuantity: p.currentQuantity,
          unit: p.unit,
          isLowStock: p.isLowStock
        }
      });
    }
  }

  // 6. Seed Patel Family (Jain / Bodakdev, Ahmedabad)
  console.log('Seeding Patel family (Jain)...');
  const patelUser = await prisma.user.upsert({
    where: { email: 'patel.family@rasoiiq.demo' },
    update: { fullName: 'Rameshbhai Patel' },
    create: {
      id: 'user-demo-patel',
      email: 'patel.family@rasoiiq.demo',
      fullName: 'Rameshbhai Patel',
      passwordHash: '$2b$10$demo_hash_rasoi_iq_2026',
      phoneNumber: '+91 98250 11223'
    }
  });

  const patelHousehold = await prisma.household.upsert({
    where: { id: SEED_PATEL_HOUSEHOLD.id },
    update: {
      name: SEED_PATEL_HOUSEHOLD.name,
      weeklyBudgetInr: SEED_PATEL_HOUSEHOLD.weeklyBudgetInr
    },
    create: {
      id: SEED_PATEL_HOUSEHOLD.id,
      userId: patelUser.id,
      name: SEED_PATEL_HOUSEHOLD.name,
      weeklyBudgetInr: SEED_PATEL_HOUSEHOLD.weeklyBudgetInr,
      members: {
        create: SEED_PATEL_HOUSEHOLD.members.map(m => ({
          id: m.id,
          name: m.name,
          ageGroup: m.ageGroup,
          dietaryPreference: m.dietaryPreference.toUpperCase() as any,
          allergies: m.allergies,
          dislikedIngredients: m.dislikedIngredients
        }))
      }
    }
  });

  const patelPantryDefaults = [
    { ingredientId: 'ing-besan', quantity: 1500, unit: 'g' },
    { ingredientId: 'ing-toor-dal', quantity: 1000, unit: 'g' },
    { ingredientId: 'ing-ghee', quantity: 500, unit: 'g' },
    { ingredientId: 'ing-jaggery', quantity: 400, unit: 'g' }
  ];
  for (const p of patelPantryDefaults) {
    const existing = await prisma.pantryItem.findFirst({
      where: { householdId: patelHousehold.id, ingredientId: p.ingredientId }
    });
    if (!existing) {
      await prisma.pantryItem.create({
        data: {
          householdId: patelHousehold.id,
          ingredientId: p.ingredientId,
          currentQuantity: p.quantity,
          unit: p.unit,
          isLowStock: false
        }
      });
    }
  }

  // 7. Seed Mehta Family (Kathiyawadi / Navrangpura, Ahmedabad)
  console.log('Seeding Mehta family (Kathiyawadi)...');
  const mehtaUser = await prisma.user.upsert({
    where: { email: 'mehta.family@rasoiiq.demo' },
    update: { fullName: 'Kirit Mehta' },
    create: {
      id: 'user-demo-mehta',
      email: 'mehta.family@rasoiiq.demo',
      fullName: 'Kirit Mehta',
      passwordHash: '$2b$10$demo_hash_rasoi_iq_2026',
      phoneNumber: '+91 98980 44556'
    }
  });

  const mehtaHousehold = await prisma.household.upsert({
    where: { id: SEED_MEHTA_HOUSEHOLD.id },
    update: {
      name: SEED_MEHTA_HOUSEHOLD.name,
      weeklyBudgetInr: SEED_MEHTA_HOUSEHOLD.weeklyBudgetInr
    },
    create: {
      id: SEED_MEHTA_HOUSEHOLD.id,
      userId: mehtaUser.id,
      name: SEED_MEHTA_HOUSEHOLD.name,
      weeklyBudgetInr: SEED_MEHTA_HOUSEHOLD.weeklyBudgetInr,
      members: {
        create: SEED_MEHTA_HOUSEHOLD.members.map(m => ({
          id: m.id,
          name: m.name,
          ageGroup: m.ageGroup,
          dietaryPreference: m.dietaryPreference.toUpperCase() as any,
          allergies: m.allergies,
          dislikedIngredients: m.dislikedIngredients
        }))
      }
    }
  });

  const mehtaPantryDefaults = [
    { ingredientId: 'ing-bajra-flour', quantity: 2000, unit: 'g' },
    { ingredientId: 'ing-ghee', quantity: 1000, unit: 'g' },
    { ingredientId: 'ing-green-chilli', quantity: 250, unit: 'g' },
    { ingredientId: 'ing-mustard-seeds', quantity: 200, unit: 'g' }
  ];
  for (const p of mehtaPantryDefaults) {
    const existing = await prisma.pantryItem.findFirst({
      where: { householdId: mehtaHousehold.id, ingredientId: p.ingredientId }
    });
    if (!existing) {
      await prisma.pantryItem.create({
        data: {
          householdId: mehtaHousehold.id,
          ingredientId: p.ingredientId,
          currentQuantity: p.quantity,
          unit: p.unit,
          isLowStock: false
        }
      });
    }
  }

  console.log('✅ RasoiIQ database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
