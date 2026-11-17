-- Migration: 20261117_phase621_order_lifecycle
-- Phase 6.2.1 / 6.2.2: Order Status History, Order Lifecycle fields, and flexible OrderItem snapshot fields

-- 1. Alter Table "Order" to include status transition metadata
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "substitutionNotes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "fulfillmentNotes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "statusReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;

-- 2. Alter Table "OrderItem" to support optional product variant references and direct snapshot fields
DO $$
BEGIN
    -- Make productVariantId nullable if it was NOT NULL
    ALTER TABLE "OrderItem" ALTER COLUMN "productVariantId" DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "productName" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "brand" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "packSize" TEXT;

-- 3. Create Table "OrderStatusHistory"
CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "reason" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- 4. Create Indexes for OrderStatusHistory
CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX IF NOT EXISTS "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- 5. Foreign Key Constraint with Restrictive Delete (Audit Immutability Protection)
DO $$
BEGIN
    ALTER TABLE "OrderStatusHistory" DROP CONSTRAINT IF EXISTS "OrderStatusHistory_orderId_fkey";
    ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" 
        FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
END $$;
