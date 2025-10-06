-- Drop existing views
DROP VIEW IF EXISTS public.employer_profiles_public;
DROP VIEW IF EXISTS public.worker_profiles_public;

-- Recreate employer_profiles_public view with security_invoker
CREATE VIEW public.employer_profiles_public
WITH (security_invoker = true, security_barrier = true)
AS
SELECT 
  id,
  company_name,
  industry,
  description,
  logo_url,
  city,
  country,
  website_url,
  company_size,
  verified,
  status,
  created_at,
  updated_at
FROM public.employer_profiles
WHERE status = 'verified'::employer_status;

-- Grant SELECT on employer_profiles_public to anon and authenticated
GRANT SELECT ON public.employer_profiles_public TO anon, authenticated;

-- Recreate worker_profiles_public view with security_invoker
CREATE VIEW public.worker_profiles_public
WITH (security_invoker = true, security_barrier = true)
AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  nationality,
  bio,
  profile_photo_url,
  languages,
  expected_min_salary,
  expected_max_salary,
  currency,
  available_from,
  contract_duration_months,
  preferred_countries,
  kyc_verified,
  status,
  created_at,
  updated_at
FROM public.worker_profiles
WHERE status = 'verified'::worker_status;

-- Grant SELECT on worker_profiles_public to anon and authenticated
GRANT SELECT ON public.worker_profiles_public TO anon, authenticated;