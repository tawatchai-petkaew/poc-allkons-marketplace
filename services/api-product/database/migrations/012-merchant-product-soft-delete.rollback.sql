-- Rollback: Remove soft-delete columns from merchant_product table

-- Step 1: Restore original full unique index
DROP INDEX IF EXISTS "uq_merchant_product_variant_active";

CREATE UNIQUE INDEX IF NOT EXISTS uq_merchant_product_variant
  ON merchant_product ("merchantId", "productVariantId");

-- Step 2: Drop deleted_at index
DROP INDEX IF EXISTS "iX_merchant_product_deletedAt";

-- Step 3: Remove deletedBy column
ALTER TABLE merchant_product
DROP COLUMN IF EXISTS "deletedBy";

-- Step 4: Remove deleted_at column
ALTER TABLE merchant_product
DROP COLUMN IF EXISTS deleted_at;
