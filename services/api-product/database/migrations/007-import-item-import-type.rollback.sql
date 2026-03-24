-- ============================================================================
-- Rollback: Restore Branch Availability Fields from ImportType
-- ============================================================================
-- Created: 2026-02-05
-- Description: Rollback migration 007 - restore exists_in_head_office and
--              exists_in_current_merchant, remove import_type
--
-- Run this script manually to rollback:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/007-import-item-import-type.rollback.sql
-- ============================================================================

-- 1. Drop new indexes
DROP INDEX IF EXISTS idx_item_batch_import_type;
DROP INDEX IF EXISTS idx_item_import_type;

-- 2. Add back old columns
ALTER TABLE import_product_item
ADD COLUMN IF NOT EXISTS exists_in_head_office BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS exists_in_current_merchant BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. Migrate data back: Set exists_in_current_merchant based on import_type
UPDATE import_product_item
SET exists_in_current_merchant = CASE
  WHEN import_type = 'UPDATE' THEN true
  ELSE false
END,
exists_in_head_office = false  -- Cannot restore HEAD_OFFICE data, set to false
WHERE matched_product_variant_id IS NOT NULL;

-- 4. Drop new column
ALTER TABLE import_product_item
DROP COLUMN IF EXISTS import_type;

-- 5. Drop enum type
DROP TYPE IF EXISTS import_type_enum;

-- 6. Recreate old indexes
CREATE INDEX IF NOT EXISTS idx_item_exists_head_office
ON import_product_item(exists_in_head_office);

CREATE INDEX IF NOT EXISTS idx_item_exists_current_merchant
ON import_product_item(exists_in_current_merchant);

CREATE INDEX IF NOT EXISTS idx_item_branch_availability
ON import_product_item(batch_id, exists_in_head_office, exists_in_current_merchant);

-- 7. Add back comments
COMMENT ON COLUMN import_product_item.exists_in_head_office IS 'Indicates if the matched product variant exists in HEAD_OFFICE merchant_product';
COMMENT ON COLUMN import_product_item.exists_in_current_merchant IS 'Indicates if the matched product variant exists in the importing merchant merchant_product';

-- ============================================================================
-- Rollback Complete
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name IN ('exists_in_head_office', 'exists_in_current_merchant')
  ) AND NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name = 'import_type'
  ) THEN
    RAISE NOTICE 'SUCCESS: Rollback completed - old columns restored!';
  ELSE
    RAISE EXCEPTION 'ERROR: Rollback did not complete correctly';
  END IF;
END $$;
