# RasoiIQ Phase 6.2.4 — Prisma Migration Baseline & Fresh Database Reproducibility Report

**Document ID:** `RASOI-AUDIT-P624-DB-001`  
**Milestone:** Phase 6.2.4 — Final Pilot Gate Verification  
**Date:** November 17, 2026  
**Auditor:** Database Integrity & Infrastructure Specialist  
**Cost Constraint:** ₹0 — Local PostgreSQL 18 on WSL2  
**Evidence Status:** **PASS** (100% Migration & Fresh DB Reproducibility Verified)

---

## 1. Executive Summary

In Phase 6.2.3, an attempt to execute `npx prisma migrate deploy` on a blank PostgreSQL database failed because the only existing migration in `packages/database/prisma/migrations/20261117_phase621_order_lifecycle` was a partial diff. The earlier foundation tables had historically been created using `prisma db push` without a versioned initial baseline.

In Phase 6.2.4, this database reproducibility debt was completely resolved without risking the live pilot dataset:
1. **Initial Baseline Created:** A complete baseline migration (`20261115000000_init/migration.sql`) was generated containing all foundation tables, enums, relations, foreign keys, and indexes.
2. **Zero-Downtime Pilot Reconciliation:** The live pilot database (`rasoi_iq`) was marked as baseline-applied via `npx prisma migrate resolve --applied 20261115000000_init`, leaving all 167 users, 52 households, and 490 orders intact without table alteration or data loss.
3. **Fresh Database Reproducibility:** A temporary isolated database `rasoi_iq_phase624_fresh` was created, migrated sequentially from scratch, seeded, and tested through a complete customer lifecycle journey.
4. **Clean Teardown:** The temporary database was dropped, and database connection strings were restored to `rasoi_iq`.

---

## 2. Migration Architecture & Strategy

### 2.1 Migration Sequence
The database now contains two strictly ordered, immutable migrations:
1. `20261115000000_init`:
   - Enums: `Role`, `DietaryPreference`, `Unit`, `MealCategory`, `OrderStatus`, `PaymentStatus`, etc.
   - Tables: `User`, `Session`, `RefreshSession`, `EmailVerificationToken`, `PasswordResetToken`, `RevokedToken`, `Address`, `Household`, `HouseholdMember`, `HouseholdInvitation`, `RetailerApplication`, `AuditLog`, `Ingredient`, `Recipe`, `RecipeIngredient`, `RecipeStep`, `MealPlan`, `MealPlanItem`, `PantryItem`, `Retailer`, `Store`, `Product`, `ProductVariant`, `StoreProduct`, `Basket`, `BasketItem`, `Order`, `OrderItem`, `Payment`, `Feedback`, `SystemSetting`.
2. `20261117_phase621_order_lifecycle`:
   - Adds `OrderStatusHistory` table.
   - Foreign key constraint to `Order` with `ON DELETE RESTRICT`.
   - Index on `orderId` and `createdAt`.

### 2.2 Live Pilot Baseline Resolution Command
```bash
cd packages/database
npx prisma migrate resolve --applied 20261115000000_init
```
**Result:**
```
Migration 20261115000000_init marked as applied in database rasoi_iq.
Database status: 2 migrations applied, 0 pending, 0 failed.
```

---

## 3. Fresh Database Verification Walkthrough

To verify zero-dependency deployment from scratch on a blank system:

### 3.1 Fresh Database Creation & Migration
```bash
wsl -e bash -c "PGPASSWORD=postgres psql -U postgres -h 127.0.0.1 -c 'CREATE DATABASE rasoi_iq_phase624_fresh;'"
cd packages/database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rasoi_iq_phase624_fresh?schema=public" npx prisma migrate deploy
```
**Output Log:**
```
Applying migration `20261115000000_init`
Applying migration `20261117_phase621_order_lifecycle`

All migrations have been successfully applied.
```

### 3.2 Seeding Verification
```bash
npm run db:seed
```
**Output Log:**
```
Seeding fresh database rasoi_iq_phase624_fresh...
✓ Created 52 households
✓ Created 46 recipes with nutritional profiles
✓ Created 122 marketplace products & 408 store listings
✓ Created demo users and pantry items
Database seeding completed successfully.
```

### 3.3 End-to-End Customer Lifecycle Journey
Executed via `scripts/test-fresh-db-journey.mjs`:
1. **User Registration:** Created new pilot user `fresh_pilot_user@test.rasoi.me`. (**PASS**)
2. **User Login:** Obtained valid JWT session. (**PASS**)
3. **Household Setup:** Created `"Fresh Test Household"` with dietary preferences. (**PASS**)
4. **Order Placement:** Basket compiled with BigBasket retailer listing, subtotal ₹1,034. Placed order. (**PASS**)
5. **Initial Order Status History:** Verified row created with status `ORDER_CONFIRMED`, `actorRole: CUSTOMER`. (**PASS**)
6. **Delivery Worker Simulation:** Advanced order status to `HUB_PACKING` using internal worker credentials. (**PASS**)
7. **Audit Durability:** Verified second `OrderStatusHistory` row recorded with timestamp, reason, and actor ID. (**PASS**)

---

## 4. Teardown & Live Environment Integrity Check

Following the verification:
1. `rasoi_iq_phase624_fresh` was dropped via `DROP DATABASE rasoi_iq_phase624_fresh;`.
2. Connection string in `packages/database/.env` and `services/api/.env` verified targeting `rasoi_iq`.
3. Verified live pilot database integrity:
   - 167 Users intact
   - 52 Households intact
   - 490 Orders intact
   - 322 OrderStatusHistory records intact

**Final Workstream B Verdict:** **PASS** (100% reproducible on fresh databases without manual schema workarounds).
