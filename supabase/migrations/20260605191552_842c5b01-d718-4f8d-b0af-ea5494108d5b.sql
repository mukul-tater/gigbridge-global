
-- Partner status enum
DO $$ BEGIN
  CREATE TYPE public.partner_status AS ENUM ('applied','under_review','approved','active','suspended','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Rename agent_profiles -> partner_profiles
ALTER TABLE IF EXISTS public.agent_profiles RENAME TO partner_profiles;
ALTER TABLE IF EXISTS public.partner_profiles RENAME CONSTRAINT agent_profiles_pkey TO partner_profiles_pkey;
ALTER TABLE IF EXISTS public.partner_profiles RENAME CONSTRAINT agent_profiles_user_id_key TO partner_profiles_user_id_key;

DROP TRIGGER IF EXISTS update_agent_profiles_updated_at ON public.partner_profiles;
CREATE TRIGGER update_partner_profiles_updated_at
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Admins can view all agent profiles" ON public.partner_profiles;
DROP POLICY IF EXISTS "Agents can create their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Agents can update their own profile" ON public.partner_profiles;
DROP POLICY IF EXISTS "Agents can view their own profile" ON public.partner_profiles;

ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS center_name text,
  ADD COLUMN IF NOT EXISTS owner_name text,
  ADD COLUMN IF NOT EXISTS mobile text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS aadhaar_front_url text,
  ADD COLUMN IF NOT EXISTS aadhaar_back_url text,
  ADD COLUMN IF NOT EXISTS pan_card_url text,
  ADD COLUMN IF NOT EXISTS shop_photo_url text,
  ADD COLUMN IF NOT EXISTS years_in_operation integer,
  ADD COLUMN IF NOT EXISTS services_offered text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS monthly_footfall integer,
  ADD COLUMN IF NOT EXISTS offers_passport_service boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_doc_scanning boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_worker_registration boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_holder text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS ifsc text,
  ADD COLUMN IF NOT EXISTS upi_id text,
  ADD COLUMN IF NOT EXISTS accepted_terms boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepted_privacy boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmed_accuracy boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS status public.partner_status NOT NULL DEFAULT 'applied',
  ADD COLUMN IF NOT EXISTS current_step integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE INDEX IF NOT EXISTS partner_profiles_status_idx ON public.partner_profiles(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_profiles TO authenticated;
GRANT ALL ON public.partner_profiles TO service_role;

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can view own profile"
  ON public.partner_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Partners can insert own profile"
  ON public.partner_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update own profile pre-approval"
  ON public.partner_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('applied','under_review'))
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any partner profile"
  ON public.partner_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing 'agent' role assignments to 'partner'
UPDATE public.user_roles SET role = 'partner' WHERE role = 'agent';

-- Update auth helpers
CREATE OR REPLACE FUNCTION public.assign_initial_role(_role app_role)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _role = 'admin'::app_role THEN RAISE EXCEPTION 'Cannot self-assign admin role'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid) THEN
    RAISE EXCEPTION 'Role already assigned';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, _role);
  IF _role = 'worker'::app_role THEN
    INSERT INTO public.worker_profiles (user_id) VALUES (v_uid) ON CONFLICT DO NOTHING;
  ELSIF _role = 'employer'::app_role THEN
    INSERT INTO public.employer_profiles (user_id) VALUES (v_uid) ON CONFLICT DO NOTHING;
  ELSIF _role = 'partner'::app_role THEN
    INSERT INTO public.partner_profiles (user_id) VALUES (v_uid) ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name text; v_avatar_url text; v_phone text; v_role text;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
  v_avatar_url := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture');
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone);
  v_role := NEW.raw_user_meta_data->>'role';

  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url)
  VALUES (NEW.id, NEW.email, v_full_name, v_phone, v_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  IF v_role IS NOT NULL AND v_role IN ('worker','employer','partner') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    IF v_role = 'employer' THEN
      INSERT INTO public.employer_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSIF v_role = 'worker' THEN
      INSERT INTO public.worker_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSIF v_role = 'partner' THEN
      INSERT INTO public.partner_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- admin_actions audit table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  action text NOT NULL,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_actions TO authenticated;
GRANT ALL ON public.admin_actions TO service_role;

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin actions"
  ON public.admin_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert admin actions"
  ON public.admin_actions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS admin_actions_target_idx ON public.admin_actions(target_type, target_id);
