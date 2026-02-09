-- Split hair_makeup into separate categories
-- Run this in Supabase SQL Editor

-- Add new enum values for hair and makeup
ALTER TYPE vendor_category ADD VALUE 'hair_stylist';
ALTER TYPE vendor_category ADD VALUE 'makeup_artist';

-- Note: Existing vendors with 'hair_makeup' will stay as 'hair_makeup'
-- which represents vendors who do both. New vendors can choose:
-- - hair_stylist (hair only)
-- - makeup_artist (makeup only)
-- - hair_makeup (both)
