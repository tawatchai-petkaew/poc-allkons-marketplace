-- Rollback Migration: 009-add-matched-variant-and-search-index
-- Purpose: Remove all indexes added in migration 009
-- This includes: matched variant indexes + search indexes

-- ============================================================
-- ITEM TABLE - Remove all indexes
-- ============================================================

-- Drop composite indexes first (dependent on columns)
DROP INDEX IF EXISTS idx_item_batch_barcode;
DROP INDEX IF EXISTS idx_item_batch_matched_variant;

-- Drop GIN trigram indexes
DROP INDEX IF EXISTS idx_item_brand_trgm;
DROP INDEX IF EXISTS idx_item_product_name_trgm;

-- Drop B-tree indexes
DROP INDEX IF EXISTS idx_item_barcode;
DROP INDEX IF EXISTS idx_item_matched_variant;

-- ============================================================
-- BATCH TABLE - Remove indexes
-- ============================================================

-- Drop stored filename GIN trigram index
DROP INDEX IF EXISTS idx_batch_stored_filename_trgm;

-- ============================================================
-- Extension cleanup (optional - only if no other indexes use it)
-- ============================================================

-- WARNING: Only drop pg_trgm if no other features depend on it
-- Uncomment the line below ONLY if you're sure nothing else uses trigram indexes
-- DROP EXTENSION IF EXISTS pg_trgm;

-- Note: Comments are automatically removed when indexes are dropped
