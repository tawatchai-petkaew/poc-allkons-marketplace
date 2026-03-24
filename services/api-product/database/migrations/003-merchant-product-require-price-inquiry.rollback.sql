-- Rollback: Remove requirePriceInquiry column from merchant_product

ALTER TABLE merchant_product 
DROP COLUMN IF EXISTS "requirePriceInquiry";
