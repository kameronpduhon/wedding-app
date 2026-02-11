-- Add premium upgrade fields to weddings table
ALTER TABLE weddings
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT,
ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ;

-- Create index for premium status lookups
CREATE INDEX IF NOT EXISTS idx_weddings_is_premium ON weddings(is_premium);
