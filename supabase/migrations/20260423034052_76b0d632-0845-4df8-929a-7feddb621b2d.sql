CREATE OR REPLACE FUNCTION public.seed_demo_users(p_users jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec jsonb;
  v_uid uuid;
  v_count integer := 0;
  v_role text;
BEGIN
  FOR rec IN SELECT * FROM jsonb_array_elements(p_users)
  LOOP
    v_role := rec->>'role';

    -- Create auth.users entry if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = rec->>'email') THEN
      v_uid := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_uid,
        'authenticated','authenticated',
        rec->>'email',
        crypt(rec->>'password', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', rec->>'full_name', 'role', v_role),
        now(), now(),
        '','','',''
      );
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), v_uid,
        jsonb_build_object('sub', v_uid::text, 'email', rec->>'email'),
        'email', v_uid::text, now(), now(), now());
      v_count := v_count + 1;
    ELSE
      SELECT id INTO v_uid FROM auth.users WHERE email = rec->>'email';
    END IF;

    -- Role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_uid, v_role::app_role)
    ON CONFLICT DO NOTHING;

    -- Profile (handle_new_user trigger normally creates this)
    INSERT INTO public.profiles (id, email, full_name, phone, mobile_verified)
    VALUES (v_uid, rec->>'email', rec->>'full_name', rec->>'phone', true)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      mobile_verified = true;

    IF v_role = 'worker' THEN
      INSERT INTO public.worker_profiles (
        user_id, bio, nationality, current_city, current_location, country,
        primary_work_type, years_of_experience, skill_level,
        expected_salary_min, expected_salary_max, currency,
        availability, has_passport, has_visa, visa_countries,
        languages, ecr_status, open_to_relocation, preferred_shift
      ) VALUES (
        v_uid,
        rec->>'bio',
        'Indian',
        rec->>'city',
        (rec->>'city') || ', ' || (rec->>'state'),
        'India',
        rec->>'role_title',
        (rec->>'experience')::int,
        rec->>'skill_level',
        (rec->>'salary_min')::numeric,
        (rec->>'salary_max')::numeric,
        'INR',
        rec->>'availability',
        (rec->>'has_passport')::boolean,
        (rec->>'has_visa')::boolean,
        ARRAY[rec->>'country_pref']::text[],
        ARRAY['Hindi','English']::text[],
        CASE WHEN (rec->>'has_passport')::boolean THEN 'ECR' ELSE 'not_checked' END,
        true,
        'Day'
      ) ON CONFLICT (user_id) DO UPDATE SET
        bio = EXCLUDED.bio,
        nationality = 'Indian',
        current_city = EXCLUDED.current_city,
        current_location = EXCLUDED.current_location,
        country = 'India',
        primary_work_type = EXCLUDED.primary_work_type,
        years_of_experience = EXCLUDED.years_of_experience,
        skill_level = EXCLUDED.skill_level,
        expected_salary_min = EXCLUDED.expected_salary_min,
        expected_salary_max = EXCLUDED.expected_salary_max,
        currency = 'INR',
        availability = EXCLUDED.availability,
        has_passport = EXCLUDED.has_passport,
        has_visa = EXCLUDED.has_visa,
        visa_countries = EXCLUDED.visa_countries,
        languages = EXCLUDED.languages,
        ecr_status = EXCLUDED.ecr_status,
        open_to_relocation = true;

      INSERT INTO public.worker_skills (worker_id, skill_name, proficiency_level, years_of_experience)
      VALUES (v_uid, rec->>'role_title', rec->>'skill_level', (rec->>'experience')::int)
      ON CONFLICT DO NOTHING;

    ELSIF v_role = 'employer' THEN
      INSERT INTO public.employer_profiles (
        user_id, company_name, industry, business_type, company_size,
        country, office_state, office_address, website, bio,
        preferred_countries, workers_required, hiring_roles,
        onboarding_completed, follows_safety_standards, provides_ppe, site_safety_level
      ) VALUES (
        v_uid,
        rec->>'company_name',
        rec->>'industry',
        rec->>'business_type',
        rec->>'company_size',
        'India',
        rec->>'state',
        (rec->>'city') || ', ' || (rec->>'state'),
        rec->>'website',
        rec->>'bio',
        ARRAY(SELECT jsonb_array_elements_text(rec->'preferred_countries')),
        (rec->>'workers_required')::int,
        ARRAY(SELECT jsonb_array_elements_text(rec->'hiring_roles')),
        true, true, 'Yes', 'High'
      ) ON CONFLICT (user_id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        industry = EXCLUDED.industry,
        business_type = EXCLUDED.business_type,
        company_size = EXCLUDED.company_size,
        country = 'India',
        office_state = EXCLUDED.office_state,
        office_address = EXCLUDED.office_address,
        website = EXCLUDED.website,
        bio = EXCLUDED.bio,
        preferred_countries = EXCLUDED.preferred_countries,
        workers_required = EXCLUDED.workers_required,
        hiring_roles = EXCLUDED.hiring_roles,
        onboarding_completed = true;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Restrict execution: this is a privileged seeding helper
REVOKE ALL ON FUNCTION public.seed_demo_users(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_demo_users(jsonb) FROM anon, authenticated;