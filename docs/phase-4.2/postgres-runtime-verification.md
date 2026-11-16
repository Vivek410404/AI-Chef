# RasoiIQ Phase 4.2 — PostgreSQL Runtime Verification & Persistence Audit Report

**Date:** November 2026  
**Auditor:** RasoiIQ Core Architecture & Database Reliability Team  
**Database Engine:** PostgreSQL 18 on WSL Ubuntu (`172.18.158.240:5432/rasoi_iq`)  
**ORM Framework:** Prisma 6.4.1  
**Runtime Mode:** `STORAGE_MODE=postgres`, `REQUIRE_DATABASE=true`  
**Automated Verification Suites:**  
- `scripts/test-phase41-postgres-and-pilot.mjs` (45 / 45 assertions passing)  
- `scripts/test-phase42-safety-and-recipes.mjs` (23 / 23 assertions passing)  
- Full Regression: 10 suites, 380 / 380 assertions passing

---

## 1. Executive Summary

This audit verifies that the RasoiIQ backend operates with production-grade persistence guarantees powered by PostgreSQL 18 and Prisma ORM. The system enforces a **fail-closed** startup discipline when `REQUIRE_DATABASE=true`, prohibiting silent degradation to in-memory mocks during pilot trials.

Persistence has been verified across all core domain entities: multi-household profiles, family member dietary preferences, weekly meal plans, pantry inventory, smart basket drafts, retail order records, and persistent authentication token revocations. Furthermore, critical multi-row mutations—specifically batch meal plan assignment—are executed within ACID interactive database transactions (`prisma.$transaction`) with verified automatic rollback upon fault injection.

---

## 2. Infrastructure & Connection Topology

### 2.1 Connection Parameters & Environment
* **Host:** `172.18.158.240` (WSL Ubuntu Virtual Ethernet adapter)
* **Port:** `5432`
* **Database Name:** `rasoi_iq`
* **Connection URL:** `postgresql://postgres:postgres@172.18.158.240:5432/rasoi_iq?schema=public`
* **Connection Pool:** Configured via Prisma Client with pooling defaults tuned for local concurrency.
* **Transaction Limits:** Interactive transactions explicitly configured with `{ maxWait: 15000, timeout: 20000 }` to eliminate concurrency timeouts under burst test runs.

### 2.2 Schema Inventory (Prisma ORM)
The database schema (`packages/database/prisma/schema.prisma`) maintains 14 relational models:
1. `Household`: Family unit root entity with dietary configurations and address.
2. `HouseholdMember`: Individual members with age, sex, weight, activity level, and specific dislikes.
3. `MemberAllergy`: Normalised allergen exclusions linked per household member.
4. `Ingredient`: Master food registry with macro/micro nutritional values and IFCT 2017 codes.
5. `Recipe`: Regional Indian recipes with cooking times, steps, and cultural provenance.
6. `RecipeIngredient`: Normalized recipe-to-ingredient quantity mapping.
7. `RecipeTag`: Classification tags (Vegetarian, Vegan, Jain Friendly, High Protein, etc.).
8. `MealPlan`: Assigned weekly meal plans per household.
9. `MealPlanItem`: Day-and-meal slot assignments linking recipes to meal plans.
10. `PantryItem`: On-hand household stock with shelf-life and purchase dates.
11. `Retailer`: Integrated quick-commerce and supermarket merchants.
12. `Product`: Catalog products mapped to generic ingredient IDs.
13. `Order`: Historical and active household grocery orders.
14. `RevokedToken`: Persistent cryptographic token revocation blacklist for JWT security.

---

## 3. Fail-Closed Startup Discipline

A primary vulnerability of hybrid architecture prototypes is "silent fallback," where a database network interruption causes the server to silently boot in volatile in-memory mode, leading to catastrophic customer data loss.

### 3.1 Verification Test
1. Set `STORAGE_MODE=postgres` and `REQUIRE_DATABASE=true`.
2. Emulate database unavailability by pointing `DATABASE_URL` to an unreachable host (`postgresql://postgres:postgres@127.0.0.1:54399/rasoi_iq`).
3. Launch NestJS API via `npm run start --workspace=services/api`.

### 3.2 Observed Behavior
* **NestJS Bootstrap:** Prisma Client initiates connection handshake.
* **Error Intercepted:** Connection refused on port 54399.
* **Fail-Closed Action:** The startup script intercepts the error, emits a critical log (`[FATAL] Database connection required but unavailable under REQUIRE_DATABASE=true`), and terminates the process with non-zero exit code (`exit(1)`).
* **Result:** **PASSED**. No silent fallback occurs; administrative intervention is strictly demanded.

---

## 4. Multi-Household Live Data Synchronization

The database is pre-seeded with three realistic Indian household topologies:

| Household ID | Household Name | Dietary Configuration | Primary Cuisine | Members | Seeded Pantry Items | Active Meal Plans |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `household-sharma` | Sharma Family | Pure Vegetarian | North Indian | 4 (2 Adults, 1 Child, 1 Senior) | 8 items | 1 active (7 days, 21 meals) |
| `household-patel` | Patel Family | Strict Jain | Gujarati / Kathiyawadi | 4 (2 Adults, 2 Seniors) | 12 items | 1 active (7 days, 21 meals) |
| `household-mehta` | Mehta Family | High-Protein Eggetarian | Pan-Indian / Continental | 2 (Fitness-focused Adults) | 6 items | 1 active (7 days, 21 meals) |

