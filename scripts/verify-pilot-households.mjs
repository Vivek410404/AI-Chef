import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('========================================================================');
  console.log('🏡  RasoiIQ — Pilot Households & Cohort Data Classification Audit');
  console.log('========================================================================\n');

  // 1. Inspect the 3 Intended Supervised Pilot Households (+ Vivek's Kitchen)
  const targetHouseholdIds = [
    'hh-sharma-family',
    'hh-patel-family',
    'hh-mehta-family',
    'cmwjbo8tb0001l3rks9ymiw4i'
  ];

  for (const hhId of targetHouseholdIds) {
    const hh = await prisma.household.findUnique({
      where: { id: hhId },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true, status: true } },
        members: {
          select: { id: true, name: true, role: true, status: true, dietaryPreference: true, ageGroup: true, userId: true }
        }
      }
    });

    if (hh) {
      console.log(`🏠 Household: "${hh.name}" (ID: ${hh.id})`);
      console.log(`   Owner: ${hh.user?.fullName} (${hh.user?.email}), Status: ${hh.user?.status}`);
      console.log(`   Dietary Preference: ${hh.dietaryPreference}, Cuisine: ${hh.cuisineStyle || 'None'}`);
      console.log(`   City: ${hh.city}, Active Members: ${hh.members.filter(m => m.status === 'ACTIVE').length}/${hh.members.length}`);
      hh.members.forEach(m => {
        console.log(`     - [${m.role}] ${m.name} (${m.dietaryPreference || 'N/A'}, status: ${m.status})`);
      });
      console.log('');
    } else {
      console.log(`⚠️  Household ID "${hhId}" not found in DB.`);
    }
  }

  // 2. Classify All Users in Database
  const allUsers = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, status: true, createdAt: true }
  });

  const pilotEmails = new Set([
    'acbd4104@gmail.com',
    'rahul.sharma@gmail.com',
    'anand.patel@gmail.com',
    'kirit.mehta@gmail.com',
    'admin@rasoiiq.in'
  ]);

  const testUserPatterns = [
    '@test.com',
    '@test.in',
    '@testrasoi.in',
    '@pilot.local',
    '+test',
    'fresh_pilot_',
    'rogue.admin',
    'cust-',
    'victim-',
    'test-',
    'pilot.user'
  ];

  const classified = {
    pilotUsers: [],
    testVerificationUsers: []
  };

  for (const u of allUsers) {
    if (pilotEmails.has(u.email)) {
      classified.pilotUsers.push(u);
    } else if (testUserPatterns.some(p => u.email.toLowerCase().includes(p))) {
      classified.testVerificationUsers.push(u);
    } else {
      // Default to test user if created during automated test suites
      classified.testVerificationUsers.push(u);
    }
  }

  console.log('--- User Cohort Classification ---');
  console.log(`  Pilot Core Users Identified: ${classified.pilotUsers.length}`);
  classified.pilotUsers.forEach(u => console.log(`    ⭐ [PILOT] ${u.fullName} (${u.email}) - Role: ${u.role}, Status: ${u.status}`));
  console.log(`  Automated Test / Verification Users: ${classified.testVerificationUsers.length}`);
  console.log(`  Total Users in DB: ${allUsers.length}`);

  // 3. Classify Households
  const allHouseholds = await prisma.household.findMany({
    select: { id: true, name: true, createdAt: true }
  });

  const pilotHhIds = new Set(['hh-sharma-family', 'hh-patel-family', 'hh-mehta-family', 'cmwjbo8tb0001l3rks9ymiw4i']);
  const pilotHouseholds = allHouseholds.filter(h => pilotHhIds.has(h.id));
  const testHouseholds = allHouseholds.filter(h => !pilotHhIds.has(h.id));

  console.log('\n--- Household Cohort Classification ---');
  console.log(`  Pilot Households Identified: ${pilotHouseholds.length}`);
  pilotHouseholds.forEach(h => console.log(`    ⭐ [PILOT] ${h.name} (${h.id})`));
  console.log(`  Automated Test / Verification Households: ${testHouseholds.length}`);
  console.log(`  Total Households in DB: ${allHouseholds.length}`);
  console.log('\n✅ Safe distinction: Filter pilot records by `id in (hh-sharma-family, hh-patel-family, hh-mehta-family, cmwjbo8tb0001l3rks9ymiw4i)` or users by designated pilot emails.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
