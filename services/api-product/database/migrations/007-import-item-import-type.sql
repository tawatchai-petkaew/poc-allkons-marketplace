-- ============================================================================
-- Replace Branch Availability Fields with ImportType Enum
-- ============================================================================
-- Created: 2026-02-05
-- Description: Replace exists_in_head_office and exists_in_current_merchant
--              boolean fields with a single import_type enum field
--              (CREATE for new products, UPDATE for existing products)
--
-- Run this script manually:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/007-import-item-import-type.sql
-- ============================================================================

-- 1. Create the enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'import_type_enum') THEN
    CREATE TYPE import_type_enum AS ENUM ('CREATE', 'UPDATE');
    RAISE NOTICE 'Created import_type_enum type';
  ELSE
    RAISE NOTICE 'import_type_enum type already exists';
  END IF;
END $$;

-- 2. Add the new import_type column
ALTER TABLE import_product_item
ADD COLUMN IF NOT EXISTS import_type import_type_enum;

-- 3. Migrate existing data: Set import_type based on exists_in_current_merchant
UPDATE import_product_item
SET import_type = CASE
  WHEN exists_in_current_merchant = true THEN 'UPDATE'::import_type_enum
  ELSE 'CREATE'::import_type_enum
END
WHERE matched_product_variant_id IS NOT NULL
  AND import_type IS NULL;

-- 4. Drop old indexes
DROP INDEX IF EXISTS idx_item_branch_availability;
DROP INDEX IF EXISTS idx_item_exists_current_merchant;
DROP INDEX IF EXISTS idx_item_exists_head_office;

-- 5. Drop old columns
ALTER TABLE import_product_item
DROP COLUMN IF EXISTS exists_in_current_merchant,
DROP COLUMN IF EXISTS exists_in_head_office;

-- 6. Add index for import_type
CREATE INDEX IF NOT EXISTS idx_item_import_type
ON import_product_item(import_type);

-- 7. Add composite index for common queries (batch + import_type)
CREATE INDEX IF NOT EXISTS idx_item_batch_import_type
ON import_product_item(batch_id, import_type);

-- 8. Add comment to document the column
COMMENT ON COLUMN import_product_item.import_type IS 'Import type: CREATE (new product to add), UPDATE (existing product to update)';

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name = 'import_type'
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name IN ('exists_in_head_office', 'exists_in_current_merchant')
  ) THEN
    RAISE NOTICE 'SUCCESS: import_type column added and old columns removed!';
  ELSE
    RAISE EXCEPTION 'ERROR: Migration did not complete correctly';
  END IF;
END $$;
