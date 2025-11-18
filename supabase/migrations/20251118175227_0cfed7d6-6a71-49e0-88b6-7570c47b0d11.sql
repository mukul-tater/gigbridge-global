-- Add RLS policies for admins to manage all jobs
CREATE POLICY "Admins can view all jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to view all job skills
CREATE POLICY "Admins can view all job skills"
ON public.job_skills
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all job skills"
ON public.job_skills
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));