-- Migration: Add requirePriceInquiry column to merchant_product
-- Purpose: Support require_price_inquiry field from Excel import

ALTER TABLE merchant_product 
ADD COLUMN IF NOT EXISTS "requirePriceInquiry" BOOLEAN DEFAULT false;
