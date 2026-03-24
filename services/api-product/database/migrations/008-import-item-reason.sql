-- ============================================================================
-- Migration: Add reason column to import_product_item
-- ============================================================================
-- Created: 2026-02-06
-- Description: Add reason column to store rejection reason or note when moving
--              SIMILAR to PENDING_ADMIN
--
-- Run this script manually:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/008-import-item-reason.sql
-- ============================================================================

-- 1. Add reason column
ALTER TABLE import_product_item
ADD COLUMN IF NOT EXISTS reason TEXT;

-- 2. Add comment
COMMENT ON COLUMN import_product_item.reason IS 'Reason for rejection or note when moving SIMILAR to PENDING_ADMIN';

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name = 'reason'
  ) THEN
    RAISE NOTICE 'SUCCESS: Migration completed - reason column added!';
  ELSE
    RAISE EXCEPTION 'ERROR: Migration did not complete correctly';
  END IF;
END $$;
