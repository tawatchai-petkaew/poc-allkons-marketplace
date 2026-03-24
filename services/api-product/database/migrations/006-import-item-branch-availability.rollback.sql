-- ============================================================================
-- Rollback: Remove Branch Availability Check Fields from import_product_item
-- ============================================================================
-- Created: 2026-02-04
-- Description: Rollback migration 006 - removes branch availability columns
--
-- Run this script manually to rollback:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/006-import-item-branch-availability.rollback.sql
-- ============================================================================

-- Drop the indexes first
DROP INDEX IF EXISTS idx_item_branch_availability;
DROP INDEX IF EXISTS idx_item_exists_current_merchant;
DROP INDEX IF EXISTS idx_item_exists_head_office;

-- Drop the columns
ALTER TABLE import_product_item 
DROP COLUMN IF EXISTS exists_in_current_merchant,
DROP COLUMN IF EXISTS exists_in_head_office;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name IN ('exists_in_head_office', 'exists_in_current_merchant')
  ) THEN
    RAISE NOTICE 'SUCCESS: Branch availability columns removed successfully!';
  ELSE
    RAISE EXCEPTION 'ERROR: Columns still exist';
  END IF;
END $$;
