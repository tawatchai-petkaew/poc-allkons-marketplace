-- ============================================================================
-- Add imported_at Column to import_product_item Table
-- ============================================================================
-- Created: 2026-02-04
-- Description: Add timestamp field to track when an item's import is completed
--
-- Run this script manually:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/005-import-item-imported-at.sql
-- ============================================================================

-- Add imported_at column to import_product_item table
ALTER TABLE import_product_item 
ADD COLUMN imported_at TIMESTAMP NULL;

-- Add index for querying by import completion time
CREATE INDEX IF NOT EXISTS idx_item_imported_at 
ON import_product_item(imported_at);

-- Add comment to document the column purpose
COMMENT ON COLUMN import_product_item.imported_at IS 'Timestamp when the item import status changed to COMPLETED';

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name = 'imported_at'
  ) THEN
    RAISE NOTICE 'SUCCESS: imported_at column added successfully!';
  ELSE
    RAISE EXCEPTION 'ERROR: Column was not created';
  END IF;
END $$;
