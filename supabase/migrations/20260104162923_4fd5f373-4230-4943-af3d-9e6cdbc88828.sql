
-- Allow workers to view employer profiles for companies they've applied to or have interviews with
CREATE POLICY "Workers can view employer profiles for their applications" 
ON public.employer_profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    WHERE ja.employer_id = employer_profiles.user_id
    AND ja.worker_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM interviews i
    WHERE i.employer_id = employer_profiles.user_id
    AND i.worker_id = auth.uid()
  )
);

-- Allow workers to view profiles (names) of employers they have interviews/applications with
CREATE POLICY "Workers can view employer user profiles for their applications" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    WHERE ja.employer_id = profiles.id
    AND ja.worker_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM interviews i
    WHERE i.employer_id = profiles.id
    AND i.worker_id = auth.uid()
  )
);
