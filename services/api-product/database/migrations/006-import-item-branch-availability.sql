-- ============================================================================
-- Add Branch Availability Check Fields to import_product_item Table
-- ============================================================================
-- Created: 2026-02-04
-- Description: Add boolean fields to track if product variant exists in
--              HEAD_OFFICE and current merchant before import
--
-- Run this script manually:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/006-import-item-branch-availability.sql
-- ============================================================================

-- Add columns to track product existence in HEAD_OFFICE and current merchant
ALTER TABLE import_product_item 
ADD COLUMN exists_in_head_office BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN exists_in_current_merchant BOOLEAN DEFAULT FALSE NOT NULL;

-- Add indexes for filtering by existence flags
CREATE INDEX IF NOT EXISTS idx_item_exists_head_office 
ON import_product_item(exists_in_head_office);

CREATE INDEX IF NOT EXISTS idx_item_exists_current_merchant 
ON import_product_item(exists_in_current_merchant);

-- Add composite index for common queries (batch + availability)
CREATE INDEX IF NOT EXISTS idx_item_branch_availability 
ON import_product_item(batch_id, exists_in_head_office, exists_in_current_merchant);

-- Add comments to document the columns
COMMENT ON COLUMN import_product_item.exists_in_head_office IS 'Indicates if the matched product variant exists in HEAD_OFFICE merchant_product';
COMMENT ON COLUMN import_product_item.exists_in_current_merchant IS 'Indicates if the matched product variant exists in the importing merchant merchant_product';

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name IN ('exists_in_head_office', 'exists_in_current_merchant')
  ) THEN
    RAISE NOTICE 'SUCCESS: Branch availability columns added successfully!';
  ELSE
    RAISE EXCEPTION 'ERROR: Columns were not created';
  END IF;
END $$;
