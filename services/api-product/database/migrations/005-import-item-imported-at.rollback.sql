-- ============================================================================
-- Rollback: Remove imported_at Column from import_product_item Table
-- ============================================================================
-- Created: 2026-02-04
-- Description: Rollback migration 005 - removes imported_at column
--
-- Run this script manually to rollback:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/005-import-item-imported-at.rollback.sql
-- ============================================================================

-- Drop the index first
DROP INDEX IF EXISTS idx_item_imported_at;

-- Drop the imported_at column
ALTER TABLE import_product_item 
DROP COLUMN IF EXISTS imported_at;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name = 'imported_at'
  ) THEN
    RAISE NOTICE 'SUCCESS: imported_at column removed successfully!';
  ELSE
    RAISE EXCEPTION 'ERROR: Column still exists';
  END IF;
END $$;
