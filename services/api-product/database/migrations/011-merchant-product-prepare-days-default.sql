-- Migration: Set default value for prepareDays column in merchant_product
-- Purpose: Ensure prepareDays always has a default value of 1 day

-- Step 1: Update existing NULL values to 1
UPDATE merchant_product
SET "prepareDays" = 1
WHERE "prepareDays" IS NULL;

-- Step 2: Set default value for the column
ALTER TABLE merchant_product
ALTER COLUMN "prepareDays" SET DEFAULT 1;

-- Step 3: Make column NOT NULL (since we now have a default)
ALTER TABLE merchant_product
ALTER COLUMN "prepareDays" SET NOT NULL;
