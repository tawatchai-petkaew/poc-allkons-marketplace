-- Rollback: Remove default value and NOT NULL constraint from prepareDays column

-- Step 1: Allow NULL values again
ALTER TABLE merchant_product
ALTER COLUMN "prepareDays" DROP NOT NULL;

-- Step 2: Remove default value
ALTER TABLE merchant_product
ALTER COLUMN "prepareDays" DROP DEFAULT;
