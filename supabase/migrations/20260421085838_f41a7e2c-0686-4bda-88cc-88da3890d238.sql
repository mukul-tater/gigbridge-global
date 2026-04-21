-- Enforce one role per user at the DB level.
-- Drop the existing (user_id, role) unique constraint and add a unique on user_id alone.
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Remove any duplicate role rows (keep the earliest one per user) before adding the new constraint.
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.user_id = b.user_id
  AND a.created_at > b.created_at;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);