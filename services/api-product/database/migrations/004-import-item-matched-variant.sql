-- Migration: Change matched_product_id to matched_product_variant_id
-- Purpose: Store product variant ID directly from matching API (skip lookup)
-- This changes FK from product(id) to product_variant(id)

-- 1. Drop old FK constraint (references product.id)
ALTER TABLE import_product_item 
DROP CONSTRAINT IF EXISTS fk_item_matched_product;

-- 2. Rename column
ALTER TABLE import_product_item 
RENAME COLUMN matched_product_id TO matched_product_variant_id;

-- 3. Add new FK constraint (references product_variant.id)
ALTER TABLE import_product_item
ADD CONSTRAINT fk_item_matched_product_variant
  FOREIGN KEY (matched_product_variant_id)
  REFERENCES product_variant(id)
  ON DELETE SET NULL;

-- 4. Add index for the new FK column
CREATE INDEX IF NOT EXISTS idx_item_matched_variant 
ON import_product_item(matched_product_variant_id);
