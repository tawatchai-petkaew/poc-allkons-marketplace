-- ========================================
-- Rollback: Remove CDC Infrastructure
-- ========================================

-- Remove triggers
DROP TRIGGER IF EXISTS trg_product_variant_changes ON product_variant;
DROP TRIGGER IF EXISTS trg_product_changes ON product;
DROP TRIGGER IF EXISTS trg_product_category_changes ON product_category;
DROP TRIGGER IF EXISTS trg_merchant_product_changes ON merchant_product;

-- Remove function
DROP FUNCTION IF EXISTS fn_track_entity_changes;

-- Remove indexes (error tracking)
DROP INDEX IF EXISTS idx_changes_queue_error_count;
DROP INDEX IF EXISTS idx_changes_queue_skipped;

-- Remove table (includes all columns)
DROP TABLE IF EXISTS changes_queue;

-- ========================================
-- Done!
-- ========================================
