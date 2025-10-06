-- CRITICAL SECURITY FIX: Drop the insecure worker_profiles_public view
-- This view bypasses RLS and exposes sensitive PII to all authenticated users

-- Drop the view entirely - it was a security vulnerability
DROP VIEW IF EXISTS public.worker_profiles_public CASCADE;

-- Add a comment explaining why the view was removed
COMMENT ON TABLE public.worker_profiles IS 
  'Worker profiles with strict RLS policies. Use get_worker_sensitive_data() function for controlled access to PII. The worker_profiles_public view was removed due to critical security vulnerability - it bypassed RLS and exposed sensitive data.';

-- Ensure the existing RLS policies on worker_profiles are correctly enforced:
-- 1. Workers can view their own complete profile
-- 2. Employers can view basic info of verified workers (non-sensitive fields only)
-- 3. Employers with business relationship can view sensitive data through get_worker_sensitive_data() function

-- Note: All client code should query worker_profiles table directly (RLS will handle access control)
-- or use the get_worker_sensitive_data() function for controlled PII access