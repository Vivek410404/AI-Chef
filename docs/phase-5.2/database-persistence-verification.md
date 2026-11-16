# RasoiIQ Phase 5.2 — Database Persistence & Fail-Closed Integrity Verification

**Milestone:** Phase 5.2 — Security Hardening, Data Integrity & Operational Verification  
**Database:** PostgreSQL 18.x (Alpine) on WSL2  
**ORM:** Prisma Client 6.x  
**Schema:** `packages/database/prisma/schema.prisma`  

---

## 1. Database Persistence Verification Across Restarts

RasoiIQ operates strictly with persistent relational database backing. In-memory data structures are utilized only for transient runtime caching (e.g. active JWT blacklist, sliding-window rate limit counters).

### Persistence Audit of Core Entities
To verify that real database operations replace mock fallbacks, all primary application entities were verified directly via SQL/Prisma against PostgreSQL:

| Entity / Model | Storage Table | Survival Across Restart | Relational Constraints Verified |
| :--- | :--- | :---: | :--- |
| Users & Auth | `User` | **YES** | Unique `email`, unique `normalizedEmail`, status check |
| Refresh Sessions | `RefreshSession` | **YES** | Foreign key `userId -> User.id` ON DELETE CASCADE |
| Households | `Household` | **YES** | Primary key `id`, dietary preference enum |
| Household Members | `HouseholdMember` | **YES** | Compound unique index `(householdId, userId)` |
| Recipes | `Recipe` | **YES** | 32+ verified recipes, JSON ingredients, nutrition |
| Meal Plans | `MealPlan` | **YES** | Foreign key `householdId -> Household.id` |
| Meal Plan Items | `MealPlanItem` | **YES** | Foreign key `mealPlanId -> MealPlan.id`, `recipeId -> Recipe.id` |
| Pantry Items | `PantryItem` | **YES** | Foreign key `householdId -> Household.id` |
| Grocery Baskets | `GroceryBasket` | **YES** | One-to-one with `Household` |
| Basket Items | `GroceryBasketItem` | **YES** | Foreign key `basketId -> GroceryBasket.id` |
| Retailers | `Retailer` | **YES** | Unique `slug`, active boolean |
| Retailer Applications | `RetailerApplication` | **YES** | Foreign key `userId -> User.id` |
| Orders | `Order` | **YES** | Foreign key `householdId`, status enum, total INR |
| Audit Logs | `AuditLog` | **YES** | Append-only, indexed `action`, `userId` |

---

## 2. Fail-Closed Startup Architecture (`REQUIRE_DATABASE=true`)

In `services/api/src/store/store.service.ts`:
```typescript
if (process.env.REQUIRE_DATABASE === 'true') {
  if (!this.isPrismaConnected) {
    this.logger.error('CRITICAL: REQUIRE_DATABASE=true but PostgreSQL connection could not be established.');
    process.exit(1);
  }
}
```

### Verification
1. **Valid DB Connection:** PostgreSQL running on WSL2 -> NestJS boots cleanly, reports `[PrismaService] Connected to PostgreSQL authoritative database.`
2. **Invalid DB Connection / DB Down:** Verified in Phase 4.1: When database port is blocked or credentials fail, the application refuses to start and immediately terminates with exit code 1. It never silently degrades to in-memory mode when `REQUIRE_DATABASE=true`.

---

## 3. Database Backup and Restore Verification

### Phase 5.2 Pre-Execution Backup
- Command executed:
  ```bash
  wsl -- env PGPASSWORD=postgres pg_dump -h 127.0.0.1 -U postgres -d rasoi_iq -F p -b -v -f /mnt/d/Startup/backups/rasoi_iq_phase52_pre.sql
  ```
- Result: Backup archive `backups/rasoi_iq_phase52_pre.sql` created successfully (246,375 bytes).
- Integrity: Validated that table definitions, triggers, constraints, and data for all tables are captured.

### Restored Parity Test
- Tested via `scripts/verify-backup-restore.mjs`:
  - 12 assertions passed.
  - Successfully restores into temporary validation database `rasoi_iq_restore_test`.
  - Verifies exact record counts and relational integrity between primary and restored instances.
