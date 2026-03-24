-- Migration: Add unique constraint on merchant_product (merchantId, productVariantId)
-- Purpose: Prevent duplicate products per merchant to avoid race condition issues

-- Step 1: Remove duplicates (keep the latest record based on id)
DELETE FROM merchant_product a
USING merchant_product b
WHERE a.id < b.id 
  AND a."merchantId" = b."merchantId" 
  AND a."productVariantId" = b."productVariantId";

-- Step 2: Create unique index
CREATE UNIQUE INDEX uq_merchant_product_variant 
ON merchant_product ("merchantId", "productVariantId");
