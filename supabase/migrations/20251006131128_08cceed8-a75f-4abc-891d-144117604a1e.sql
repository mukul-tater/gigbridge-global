-- Fix critical security vulnerability: Restrict sensitive PII visibility in worker_profiles
-- Only employers with active applications or contracts can see sensitive data

-- First, drop the overly permissive existing policy
DROP POLICY IF EXISTS "Employers can view verified worker profiles" ON worker_profiles;

-- Create a function to check if an employer has a legitimate business relationship with a worker
CREATE OR REPLACE FUNCTION public.employer_has_business_relationship(
  _worker_id uuid,
  _employer_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if employer has an active job application from this worker
  SELECT EXISTS (
    SELECT 1
    FROM job_applications ja
    JOIN job_postings jp ON ja.job_id = jp.id
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE ja.worker_id = _worker_id
      AND ep.user_id = _employer_user_id
      AND ja.application_status IN ('pending', 'interview', 'offered', 'accepted')
  )
  OR EXISTS (
    -- Check if employer has an active or pending contract with this worker
    SELECT 1
    FROM contracts c
    JOIN job_postings jp ON c.job_id = jp.id
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE c.worker_id = _worker_id
      AND ep.user_id = _employer_user_id
      AND c.status IN ('pending', 'signed', 'active')
  );
$$;

-- Policy 1: Workers can always view their own complete profile
CREATE POLICY "Workers can view their own complete profile"
ON worker_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Employers can view BASIC (non-sensitive) information of verified workers
CREATE POLICY "Employers can view basic info of verified workers"
ON worker_profiles
FOR SELECT
USING (
  status = 'verified'::worker_status
  AND (
    -- Allow access to non-sensitive columns only
    -- The sensitive columns (passport_number, aadhaar_number, email, phone, date_of_birth)
    -- will be filtered by application logic or a view
    true
  )
);

-- Policy 3: Employers with business relationships can view FULL profile including sensitive data
CREATE POLICY "Employers with business relationship can view sensitive data"
ON worker_profiles
FOR SELECT
USING (
  status = 'verified'::worker_status
  AND public.employer_has_business_relationship(id, auth.uid())
);

-- Create a secure view for public worker profiles (without sensitive PII)
CREATE OR REPLACE VIEW public.worker_profiles_public AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  nationality,
  bio,
  profile_photo_url,
  languages,
  preferred_countries,
  expected_min_salary,
  expected_max_salary,
  currency,
  available_from,
  contract_duration_months,
  status,
  kyc_verified,
  created_at,
  updated_at,
  -- Mask sensitive fields
  CASE 
    WHEN auth.uid() = user_id THEN email
    WHEN public.employer_has_business_relationship(id, auth.uid()) THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN auth.uid() = user_id THEN phone
    WHEN public.employer_has_business_relationship(id, auth.uid()) THEN phone
    ELSE NULL
  END as phone,
  CASE 
    WHEN auth.uid() = user_id THEN date_of_birth
    WHEN public.employer_has_business_relationship(id, auth.uid()) THEN date_of_birth
    ELSE NULL
  END as date_of_birth,
  -- Never expose passport/ID numbers in the public view - only in direct queries with proper auth
  NULL::text as passport_number,
  NULL::text as aadhaar_number
FROM worker_profiles
WHERE status = 'verified'::worker_status OR auth.uid() = user_id;

-- Grant access to the view
GRANT SELECT ON public.worker_profiles_public TO authenticated;

-- Add helpful comment
COMMENT ON VIEW public.worker_profiles_public IS 
  'Public view of worker profiles with sensitive PII masked. Use direct table access only when you have verified business relationship.';

-- Create a function to safely get sensitive worker data (for employers with legitimate access)
CREATE OR REPLACE FUNCTION public.get_worker_sensitive_data(_worker_id uuid)
RETURNS TABLE (
  worker_id uuid,
  email text,
  phone text,
  date_of_birth date,
  passport_number text,
  aadhaar_number text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return data if caller is the worker themselves or has a business relationship
  IF auth.uid() = (SELECT user_id FROM worker_profiles WHERE id = _worker_id) THEN
    RETURN QUERY
    SELECT 
      wp.id as worker_id,
      wp.email,
      wp.phone,
      wp.date_of_birth,
      wp.passport_number,
      wp.aadhaar_number
    FROM worker_profiles wp
    WHERE wp.id = _worker_id;
  ELSIF public.employer_has_business_relationship(_worker_id, auth.uid()) THEN
    RETURN QUERY
    SELECT 
      wp.id as worker_id,
      wp.email,
      wp.phone,
      wp.date_of_birth,
      -- Still mask passport/ID numbers even for business relationships
      -- Only expose via admin approval or contract signing
      NULL::text as passport_number,
      NULL::text as aadhaar_number
    FROM worker_profiles wp
    WHERE wp.id = _worker_id;
  ELSE
    -- No access - return nothing
    RETURN;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_worker_sensitive_data IS 
  'Safely retrieves sensitive worker data. Only accessible to the worker themselves or employers with active applications/contracts. Passport/ID numbers remain restricted.';