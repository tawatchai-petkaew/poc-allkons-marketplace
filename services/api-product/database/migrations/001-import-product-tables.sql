-- ============================================================================
-- Import Product and Matching Tables Migration
-- ============================================================================
-- Created: 2026-01-21
-- Updated: 2026-01-23 - Renamed tables to match module naming convention
-- Description: Tables for import product batch tracking and matching system
--
-- Run this script manually:
--   psql -h localhost -U postgres -d shopdit_db -f database/migrations/001-import-product-tables.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable Required Extensions
-- ----------------------------------------------------------------------------

-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm extension for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 2. Create import_product_batch Table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS import_product_batch (
  -- Primary key
  id BIGSERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,

  -- Relationships
  merchant_id BIGINT NOT NULL,

  -- File information
  original_filename VARCHAR(500) NOT NULL,
  stored_filename VARCHAR(500) NOT NULL,  -- Format: {original}_YYMMDDHHMMSS.xlsx
  s3_original_key VARCHAR(1000) NOT NULL,
  s3_result_key VARCHAR(1000) NOT NULL,
  s3_validation_key VARCHAR(1000) NOT NULL,  -- Validation JSON for matching step

  -- Import statistics
  total_rows INT NOT NULL DEFAULT 0,

  -- Validation statistics (from extract-excel step)
  validation_pass_count INT NOT NULL DEFAULT 0,   -- จำนวนแถวที่ผ่าน validation
  validation_fail_count INT NOT NULL DEFAULT 0,   -- จำนวนแถวที่ไม่ผ่าน validation

  -- Matching statistics (from matching step)
  matched_count INT NOT NULL DEFAULT 0,      -- พบสินค้า (FOUND)
  similar_count INT NOT NULL DEFAULT 0,      -- ใกล้เคียง (SIMILAR)
  not_found_count INT NOT NULL DEFAULT 0,    -- ไม่พบสินค้า (NOT_FOUND)

  -- Status tracking
  -- Values: VALIDATED | MATCHING | PENDING_REVIEW | COMPLETED | CANCELLED
  status VARCHAR(50) NOT NULL DEFAULT 'VALIDATED',

  -- Audit fields
  created_by BIGINT,
  updated_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_batch_merchant
    FOREIGN KEY (merchant_id)
    REFERENCES merchant(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_batch_created_by
    FOREIGN KEY (created_by)
    REFERENCES "user"(id)
    ON DELETE SET NULL
);

-- Create indexes for import_product_batch
CREATE INDEX IF NOT EXISTS idx_batch_merchant ON import_product_batch(merchant_id);
CREATE INDEX IF NOT EXISTS idx_batch_status ON import_product_batch(status);
CREATE INDEX IF NOT EXISTS idx_batch_created ON import_product_batch(created_at);
CREATE INDEX IF NOT EXISTS idx_batch_merchant_status ON import_product_batch(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_batch_merchant_created ON import_product_batch(merchant_id, created_at);

-- ----------------------------------------------------------------------------
-- 3. Create import_product_item Table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS import_product_item (
  -- Primary key
  id BIGSERIAL PRIMARY KEY,

  -- Relationships
  batch_id BIGINT NOT NULL,
  row_no INT NOT NULL,

  -- Imported product data (from Excel)
  product_name VARCHAR(500),  -- Allow NULL for cases where only barcode/brand is provided
  barcode VARCHAR(100),
  brand VARCHAR(200),

  -- Pricing information
  price_type VARCHAR(10),                    -- EXVAT | INVAT
  regular_price DECIMAL(13,2),
  special_price DECIMAL(13,2),
  vat_percent DECIMAL(3,1),                  -- 0.0 | 7.0
  special_price_start_date TIMESTAMP,
  special_price_end_date TIMESTAMP,

  -- Product settings
  require_price_inquiry BOOLEAN NOT NULL DEFAULT FALSE,  -- askBeforeBuy
  sale_status VARCHAR(50),                   -- SELLING | HIDDEN

  -- Matching result
  match_status VARCHAR(50) NOT NULL,         -- FOUND | SIMILAR | NOT_FOUND
  matched_product_id BIGINT,
  suggested_products JSONB,                  -- Array of suggested products with score

  -- Import status
  import_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',  -- PENDING | PENDING_ADMIN | IMPORTING | COMPLETED | FAILED | REJECTED

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_item_batch
    FOREIGN KEY (batch_id)
    REFERENCES import_product_batch(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_item_matched_product
    FOREIGN KEY (matched_product_id)
    REFERENCES product(id)
    ON DELETE SET NULL
);

-- Create indexes for import_product_item
CREATE INDEX IF NOT EXISTS idx_item_batch ON import_product_item(batch_id);
CREATE INDEX IF NOT EXISTS idx_item_match_status ON import_product_item(match_status);
CREATE INDEX IF NOT EXISTS idx_item_import_status ON import_product_item(import_status);
CREATE INDEX IF NOT EXISTS idx_item_batch_status ON import_product_item(batch_id, import_status);
CREATE INDEX IF NOT EXISTS idx_item_batch_match ON import_product_item(batch_id, match_status);

-- ----------------------------------------------------------------------------
-- Migration Complete
-- ----------------------------------------------------------------------------

-- Verify tables were created
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('import_product_batch', 'import_product_item')
  ) THEN
    RAISE NOTICE 'SUCCESS: Import product tables created successfully!';
  ELSE
    RAISE EXCEPTION 'ERROR: Tables were not created';
  END IF;
END $$;
