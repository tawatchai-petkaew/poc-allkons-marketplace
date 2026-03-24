-- ============================================================================
-- Rollback: Remove reason column from import_product_item
-- ============================================================================
-- Created: 2026-02-06
-- Description: Rollback migration 008 - remove reason column
--
-- Run this script manually to rollback:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/008-import-item-reason.rollback.sql
-- ============================================================================

-- 1. Drop reason column
ALTER TABLE import_product_item
DROP COLUMN IF EXISTS reason;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'import_product_item'
    AND column_name = 'reason'
  ) THEN
    RAISE NOTICE 'SUCCESS: Rollback completed - reason column removed!';
  ELSE
    RAISE EXCEPTION 'ERROR: Rollback did not complete correctly';
  END IF;
END $$;
