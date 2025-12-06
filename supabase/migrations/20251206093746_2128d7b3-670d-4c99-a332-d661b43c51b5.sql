-- Fix worker_profiles security: Remove public access, require authentication
DROP POLICY IF EXISTS "Anyone can view worker profiles" ON public.worker_profiles;

-- Employers can only view profiles of workers who applied to their jobs
CREATE POLICY "Employers can view applicant worker profiles"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'employer') AND
  user_id IN (
    SELECT worker_id FROM job_applications
    WHERE employer_id = auth.uid()
  )
);

-- Admins can view all worker profiles
CREATE POLICY "Admins can view all worker profiles"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Workers can view their own profile (already exists but let's ensure it)
DROP POLICY IF EXISTS "Workers can view own profile" ON public.worker_profiles;
CREATE POLICY "Workers can view own profile"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix jobs table: Keep public visibility for job seekers but document the employer_id exposure
-- Jobs need to be visible publicly for the platform to function, but we add a comment
COMMENT ON POLICY "Anyone can view active jobs" ON public.jobs IS 'Public job listings are intentionally visible to allow job seekers to browse. employer_id exposure is necessary to display company information.';