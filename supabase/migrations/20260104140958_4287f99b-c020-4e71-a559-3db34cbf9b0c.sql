-- Fix: Remove passport_number exposure to employers
-- Create a secure function that employers can use to get worker profile data WITHOUT sensitive fields

CREATE OR REPLACE FUNCTION public.get_worker_profile_for_employer(p_worker_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  bio text,
  nationality text,
  current_location text,
  years_of_experience integer,
  expected_salary_min numeric,
  expected_salary_max numeric,
  currency text,
  availability text,
  has_passport boolean,
  has_visa boolean,
  visa_countries text[],
  languages text[],
  ecr_status text,
  ecr_category text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wp.id,
    wp.user_id,
    wp.bio,
    wp.nationality,
    wp.current_location,
    wp.years_of_experience,
    wp.expected_salary_min,
    wp.expected_salary_max,
    wp.currency,
    wp.availability,
    wp.has_passport,
    wp.has_visa,
    wp.visa_countries,
    wp.languages,
    wp.ecr_status,
    wp.ecr_category,
    wp.created_at,
    wp.updated_at
  FROM worker_profiles wp
  WHERE wp.user_id = p_worker_id
    -- Only allow if employer has received an application from this worker
    AND EXISTS (
      SELECT 1 FROM job_applications ja
      WHERE ja.worker_id = p_worker_id
        AND ja.employer_id = auth.uid()
    )
    -- Caller must be an employer
    AND has_role(auth.uid(), 'employer')
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_worker_profile_for_employer(uuid) TO authenticated;

-- Add comment explaining the function's purpose
COMMENT ON FUNCTION public.get_worker_profile_for_employer IS 'Returns worker profile data for employers WITHOUT sensitive fields like passport_number. Only works if the worker has applied to one of the employer''s jobs.';