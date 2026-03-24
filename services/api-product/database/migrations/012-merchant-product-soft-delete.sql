-- Migration: Add soft-delete columns to merchant_product table
-- Purpose: Support soft-delete feature with deletedAt timestamp and deletedBy audit trail

-- Step 1: Add deleted_at column (TypeORM @DeleteDateColumn)
ALTER TABLE merchant_product
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Step 2: Add deletedBy column (audit trail)
ALTER TABLE merchant_product
ADD COLUMN IF NOT EXISTS "deletedBy" VARCHAR(256) NULL;

-- Step 3: Add index on deleted_at for performant soft-delete queries
CREATE INDEX IF NOT EXISTS "iX_merchant_product_deletedAt"
  ON merchant_product (deleted_at);

-- Step 4: Replace full unique index with Partial Unique Index
-- Old index blocks re-import after soft delete → replace with one that only
-- enforces uniqueness on ACTIVE (non-deleted) rows.
DROP INDEX IF EXISTS uq_merchant_product_variant;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_merchant_product_variant_active"
  ON merchant_product ("merchantId", "productVariantId")
  WHERE deleted_at IS NULL;