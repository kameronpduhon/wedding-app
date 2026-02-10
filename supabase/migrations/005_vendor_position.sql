-- Add position column to vendors for drag-and-drop reordering
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS position INTEGER;

-- Set initial positions based on creation date
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY wedding_id ORDER BY created_at) as rn
  FROM vendors
)
UPDATE vendors 
SET position = ranked.rn
FROM ranked
WHERE vendors.id = ranked.id;

-- Make position NOT NULL with default
ALTER TABLE vendors ALTER COLUMN position SET DEFAULT 0;
