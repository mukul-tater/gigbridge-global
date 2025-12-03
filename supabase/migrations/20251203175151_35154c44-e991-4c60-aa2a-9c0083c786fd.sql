-- Allow employers to view profiles of workers who have applied to their jobs
CREATE POLICY "Employers can view applicant profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_applications
    WHERE job_applications.worker_id = profiles.id
    AND job_applications.employer_id = auth.uid()
  )
);