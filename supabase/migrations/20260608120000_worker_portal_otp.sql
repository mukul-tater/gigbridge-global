-- Worker portal OTP + accounts (Supabase RPC when Node API is unavailable)

CREATE TABLE IF NOT EXISTS public.worker_portal_otp (
  mobile_number text PRIMARY KEY,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.worker_portal_tokens (
  token text PRIMARY KEY,
  mobile_number text NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS public.worker_portal_users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  worker_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  mobile_number text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  profile_completion_percentage integer NOT NULL DEFAULT 10,
  status text NOT NULL DEFAULT 'PROFILE_INCOMPLETE',
  mobile_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.worker_portal_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_portal_users ENABLE ROW LEVEL SECURITY;

-- No public table policies — RPC functions use SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.worker_portal_send_otp(p_mobile text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mobile text;
  v_code text;
  v_expires timestamptz;
BEGIN
  v_mobile := regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g');

  IF v_mobile !~ '^[6-9]\d{9}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('mobileNumber', jsonb_build_array('Invalid mobile number'))
    );
  END IF;

  v_code := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
  v_expires := now() + interval '10 minutes';

  INSERT INTO public.worker_portal_otp (mobile_number, otp_code, expires_at)
  VALUES (v_mobile, v_code, v_expires)
  ON CONFLICT (mobile_number) DO UPDATE
    SET otp_code = EXCLUDED.otp_code,
        expires_at = EXCLUDED.expires_at;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'demo', true,
      'message', 'OTP sent (dev mode — enter any 6 digits)'
    ),
    'message', 'OTP sent'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.worker_portal_verify_otp(p_mobile text, p_otp text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mobile text;
  v_otp text;
  v_record public.worker_portal_otp%ROWTYPE;
  v_token text;
  v_expires timestamptz;
BEGIN
  v_mobile := regexp_replace(coalesce(p_mobile, ''), '\D', '', 'g');
  v_otp := regexp_replace(coalesce(p_otp, ''), '\D', '', 'g');

  IF v_mobile !~ '^[6-9]\d{9}$' OR length(v_otp) <> 6 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('otp', jsonb_build_array('Invalid OTP'))
    );
  END IF;

  SELECT * INTO v_record
  FROM public.worker_portal_otp
  WHERE mobile_number = v_mobile;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('otp', jsonb_build_array('OTP expired or not requested'))
    );
  END IF;

  IF v_record.expires_at < now() THEN
    DELETE FROM public.worker_portal_otp WHERE mobile_number = v_mobile;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('otp', jsonb_build_array('OTP expired'))
    );
  END IF;

  -- Mock mode: any valid 6-digit OTP is accepted after send

  DELETE FROM public.worker_portal_otp WHERE mobile_number = v_mobile;

  v_token := encode(gen_random_bytes(24), 'hex');
  v_expires := now() + interval '15 minutes';

  INSERT INTO public.worker_portal_tokens (token, mobile_number, expires_at)
  VALUES (v_token, v_mobile, v_expires);

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'otpToken', v_token,
      'expiresInSeconds', 900
    ),
    'message', 'Mobile number verified'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.worker_portal_register(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_mobile text;
  v_password text;
  v_confirm text;
  v_otp_token text;
  v_token_row public.worker_portal_tokens%ROWTYPE;
  v_user_count bigint;
  v_worker_code text;
  v_full_name text;
  v_user public.worker_portal_users%ROWTYPE;
  v_session_token text;
BEGIN
  v_email := lower(trim(coalesce(p_payload->>'email', '')));
  v_mobile := regexp_replace(coalesce(p_payload->>'mobileNumber', ''), '\D', '', 'g');
  v_password := coalesce(p_payload->>'password', '');
  v_confirm := coalesce(p_payload->>'confirmPassword', '');
  v_otp_token := coalesce(p_payload->>'otpToken', '');

  IF v_otp_token = '' OR v_mobile !~ '^[6-9]\d{9}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('mobileNumber', jsonb_build_array('Verification required'))
    );
  END IF;

  SELECT * INTO v_token_row
  FROM public.worker_portal_tokens
  WHERE token = v_otp_token AND mobile_number = v_mobile;

  IF NOT FOUND OR v_token_row.expires_at < now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('mobileNumber', jsonb_build_array('Mobile verification expired'))
    );
  END IF;

  IF v_password <> v_confirm THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('confirmPassword', jsonb_build_array('Passwords do not match'))
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.worker_portal_users
    WHERE mobile_number = v_mobile OR email = v_email
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Conflict',
      'errors', jsonb_build_object('mobileNumber', jsonb_build_array('Already registered'))
    );
  END IF;

  SELECT count(*) INTO v_user_count FROM public.worker_portal_users;
  v_worker_code := 'WRK-' || lpad((v_user_count + 1)::text, 6, '0');
  v_full_name := coalesce(
    nullif(regexp_replace(split_part(v_email, '@', 1), '[._-]+', ' ', 'g'), ''),
    'Worker ' || right(v_mobile, 4)
  );

  INSERT INTO public.worker_portal_users (
    worker_code,
    full_name,
    email,
    mobile_number,
    password_hash,
    mobile_verified
  )
  VALUES (
    v_worker_code,
    v_full_name,
    v_email,
    v_mobile,
    extensions.crypt(v_password, extensions.gen_salt('bf')),
    true
  )
  RETURNING * INTO v_user;

  DELETE FROM public.worker_portal_tokens WHERE token = v_otp_token;

  v_session_token := encode(gen_random_bytes(24), 'hex');

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'token', v_session_token,
      'worker', jsonb_build_object(
        'id', v_user.id,
        'workerCode', v_user.worker_code,
        'fullName', v_user.full_name,
        'email', v_user.email,
        'mobileNumber', v_user.mobile_number,
        'aadhaarNumber', 'PENDING',
        'stateId', 0,
        'stateName', '',
        'districtId', 0,
        'districtName', '',
        'primarySkillId', 0,
        'primarySkillName', '',
        'experienceLevel', 'FRESHER',
        'profileCompletionPercentage', v_user.profile_completion_percentage,
        'registrationSource', 'WEB',
        'status', v_user.status,
        'onboardingCompleted', false,
        'createdDate', v_user.created_at,
        'updatedDate', v_user.updated_at
      )
    ),
    'message', 'Registration successful'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.worker_portal_profile_json(p_user public.worker_portal_users)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'id', p_user.id,
    'workerCode', p_user.worker_code,
    'fullName', p_user.full_name,
    'email', p_user.email,
    'mobileNumber', p_user.mobile_number,
    'aadhaarNumber', 'PENDING',
    'stateId', 0,
    'stateName', '',
    'districtId', 0,
    'districtName', '',
    'primarySkillId', 0,
    'primarySkillName', '',
    'experienceLevel', 'FRESHER',
    'profileCompletionPercentage', p_user.profile_completion_percentage,
    'registrationSource', 'WEB',
    'status', p_user.status,
    'onboardingCompleted', false,
    'createdDate', p_user.created_at,
    'updatedDate', p_user.updated_at
  );
