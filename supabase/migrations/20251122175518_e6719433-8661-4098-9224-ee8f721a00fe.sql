-- Add RLS policy to explicitly prevent employers from creating job applications
CREATE POLICY "Employers cannot create applications"
ON public.job_applications
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'employer'
  )
);