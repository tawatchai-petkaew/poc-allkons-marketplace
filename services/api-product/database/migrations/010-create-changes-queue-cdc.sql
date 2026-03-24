-- ========================================
-- Migration: Create CDC (Change Data Capture) Infrastructure
-- ========================================
-- This migration creates:
-- 1. changes_queue table - stores all tracked changes
-- 2. Trigger function - captures INSERT/UPDATE/DELETE events
-- 3. Triggers on tracked tables:
--    - product_variant
--    - product
--    - product_category
--    - merchant_product
-- 4. Error tracking fields (error_count, last_error, skipped)
--
-- 🔧 FIX OLD PROBLEM:
-- - OLD: Application-level interceptors could miss events
-- - NEW: Database triggers guarantee capture of ALL changes
-- ========================================

-- ========================================
-- 1. Create changes_queue table
-- ========================================
CREATE TABLE IF NOT EXISTS changes_queue (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    operation VARCHAR(10) NOT NULL,
    changed_at TIMESTAMP DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP NULL,
    -- Error tracking fields
    error_count INTEGER DEFAULT 0,
    last_error TEXT NULL,
    skipped BOOLEAN DEFAULT FALSE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_changes_queue_processed 
ON changes_queue(processed, changed_at);

CREATE INDEX IF NOT EXISTS idx_changes_queue_entity 
ON changes_queue(entity_type, entity_id);

-- Index for finding skipped records
CREATE INDEX IF NOT EXISTS idx_changes_queue_skipped 
ON changes_queue(skipped) WHERE skipped = TRUE;

-- Index for finding records with errors
CREATE INDEX IF NOT EXISTS idx_changes_queue_error_count 
ON changes_queue(error_count) WHERE error_count > 0;

-- ========================================
-- 2. Create generic trigger function
-- ========================================
CREATE OR REPLACE FUNCTION fn_track_entity_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_entity_type VARCHAR(50);
    v_entity_id INTEGER;
BEGIN
    -- Get table name as entity type (convert to snake_case if needed)
    v_entity_type := TG_TABLE_NAME;
    
    -- Get entity ID based on operation
    IF TG_OP = 'DELETE' THEN
        v_entity_id := OLD.id;
    ELSE
        v_entity_id := NEW.id;
    END IF;
    
    -- Insert change record
    INSERT INTO changes_queue (entity_type, entity_id, operation)
    VALUES (v_entity_type, v_entity_id, TG_OP);
    
    -- Return appropriate value
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. Create triggers on tracked tables
-- ========================================

-- Trigger for product_variant
DROP TRIGGER IF EXISTS trg_product_variant_changes ON product_variant;
CREATE TRIGGER trg_product_variant_changes
AFTER INSERT OR UPDATE OR DELETE ON product_variant
FOR EACH ROW EXECUTE FUNCTION fn_track_entity_changes();

-- Trigger for product
DROP TRIGGER IF EXISTS trg_product_changes ON product;
CREATE TRIGGER trg_product_changes
AFTER INSERT OR UPDATE OR DELETE ON product
FOR EACH ROW EXECUTE FUNCTION fn_track_entity_changes();

-- Trigger for product_category
DROP TRIGGER IF EXISTS trg_product_category_changes ON product_category;
CREATE TRIGGER trg_product_category_changes
AFTER INSERT OR UPDATE OR DELETE ON product_category
FOR EACH ROW EXECUTE FUNCTION fn_track_entity_changes();

-- Trigger for merchant_product
DROP TRIGGER IF EXISTS trg_merchant_product_changes ON merchant_product;
CREATE TRIGGER trg_merchant_product_changes
AFTER INSERT OR UPDATE OR DELETE ON merchant_product
FOR EACH ROW EXECUTE FUNCTION fn_track_entity_changes();

-- ========================================
-- Done!
-- ========================================
