-- Enforce one wedding per user at the database level.
-- The unique constraint creates its own index, so drop the redundant one first.
DROP INDEX IF EXISTS idx_weddings_user_id;
ALTER TABLE public.weddings ADD CONSTRAINT unique_user_wedding UNIQUE (user_id);
