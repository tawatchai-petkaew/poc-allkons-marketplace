-- Rollback: Remove unique constraint on merchant_product

DROP INDEX IF EXISTS uq_merchant_product_variant;
