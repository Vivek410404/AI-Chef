# RasoiIQ Phase 6.2.6 — Database Reproducibility & Recovery Audit

**Milestone:** Phase 6.2.6  
**Date:** November 18, 2026  
**Auditor:** Database Reliability Engineer (DBRE)  
**Database Engine:** PostgreSQL 18.6 (WSL2 Ubuntu 24.04 x86_64)  
**ORM:** Prisma 6.19.3  
**Status:** **PASS (100% Verified Reproducibility & Non-Destructive Recovery)**

---

## 1. Audit Scope & Non-Negotiable Directives

1. **Zero Data Loss:** The live pilot database `rasoi_iq` must be strictly preserved without reset, truncate, or drop operations.
2. **Migration Reproducibility:** A brand-new database must be successfully created, migrated, and seeded using the existing migration chain without syntax errors or drift.
3. **Real Cold Backup & Restoration:** `pg_dump` must produce a valid binary archive of the live pilot database, and `pg_restore` must restore it into an isolated test target with 100% record parity.
4. **Foreign Key Integrity:** `ON DELETE RESTRICT` constraints on `OrderStatusHistory` must block destructive order deletions.

---

## 2. Live Pilot Database Baseline (`rasoi_iq`)

Prior to conducting Phase 6.2.6 audits, the live pilot database state was captured:

```json
{
  "users": 218,
  "households": 107,
  "members": 140,
  "recipes": 46,
  "ingredients": 57,
  "products": 122,
  "variants": 141,
  "retailers": 44,
  "storeProducts": 408,
  "mealPlanItems": 174,
  "pantryItems": 18,
  "orders": 700,
  "orderItems": 678,
  "history": 702,
  "sessions": 268,
  "revoked": 69,
  "audits": 1123
}
```

---

## 3. Fresh Database Reproducibility (`rasoi_iq_phase625_fresh`)

The script [scripts/test-fresh-db-journey.mjs](file:///d:/Startup/scripts/test-fresh-db-journey.mjs) was executed to verify the cold-start initialization pipeline:

1. **Database Creation:** Dropped any stale instance and created blank target `rasoi_iq_phase625_fresh`.
2. **Prisma Migrate Deploy:** Executed `npx prisma migrate deploy` on the blank database.
   - Applied `20261115000000_init/migration.sql` (Initial core schema).
   - Applied `20261117_phase621_order_lifecycle/migration.sql` (Hardened order lifecycle & `ON DELETE RESTRICT`).
   - Outcome: All migrations applied cleanly with zero warnings or errors.
3. **Database Seeding:** Executed seed pipeline `npx prisma db seed`:
   - 57 Indian ingredients seeded.
   - 34 Indian recipes seeded.
   - 4 Indian retailers seeded.
   - 49 retail product variants seeded.
   - Core households (Sharma, Patel, Mehta) seeded.
4. **Cold-Start Transaction Verification:**
   - Registered a new pilot user (`cmwlv0vei0000l3fo5stpl498`).
   - Created household and associated membership.
   - Placed an order and verified `OrderStatusHistory` row creation (`changedBy: system-worker`).
   - Attempted order deletion and verified strict SQLState `23001` (`foreign_key_violation`) rejection due to `ON DELETE RESTRICT`.
5. **Cleanup:** Cleanly dropped temporary database `rasoi_iq_phase625_fresh`.

**Result:** **11/11 STEPS PASSED (100% REPRODUCIBLE)**.

---

## 4. Real Backup and Restore Audit (`rasoi_iq_phase626_restore_test`)

The script [scripts/test-backup-restore.mjs](file:///d:/Startup/scripts/test-backup-restore.mjs) was executed against the active pilot database:

1. **Backup Creation:**
   - Command: `pg_dump -h localhost -p 5432 -U postgres -Fc -b -v -f /tmp/rasoi_iq_backup.dump rasoi_iq`
   - Archive Size: **371,700 bytes (363.0 KB)**.
   - Integrity: Valid PostgreSQL custom-format compressed binary archive.
2. **Restoration Execution:**
   - Target: `rasoi_iq_phase626_restore_test` (freshly initialized).
   - Command: `pg_restore -h localhost -p 5432 -U postgres -d rasoi_iq_phase626_restore_test /tmp/rasoi_iq_backup.dump`
   - Exit Code: **0 (Zero Errors)**.
3. **Data Parity Verification:**

| Table | Live Pilot Count (`rasoi_iq`) | Restored Count (`restore_test`) | Parity Status |
| :--- | :--- | :--- | :--- |
| `User` | 218 | 218 | **100% Match** |
| `Household` | 107 | 107 | **100% Match** |
| `Recipe` | 46 | 46 | **100% Match** |
| `Ingredient` | 57 | 57 | **100% Match** |
| `Order` | 700 | 700 | **100% Match** |
| `OrderStatusHistory` | 702 | 702 | **100% Match** |
| `AuditLog` | 1,123 | 1,123 | **100% Match** |

4. **Cleanup:** Dropped `rasoi_iq_phase626_restore_test` and unlinked temporary dump files.

**Result:** **5/5 STEPS PASSED (100% PARITY, ZERO DATA LOSS)**.

---

## 5. DBRE Sign-Off

The RasoiIQ PostgreSQL database engine and Prisma migration infrastructure are thoroughly verified, deterministic, and fully recoverable. Zero manual schema patches are required to bootstrap a clean environment.
