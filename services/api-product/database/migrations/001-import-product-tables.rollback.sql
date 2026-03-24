-- ============================================================================
-- Import Product and Matching Tables - ROLLBACK
-- ============================================================================
-- Created: 2026-01-21
-- Description: Rollback script for import product tables
--
-- Run this script to undo the migration:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/001-import-product-tables.rollback.sql
-- ============================================================================

-- WARNING: This will delete all import product data!
-- Make sure you have a backup before running this script.

-- Drop tables (CASCADE will drop foreign key constraints automatically)
DROP TABLE IF EXISTS import_product_item CASCADE;
DROP TABLE IF EXISTS import_product_batch CASCADE;

-- Note: We don't drop extensions as they might be used by other tables
-- If you really need to drop them, uncomment the lines below:
-- DROP EXTENSION IF EXISTS "pg_trgm";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- Verify tables were dropped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('import_product_batch', 'import_product_item')
  ) THEN
    RAISE NOTICE 'SUCCESS: Product import tables dropped successfully!';
  ELSE
    RAISE EXCEPTION 'ERROR: Tables were not dropped';
  END IF;
END $$;
