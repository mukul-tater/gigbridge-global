-- Add new admin emails to whitelist functions
CREATE OR REPLACE FUNCTION public.handle_admin_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF lower(NEW.email) IN (
    'admin@safeworkglobal.com',
    'ops@safeworkglobal.com',
    'admin@safeworkglobal.demo',
    'kailash@safeworkglobal.com',
    'mukul@safeworkglobal.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.ensure_whitelisted_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL OR v_email NOT IN (
    'admin@safeworkglobal.com',
    'ops@safeworkglobal.com',
    'admin@safeworkglobal.demo',
    'kailash@safeworkglobal.com',
    'mukul@safeworkglobal.com'
  ) THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  RETURN true;
END;
$function$;

-- Provision the two admin accounts directly
DO $$
DECLARE
  rec RECORD;
  v_uid uuid;
BEGIN
  FOR rec IN SELECT * FROM (VALUES
    ('kailash@safeworkglobal.com', 'Kailash@95492', 'Kailash'),
    ('mukul@safeworkglobal.com', 'Mukul@99500', 'Mukul')
  ) AS t(email, password, full_name)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = rec.email) THEN
      v_uid := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', v_uid,
        'authenticated','authenticated', rec.email,
        extensions.crypt(rec.password, extensions.gen_salt('bf')),
        now(), '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', rec.full_name, 'role', 'admin'),
        now(), now(), '','','',''
      );
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), v_uid,
        jsonb_build_object('sub', v_uid::text, 'email', rec.email),
        'email', v_uid::text, now(), now(), now());
    ELSE
      SELECT id INTO v_uid FROM auth.users WHERE email = rec.email;
      UPDATE auth.users
      SET encrypted_password = extensions.crypt(rec.password, extensions.gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = v_uid;
    END IF;

    INSERT INTO public.profiles (id, email, full_name)
    VALUES (v_uid, rec.email, rec.full_name)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END LOOP;
END $$;