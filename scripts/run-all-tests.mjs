/**
 * Unified Test Runner for RasoiIQ Regression & Phase 4.1 Verification
 */
import { execSync } from 'child_process';

const suites = [
  { name: 'test-nutrition-engine.mjs', category: 'Nutrition Engine & Precision' },
  { name: 'test-ai-preferences.mjs', category: 'AI Chef Preferences & Dietary Modes' },
  { name: 'test-ai-chef-hardening.mjs', category: 'AI Chef Hardening & Fallback' },
  { name: 'test-gemini-35-flash-lite.mjs', category: 'Gemini 3.5 Flash-Lite Integration' },
  { name: 'test-smart-basket.mjs', category: 'Smart Basket & Retailer Comparisons' },
  { name: 'test-e2e-customer-journey.mjs', category: 'E2E Customer Journey' },
  { name: 'test-rbac-and-security.mjs', category: 'RBAC, Security & Idempotency' },
  { name: 'test-phase4-pilot-foundation.mjs', category: 'Phase 4 Pilot Foundation' },
  { name: 'test-phase41-postgres-and-pilot.mjs', category: 'Phase 4.1 PostgreSQL & Pilot Security' },
  { name: 'test-phase42-safety-and-recipes.mjs', category: 'Phase 4.2 Safety, Recipe Integrity & Provenance' },
  { name: 'test-phase43-household-simulation.mjs', category: 'Phase 4.3 Multi-Household Simulation & IDOR' },
  { name: 'verify-backup-restore.mjs', category: 'Phase 4.3 Database Backup & Restored Parity' },
  { name: 'test-phase5-auth-and-identity.mjs', category: 'Phase 5.0 Authentication, Identity & Multi-Tenant' }
];

console.log('========================================================================');
console.log('       RASOIIQ COMPREHENSIVE AUTOMATED TEST RUNNER (ALL SUITES)         ');
console.log('========================================================================\n');

const results = [];
let grandTotalPassed = 0;
let grandTotalFailed = 0;

for (const suite of suites) {
  process.stdout.write(`Executing ${suite.name} (${suite.category})... `);
  const startTime = Date.now();
  try {
    const output = execSync(`node scripts/${suite.name}`, { timeout: 120000 }).toString();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // Parse pass/fail counts
    let passed = 0;
    let failed = 0;

    const summaryMatch = output.match(/(\d+)\s+passed/i) || 
                         output.match(/(\d+)\s+Passed/i) ||
                         output.match(/AUDIT SUMMARY:\s*(\d+)\/(\d+)\s*TESTS PASSED/i);

    if (summaryMatch) {
      passed = parseInt(summaryMatch[1], 10);
    } else {
      // Count checkmarks / PASS lines
      const passLines = (output.match(/(?:✅\s*PASS|✔\s*PASS|✓)/g) || []).length;
      passed = passLines;
    }

    const failMatch = output.match(/(\d+)\s+failed/i) || output.match(/(\d+)\s+Failed/i);
    if (failMatch) {
      failed = parseInt(failMatch[1], 10);
    }

    grandTotalPassed += passed;
    grandTotalFailed += failed;

    results.push({
      suite: suite.name,
      category: suite.category,
      passed,
      failed,
      duration: `${duration}s`,
      status: failed === 0 ? 'PASSED' : 'FAILED'
    });
    console.log(`✅ ${passed} passed (${duration}s)`);
  } catch (err) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ FAILED (${duration}s)`);
    grandTotalFailed++;
    results.push({
      suite: suite.name,
      category: suite.category,
      passed: 0,
      failed: 1,
      duration: `${duration}s`,
      status: 'FAILED',
      error: err.message
    });
  }
}

console.log('\n========================================================================');
console.log('                        FINAL TEST SCORECARD                            ');
console.log('========================================================================');
console.table(results);
console.log(`GRAND TOTAL: ${grandTotalPassed} assertions passed, ${grandTotalFailed} failed across ${suites.length} suites.`);
console.log('========================================================================\n');

if (grandTotalFailed > 0) {
  process.exit(1);
}
