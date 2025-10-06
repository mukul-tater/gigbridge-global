-- Drop the existing view
DROP VIEW IF EXISTS worker_profiles_public;

-- Recreate as a security barrier view that enforces RLS from the underlying table
CREATE VIEW worker_profiles_public 
WITH (security_barrier = true)
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
  preferred_countries,
  expected_min_salary,
  expected_max_salary,
  currency,
  available_from,
  contract_duration_months,
  status,
  kyc_verified,
  created_at,
  updated_at
FROM worker_profiles
WHERE status = 'verified'::worker_status;