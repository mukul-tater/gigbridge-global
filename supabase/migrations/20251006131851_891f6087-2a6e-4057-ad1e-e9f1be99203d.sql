-- CRITICAL SECURITY FIX: Remove overly permissive RLS policy that exposes sensitive PII
-- The policy "Employers can view basic info of verified workers" with condition 'true' 
-- exposes ALL columns including passport_number, aadhaar_number, email, phone, and date_of_birth
-- to ANY authenticated user, enabling identity theft and fraud.

-- Drop the dangerous policy
DROP POLICY IF EXISTS "Employers can view basic info of verified workers" ON worker_profiles;

-- Drop the duplicate policy if it exists
DROP POLICY IF EXISTS "Workers can view their own profile" ON worker_profiles;

-- Now create a secure public view that ONLY exposes non-sensitive columns
-- This allows employers to browse/discover workers without accessing PII
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
  updated_at
  -- EXPLICITLY EXCLUDED: email, phone, date_of_birth, passport_number, aadhaar_number
FROM worker_profiles
WHERE status = 'verified'::worker_status;

-- Add RLS to the view (views can have their own RLS)
ALTER VIEW public.worker_profiles_public SET (security_barrier = true);

-- Grant SELECT to authenticated users for job browsing/discovery
GRANT SELECT ON public.worker_profiles_public TO authenticated;

-- Add security documentation
COMMENT ON VIEW public.worker_profiles_public IS 
  'Public view of verified worker profiles for job browsing. ONLY contains non-sensitive fields. 
   Sensitive PII (email, phone, DOB, passport, Aadhaar) is excluded and only accessible via:
   1. Worker viewing their own profile (worker_profiles table)
   2. Employer with business relationship (get_worker_sensitive_data function)
   This view is safe for general employer browsing and job matching.';

-- Update the main table comment for clarity
COMMENT ON TABLE public.worker_profiles IS 
  'Worker profiles with strict RLS policies. 
   - Workers can view their own complete profile (all sensitive data)
   - Employers with active applications/contracts can view sensitive data via get_worker_sensitive_data()
   - For general browsing without business relationship, use worker_profiles_public view (non-sensitive data only)
   This ensures sensitive PII is only accessible to authorized parties.';

-- Verify the remaining RLS policies are correct:
-- ✅ "Workers can view their own complete profile" - allows workers to see all their own data
-- ✅ "Workers can insert their own profile" - allows profile creation
-- ✅ "Workers can update their own profile" - allows profile updates  
-- ✅ "Employers with business relationship can view sensitive data" - controlled access via business relationship check
-- ❌ REMOVED: "Employers can view basic info of verified workers" - was too permissive