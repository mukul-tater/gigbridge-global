-- Create function to check if a worker has business relationship with an employer
CREATE OR REPLACE FUNCTION public.worker_has_business_relationship(_employer_id uuid, _worker_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Check if worker has applied to any jobs from this employer
  SELECT EXISTS (
    SELECT 1
    FROM job_applications ja
    JOIN job_postings jp ON ja.job_id = jp.id
    JOIN worker_profiles wp ON ja.worker_id = wp.id
    WHERE jp.employer_id = _employer_id
      AND wp.user_id = _worker_user_id
  )
  OR EXISTS (
    -- Check if worker has a contract with this employer
    SELECT 1
    FROM contracts c
    JOIN job_postings jp ON c.job_id = jp.id
    JOIN worker_profiles wp ON c.worker_id = wp.id
    WHERE jp.employer_id = _employer_id
      AND wp.user_id = _worker_user_id
  );
$$;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Workers can view verified employer profiles" ON employer_profiles;

-- Create a public view that shows only non-sensitive employer information
CREATE OR REPLACE VIEW employer_profiles_public 
WITH (security_barrier = true)
AS
SELECT 
  id,
  company_name,
  industry,
  company_size,
  website_url,
  description,
  logo_url,
  country,
  city,
  verified,
  status,
  created_at,
  updated_at
FROM employer_profiles
WHERE status = 'verified'::employer_status;

-- Grant access to the public view
GRANT SELECT ON employer_profiles_public TO anon, authenticated;

-- Add policy for authenticated workers with business relationships to view full profiles
CREATE POLICY "Workers with business relationship can view full employer profiles"
ON employer_profiles
FOR SELECT
TO authenticated
USING (
  status = 'verified'::employer_status 
  AND worker_has_business_relationship(id, auth.uid())
);

-- Add comment to explain the security model
COMMENT ON FUNCTION worker_has_business_relationship IS 
'Checks if a worker has a legitimate business relationship with an employer through job applications or contracts. Used to control access to sensitive employer contact information.';