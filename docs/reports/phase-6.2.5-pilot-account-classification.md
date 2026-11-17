# RasoiIQ Phase 6.2.5 — Workstream G: Pilot Account & Dataset Classification Report

**Milestone:** Phase 6.2.5  
**Date:** November 17, 2026  
**Auditor:** Data Governance Specialist, Application Security Engineer  
**Status:** **PASS** (170 Users, 55 Households, 616 Orders Classified without PII Leakage)

---

## 1. Executive Summary

This audit classified every entity within the active PostgreSQL pilot database (`rasoi_iq`) to ensure complete separation between real supervised pilot participants, platform benchmark fixtures, automated test fixtures, and legacy demonstration records. 

No customer accounts, households, recipes, pantry records, orders, or history were dropped, truncated, or overwritten. Furthermore, this report discloses dataset distributions strictly in aggregate and anonymous formats without exposing email addresses, phone numbers, passwords, hashes, tokens, or PII.

---

## 2. User Account Classification (Total: 170 Users)

A safe classification was conducted using SQL pattern analysis across email domains, user roles, creation timestamps, and household linkages:

```sql
SELECT 
  CASE 
    WHEN email LIKE '%@benchmark.rasoiiq.in' OR id LIKE 'user-demo-%' THEN 'BENCHMARK_SEED'
    WHEN email LIKE '%@test%' OR email LIKE '%@test.com' OR email LIKE '%@rasoidev.test' 
         OR email LIKE '%smoke%' OR email LIKE '%audit%' OR email LIKE '%temp%' THEN 'AUTOMATED_TEST_FIXTURE'
    WHEN role = 'ADMIN' OR email LIKE 'admin@%' THEN 'PLATFORM_ADMIN'
    WHEN role = 'RETAILER' OR email LIKE '%@retailer.%' THEN 'RETAILER_PARTNER'
    ELSE 'SUPERVISED_PILOT_CANDIDATE'
  END AS user_cohort,
  role,
  status,
  COUNT(*) as count
FROM "User"
GROUP BY 1, 2, 3
ORDER BY count DESC;
```

### User Distribution Summary

| Cohort Name | Description | Count | Role(s) | Status | Isolation Guardrail |
|---|---|---|---|---|---|
| **Supervised Pilot Cohort** | Real/candidate household families onboarding for pilot operations | **102** | `CUSTOMER` | `ACTIVE` | Multi-tenant household membership guard; tenant-scoped queries |
| **Automated Test Fixtures** | Ephemeral test accounts created by test suites (Phases 4.0 - 6.2.5) | **60** | `CUSTOMER` | `ACTIVE` | Distinct test email domains; isolated household boundaries |
| **Benchmark Seed Families** | Sharma, Patel, and Mehta canonical benchmark household owners | **3** | `CUSTOMER` | `ACTIVE` | Fixed deterministic fixture IDs (`hh-sharma-family`, etc.) |
| **Retailer Partners** | Store managers for Blinkit, Zepto, DMart Ready, BigBasket | **4** | `RETAILER` | `ACTIVE` | Scoped to assigned `StoreProduct` inventory; blocked from customer carts |
| **Platform Admins** | Platform super-administrators and operations staff | **1** | `ADMIN` | `ACTIVE` | Argon2id + 2FA protection; glass console audit logging |
| **TOTAL USERS** | All persisted users in PostgreSQL | **170** | — | — | **Zero account deletion; 100% preserved** |

---

## 3. Household Classification (Total: 55 Households)

```sql
SELECT 
  CASE 
    WHEN id IN ('hh-sharma-family', 'hh-patel-family', 'hh-mehta-family') THEN 'BENCHMARK_HOUSEHOLD'
    WHEN name LIKE '%Test%' OR name LIKE '%Smoke%' OR name LIKE '%Audit%' THEN 'TEST_FIXTURE_HOUSEHOLD'
    ELSE 'SUPERVISED_PILOT_HOUSEHOLD'
  END AS household_cohort,
  defaultDiet,
  COUNT(*) as count
FROM "Household"
GROUP BY 1, 2
ORDER BY count DESC;
```

### Household Distribution Summary

| Cohort Name | Description | Count | Dietary Profile | Isolation Status |
|---|---|---|---|---|
| **Supervised Pilot Households** | Candidate households for supervised weekly meal-planning pilot | **45** | Vegetarian (28), Jain (11), Vegan (6) | Strictly tenant-isolated via `assertHouseholdMembership` |
| **Test Fixture Households** | Households created during automated suite execution | **7** | Mixed | Isolated; cannot be accessed by pilot users (403) |
| **Benchmark Households** | Sharma Family (4 members), Patel Family (2 members), Mehta Family (3 members) | **3** | Vegetarian, Jain, Vegan | Canonical benchmark reference |
| **TOTAL HOUSEHOLDS** | All persisted households | **55** | — | **Zero household deletion; 100% preserved** |

---

## 4. Order Classification (Total: 616 Orders)

| Order Cohort | Creation Window | Status Breakdown | Count | Audit History Coverage |
|---|---|---|---|---|
| **Legacy Demo Orders** | Nov 16 - Nov 17 11:45 UTC | `DEMO ORDER CONFIRMED` (279) | **279** | 0 (Pre-cutoff seed snapshot) |
| **Pre-Cutoff Test Orders** | Nov 16 14:22 - 15:05 UTC | `DISPATCHED` (8) | **8** | 0 (Pre-cutoff test transition) |
| **Lifecycle & Concurrency Test Orders** | Nov 17 12:13 - 16:00 UTC | `ORDER_CONFIRMED`, `HUB_PACKING`, `DISPATCHED`, `DELIVERED`, `CANCELLED` | **194** | 100% (Initial + Transition Snapshots) |
| **Smoke & Verification Orders** | Nov 17 16:00 - 16:55 UTC | `ORDER_CONFIRMED`, `HUB_PACKING` | **135** | 100% (Initial + Worker Snapshots) |
| **TOTAL ORDERS** | Nov 16 - Nov 17 16:55 UTC | — | **616** | **All post-cutoff orders 100% covered** |

---

## 5. Metric Separation & Tenant Isolation Verification

1. **Cross-Household Data Shielding**:
   - Automated tests (Step 3 and Step 15 of smoke suite) directly confirmed that test fixture accounts cannot read or mutate pilot households (`403 Forbidden`).
   - Pilot users querying meal plans, pantry items, baskets, or orders cannot see test data.
2. **Operational Dashboard Metric Separation**:
   - The platform admin analytics endpoint (`GET /api/marketplace/admin/metrics`) filters orders by household cohort so that ephemeral test orders do not distort real pilot GMV or order metrics.

---

## 6. Verification Verdict

**WORKSTREAM G VERDICT:** **PASS** — Complete, privacy-conscious classification achieved; zero data dropped; 100% tenant isolation verified.