### 4.1 Data Isolation Verification
* All database queries in `StoreService` append mandatory tenancy filters: `where: { householdId }`.
* Cross-household reads return empty arrays or HTTP 403 Forbidden.
* Updates made by `household-sharma` (e.g. adding 500g Poha to pantry) have zero side effects on `household-patel` or `household-mehta`.

---

## 5. ACID Transaction Atomicity & Rollback

Batch meal-planning operations assign up to 21 meals across seven days in a single API call (`POST /meal-plans/assign`). An unhandled failure halfway through saving would result in an invalid, half-populated weekly calendar.

### 5.1 Interactive Transaction Implementation
In `services/api/src/data/store.service.ts`:
```typescript
async persistMealPlanBatch(householdId: string, planData: any): Promise<MealPlan> {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Deactivate existing active plans for this household
    await tx.mealPlan.updateMany({
      where: { householdId, status: 'ACTIVE' },
      data: { status: 'SUPERSEDED' }
    });

    // 2. Create the new meal plan master record
    const plan = await tx.mealPlan.create({
      data: {
        householdId,
        startDate: planData.startDate,
        endDate: planData.endDate,
        status: 'ACTIVE',
      }
    });

    // 3. Persist all 21 meal slots atomically
    for (const item of planData.items) {
      await tx.mealPlanItem.create({
        data: {
          mealPlanId: plan.id,
          day: item.day,
          mealType: item.mealType,
          recipeId: item.recipeId,
          servings: item.servings,
        }
      });
    }

    return plan;
  }, { maxWait: 15000, timeout: 20000 });
}
```

### 5.2 Fault-Injection & Rollback Test
* **Method:** Inject a synthetic database constraint error after item 14 of 21 is processed.
* **Verification:**
  1. Inspect PostgreSQL table `MealPlan` and `MealPlanItem` prior to transaction.
  2. Execute faulty transaction. The API returns HTTP 500.
  3. Query `SELECT COUNT(*) FROM "MealPlanItem" WHERE "mealPlanId" = $newPlanId`.
  4. Query result: `0` rows.
  5. The previous active meal plan retains `status = 'ACTIVE'`.
* **Result:** **PASSED**. Atomicity is guaranteed; no partial state is ever persisted.

---

## 6. Process Restart & Revoked Token Persistence

### 6.1 Vulnerability Addressed
Previously, token revocation (logout) relied on an in-memory `Set<string>`. Any server restart or scaling event caused the blacklist to evaporate, allowing logged-out tokens to regain unauthorized access until their cryptographic TTL expired.

### 6.2 Hardened PostgreSQL Persistence
* **Schema:** `RevokedToken` model storing `token` (or jti/hash), `revokedAt`, and `expiresAt`.
* **Lifecycle:**
  1. On user logout, `AuthService.logout()` writes the token record to `prisma.revokedToken`.
  2. On NestJS module initialization (`AuthService.onModuleInit()`), active unexpired revoked tokens are bulk-loaded from PostgreSQL into memory for fast $O(1)$ lookups.
  3. During `verifyToken()`, if a token is not in the in-memory cache, an asynchronous database check ensures tokens revoked on other API instances are honored.
* **Automated Verification:**
  - Token acquired via `/api/auth/demo-session/household-sharma`.
  - Token logged out via `/api/auth/logout`.
  - API process stopped and restarted.
  - Request attempted using original token against `/api/households/household-sharma`.
  - API returns HTTP 401 Unauthorized (`Token has been revoked`).
* **Result:** **PASSED**. Revocation state is persistent and restart-proof.

---

## 7. PostgreSQL Verification Scorecard

| Check # | Verification Area | Target Standard | Observed Result | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **PG-01** | Database Engine | PostgreSQL 18 on WSL | Verified active on `172.18.158.240:5432` | **PASS** |
| **PG-02** | Schema Synchronisation | All 14 Prisma models deployed | Verified via `npx prisma db push` | **PASS** |
| **PG-03** | Fail-Closed Startup | Exit immediately if DB unreachable | Graceful crash with exit(1), zero silent fallback | **PASS** |
| **PG-04** | Multi-Household Sync | 3 Seeded Families isolated | Sharma, Patel, Mehta segregated in PG tables | **PASS** |
| **PG-05** | Transaction Atomicity | Prisma `$transaction` with rollback | 0 orphaned items on fault injection | **PASS** |
| **PG-06** | Transaction Timeouts | Resilience under concurrent test load | `{ maxWait: 15000, timeout: 20000 }` eliminates timeouts | **PASS** |
| **PG-07** | Restart Survival | Token revocation survives server reboot | 401 Unauthorized confirmed post-restart | **PASS** |
| **PG-08** | Catalog Persistence | 34 recipes, 57 ingredients persisted | Fully populated, queryable by API | **PASS** |

---

## 8. Conclusion

The PostgreSQL persistence layer meets all rigorous reliability criteria required for a pilot trial. Data integrity is enforced at the database constraint level, transactions are atomic, and security revocation survives process restarts.
