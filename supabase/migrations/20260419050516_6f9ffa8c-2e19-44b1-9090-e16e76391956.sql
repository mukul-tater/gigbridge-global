-- Update handle_new_user to ALWAYS create a profile, even when no role is in metadata
-- (e.g. Google OAuth signups where role hasn't been chosen yet).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name text;
  v_avatar_url text;
  v_phone text;
  v_role text;
BEGIN
  -- Resolve full_name from common metadata keys (Google uses 'name' / 'full_name')
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );

  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  v_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.phone
  );

  v_role := NEW.raw_user_meta_data->>'role';

  -- Always upsert a base profile so the app never sees an authenticated user
  -- without a profile row.
  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url)
  VALUES (NEW.id, NEW.email, v_full_name, v_phone, v_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  -- Only create role + role-specific profile if a role was provided in metadata.
  -- Google users (no role yet) will pick a role in the app, which then creates these.
  IF v_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    IF v_role = 'employer' THEN
      INSERT INTO public.employer_profiles (user_id) VALUES (NEW.id)
      ON CONFLICT DO NOTHING;
    ELSIF v_role = 'worker' THEN
      INSERT INTO public.worker_profiles (user_id) VALUES (NEW.id)
      ON CONFLICT DO NOTHING;
    ELSIF v_role = 'agent' THEN
      INSERT INTO public.agent_profiles (user_id) VALUES (NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Make sure the trigger exists on auth.users (it should already, but ensure idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: ensure every existing auth user has a profile row.
INSERT INTO public.profiles (id, email, full_name, phone, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'display_name',
    split_part(u.email, '@', 1)
  ),
  COALESCE(u.raw_user_meta_data->>'phone', u.phone),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
  AND u.email IS NOT NULL;