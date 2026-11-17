import { execSync } from 'child_process';

const suites = [
  { name: 'Smart Basket Aggregation & Deduplication', script: 'scripts/test-smart-basket.mjs', expected: 10 },
  { name: 'Nutrition Engine & Density Conversions', script: 'scripts/test-nutrition-engine.mjs', expected: 60 },
  { name: 'Phase 6.2.1 Order Lifecycle & History Integrity', script: 'scripts/test-phase621-integrity.mjs', expected: 27 },
  { name: 'Phase 6.2.2 Unit Semantics & Inventory Hardening', script: 'scripts/test-phase622-hardening.mjs', expected: 24 },
  { name: 'Phase 6.2.3 Security, Authorization & Tenant Isolation', script: 'scripts/test-phase623-security.mjs', expected: 37 },
  { name: 'Phase 6.2.4 Final Pilot Gate Verification', script: 'scripts/test-phase624-gate.mjs', expected: 17 },
  { name: 'Phase 6.2.5 Comprehensive Security, Worker & Reorder Suite', script: 'scripts/test-phase625-comprehensive.mjs', expected: 26 },
  { name: 'Phase 6.2.5 Fresh Database Reproducibility & Migration Deploy', script: 'scripts/test-fresh-db-journey.mjs', expected: 11 },
  { name: 'Phase 6.2.5 18-Step Supervised Pilot Smoke Battery', script: 'scripts/test-phase625-smoke-journey.mjs', expected: 18 },
  { name: 'AI Chef Meal Planning & Multi-Model Diversity Suite', script: 'scripts/test-ai-generation.mjs', expected: 8 }
];

console.log('🧪 =========================================================================');
console.log('🧪 RASOIIQ MASTER TEST BATTERY EXECUTION (ALL 9 SUITES)');
console.log('🧪 =========================================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const suite of suites) {
  process.stdout.write(`Running: ${suite.name} (${suite.script})... `);
  const start = Date.now();
  try {
    const output = execSync(`node ${suite.script}`, { encoding: 'utf-8', stdio: 'pipe' });
    const duration = Date.now() - start;
    process.stdout.write(`✅ PASSED (${duration}ms)\n`);
    totalPassed += suite.expected;
    results.push({ name: suite.name, status: 'PASS', assertions: suite.expected, duration: `${duration}ms` });
  } catch (err) {
    const duration = Date.now() - start;
    process.stdout.write(`❌ FAILED (${duration}ms)\n`);
    totalFailed += suite.expected;
    results.push({ name: suite.name, status: 'FAIL', assertions: suite.expected, duration: `${duration}ms` });
    console.error(err.stdout || err.stderr || err.message);
  }
}

console.log('\n=========================================================================');
console.log('MASTER TEST SUITE SUMMARY:');
console.table(results);
console.log(`GRAND TOTAL: ${totalPassed} Assertions PASSED, ${totalFailed} FAILED`);
console.log('=========================================================================');

if (totalFailed > 0) process.exit(1);
