-- Migration: 20261118_phase627_order_household_ownership
-- Phase 6.2.7: Authoritative Household Ownership on Orders

-- 1. Add householdId column to Order as nullable initially
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "householdId" TEXT;

-- 2. Authoritative Data Backfill for Historical Orders
-- Priority A: Direct mapping for demo accounts with single authoritative household
UPDATE "Order" SET "householdId" = 'hh-sharma-family' WHERE "userId" = 'user-demo-1' AND "householdId" IS NULL;
UPDATE "Order" SET "householdId" = 'hh-patel-family' WHERE "userId" = 'user-demo-patel' AND "householdId" IS NULL;
UPDATE "Order" SET "householdId" = 'hh-mehta-family' WHERE "userId" = 'user-demo-mehta' AND "householdId" IS NULL;

-- Priority B: Backfill from user's owned household (earliest created)
UPDATE "Order" o
SET "householdId" = h.id
FROM (
    SELECT DISTINCT ON ("userId") "userId", "id"
    FROM "Household"
    ORDER BY "userId", "createdAt" ASC
) h
WHERE o."userId" = h."userId" AND o."householdId" IS NULL;

-- Priority C: Backfill from user's active household membership
UPDATE "Order" o
SET "householdId" = hm."householdId"
FROM (
    SELECT DISTINCT ON ("userId") "userId", "householdId"
    FROM "HouseholdMember"
    WHERE "status" = 'ACTIVE'
    ORDER BY "userId", "createdAt" ASC
) hm
WHERE o."userId" = hm."userId" AND o."householdId" IS NULL;

-- 3. Set NOT NULL constraint on householdId (Only after 100% reconciliation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Order" WHERE "householdId" IS NULL) THEN
        ALTER TABLE "Order" ALTER COLUMN "householdId" SET NOT NULL;
    END IF;
END $$;

-- 4. Add Foreign Key Constraint with Deletion Protection (ON DELETE RESTRICT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Order_householdId_fkey'
    ) THEN
        ALTER TABLE "Order" ADD CONSTRAINT "Order_householdId_fkey"
        FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Create Indexes for High-Performance Tenant Isolation & Queries
CREATE INDEX IF NOT EXISTS "Order_householdId_idx" ON "Order"("householdId");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_householdId_createdAt_idx" ON "Order"("householdId", "createdAt");
