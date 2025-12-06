-- Fix profiles table: Block anonymous access, require authentication
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Block anonymous access explicitly (this policy denies anon access)
CREATE POLICY "Block anonymous profile access"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Fix messages table: Block anonymous access explicitly
CREATE POLICY "Block anonymous message access"
ON public.messages
FOR SELECT
TO anon
USING (false);

-- Fix disputes table: Block anonymous access explicitly
CREATE POLICY "Block anonymous dispute access"
ON public.disputes
FOR SELECT
TO anon
USING (false);

-- Fix worker_documents: Ensure anonymous users cannot access
CREATE POLICY "Block anonymous document access"
ON public.worker_documents
FOR SELECT
TO anon
USING (false);

-- Fix work_experience: Require authentication
DROP POLICY IF EXISTS "Anyone can view work experience" ON public.work_experience;
CREATE POLICY "Authenticated users can view work experience"
ON public.work_experience
FOR SELECT
TO authenticated
USING (true);

-- Fix worker_certifications: Require authentication
DROP POLICY IF EXISTS "Anyone can view certifications" ON public.worker_certifications;
CREATE POLICY "Authenticated users can view certifications"
ON public.worker_certifications
FOR SELECT
TO authenticated
USING (true);

-- Fix worker_skills: Require authentication
DROP POLICY IF EXISTS "Anyone can view skills" ON public.worker_skills;
CREATE POLICY "Authenticated users can view skills"
ON public.worker_skills
FOR SELECT
TO authenticated
USING (true);

-- Fix worker_videos: Require authentication
DROP POLICY IF EXISTS "Anyone can view videos" ON public.worker_videos;
CREATE POLICY "Authenticated users can view videos"
ON public.worker_videos
FOR SELECT
TO authenticated
USING (true);