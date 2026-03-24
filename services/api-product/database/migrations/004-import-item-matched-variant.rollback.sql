-- Rollback: Revert matched_product_variant_id back to matched_product_id
-- This restores FK from product_variant(id) back to product(id)

-- 1. Drop new FK constraint (references product_variant.id)
ALTER TABLE import_product_item 
DROP CONSTRAINT IF EXISTS fk_item_matched_product_variant;

-- 2. Drop new index
DROP INDEX IF EXISTS idx_item_matched_variant;

-- 3. Rename column back
ALTER TABLE import_product_item 
RENAME COLUMN matched_product_variant_id TO matched_product_id;

-- 4. Add old FK constraint (references product.id)
ALTER TABLE import_product_item
ADD CONSTRAINT fk_item_matched_product
  FOREIGN KEY (matched_product_id)
  REFERENCES product(id)
  ON DELETE SET NULL;
