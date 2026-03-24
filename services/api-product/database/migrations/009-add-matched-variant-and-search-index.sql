-- Migration: Add indexes for matchedProductVariantId
-- Purpose: Optimize queries filtering by matched product variant
-- Related PR: Fix performance issues in auto-import flow

-- Single index for direct lookups
-- Used in queries that filter by matched_product_variant_id
CREATE INDEX IF NOT EXISTS idx_item_matched_variant
ON import_product_item(matched_product_variant_id)
WHERE matched_product_variant_id IS NOT NULL;

-- Composite index for batch + variant queries (common pattern)
-- Used in auto-import flow to find items for a specific batch
CREATE INDEX IF NOT EXISTS idx_item_batch_matched_variant
ON import_product_item(batch_id, matched_product_variant_id)
WHERE matched_product_variant_id IS NOT NULL;

-- Add comments for data dictionary documentation
COMMENT ON INDEX idx_item_matched_variant IS
'Index for filtering items by matched product variant ID. Used in auto-import queries.';

COMMENT ON INDEX idx_item_batch_matched_variant IS
'Composite index for batch + matched variant queries. Optimizes auto-import flow that filters by both batch_id and matched_product_variant_id.';

-- Migration: Add indexes for search functionality
-- Purpose: Optimize ILIKE searches on import_product_item and import_product_batch

-- Enable pg_trgm extension for trigram matching (required for GIN indexes on text)
-- This extension enables efficient partial text search with ILIKE
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- BATCH TABLE INDEXES (import_product_batch)
-- ============================================================

-- Stored filename GIN trigram index (for batch search by filename)
-- Used in listBatches() search functionality
CREATE INDEX IF NOT EXISTS idx_batch_stored_filename_trgm
ON import_product_batch USING GIN (stored_filename gin_trgm_ops);

-- ============================================================
-- ITEM TABLE INDEXES (import_product_item)
-- ============================================================

-- Barcode index (B-tree for exact and prefix matching)
-- Barcodes are often searched exactly, so a standard B-tree index is optimal
CREATE INDEX IF NOT EXISTS idx_item_barcode
ON import_product_item(barcode)
WHERE barcode IS NOT NULL;

-- Product name GIN trigram index (for ILIKE '%pattern%' searches)
-- GIN + pg_trgm enables efficient partial matching for text searches
CREATE INDEX IF NOT EXISTS idx_item_product_name_trgm
ON import_product_item USING GIN (product_name gin_trgm_ops)
WHERE product_name IS NOT NULL;

-- Brand GIN trigram index (for ILIKE '%pattern%' searches)
CREATE INDEX IF NOT EXISTS idx_item_brand_trgm
ON import_product_item USING GIN (brand gin_trgm_ops)
WHERE brand IS NOT NULL;

-- Composite index for batch + search optimization
-- Helps when filtering by batch AND searching (common query pattern)
CREATE INDEX IF NOT EXISTS idx_item_batch_barcode
ON import_product_item(batch_id, barcode)
WHERE barcode IS NOT NULL;

-- Add comments for documentation
COMMENT ON INDEX idx_batch_stored_filename_trgm IS
'GIN trigram index for stored_filename ILIKE searches in batch list';

COMMENT ON INDEX idx_item_barcode IS
'B-tree index for barcode exact and prefix matching';

COMMENT ON INDEX idx_item_product_name_trgm IS
'GIN trigram index for product_name ILIKE searches (partial matching)';

COMMENT ON INDEX idx_item_brand_trgm IS
'GIN trigram index for brand ILIKE searches (partial matching)';

COMMENT ON INDEX idx_item_batch_barcode IS
'Composite index for batch + barcode filtering (common query pattern)';
