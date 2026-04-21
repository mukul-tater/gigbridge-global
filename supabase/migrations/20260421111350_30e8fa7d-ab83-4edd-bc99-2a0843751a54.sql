-- Deduplicate any existing rows before adding unique constraints (safety).
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id
  AND a.role = b.role;

DELETE FROM public.employer_profiles a
USING public.employer_profiles b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id;

DELETE FROM public.worker_profiles a
USING public.worker_profiles b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id;

DELETE FROM public.agent_profiles a
USING public.agent_profiles b
WHERE a.ctid < b.ctid
  AND a.user_id = b.user_id;

-- Add the missing unique constraints required by ON CONFLICT clauses
-- in the handle_new_user / assign_initial_role functions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'employer_profiles_user_id_key'
  ) THEN
    ALTER TABLE public.employer_profiles
      ADD CONSTRAINT employer_profiles_user_id_key UNIQUE (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'worker_profiles_user_id_key'
  ) THEN
    ALTER TABLE public.worker_profiles
      ADD CONSTRAINT worker_profiles_user_id_key UNIQUE (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'agent_profiles_user_id_key'
  ) THEN
    ALTER TABLE public.agent_profiles
      ADD CONSTRAINT agent_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;