$$;

CREATE OR REPLACE FUNCTION public.worker_portal_google_auth(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_full_name text;
  v_user public.worker_portal_users%ROWTYPE;
  v_session_token text;
BEGIN
  v_email := lower(trim(coalesce(p_payload->>'email', '')));
  v_full_name := trim(coalesce(p_payload->>'fullName', ''));

  IF v_email = '' OR position('@' in v_email) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('email', jsonb_build_array('Valid email is required'))
    );
  END IF;

  SELECT * INTO v_user
  FROM public.worker_portal_users
  WHERE email = v_email;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'data', jsonb_build_object(
        'needsRegistration', true,
        'email', v_email,
        'fullName', coalesce(nullif(v_full_name, ''), split_part(v_email, '@', 1))
      ),
      'message', 'Complete registration'
    );
  END IF;

  v_session_token := encode(gen_random_bytes(24), 'hex');

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'token', v_session_token,
      'worker', public.worker_portal_profile_json(v_user)
    ),
    'message', 'Google sign-in successful'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.worker_portal_login(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_mobile text;
  v_password text;
  v_user public.worker_portal_users%ROWTYPE;
  v_session_token text;
BEGIN
  v_email := lower(trim(coalesce(p_payload->>'email', '')));
  v_mobile := regexp_replace(coalesce(p_payload->>'mobileNumber', ''), '\D', '', 'g');
  v_password := coalesce(p_payload->>'password', '');

  IF v_password = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('password', jsonb_build_array('Password is required'))
    );
  END IF;

  IF v_email <> '' THEN
    SELECT * INTO v_user FROM public.worker_portal_users WHERE email = v_email;
  ELSIF v_mobile ~ '^[6-9]\d{9}$' THEN
    SELECT * INTO v_user FROM public.worker_portal_users WHERE mobile_number = v_mobile;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Validation failed',
      'errors', jsonb_build_object('email', jsonb_build_array('Email or mobile number is required'))
    );
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;

  IF v_user.password_hash <> extensions.crypt(v_password, v_user.password_hash) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid credentials'
    );
  END IF;

  v_session_token := encode(gen_random_bytes(24), 'hex');

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'token', v_session_token,
      'worker', public.worker_portal_profile_json(v_user)
    ),
    'message', 'Login successful'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.worker_portal_send_otp(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.worker_portal_verify_otp(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.worker_portal_register(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.worker_portal_profile_json(public.worker_portal_users) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.worker_portal_google_auth(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.worker_portal_login(jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.worker_portal_send_otp(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.worker_portal_verify_otp(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.worker_portal_register(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.worker_portal_google_auth(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.worker_portal_login(jsonb) TO anon, authenticated;
