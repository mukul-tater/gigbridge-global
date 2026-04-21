
-- Allow employers to view base profiles of anyone who has the worker role.
CREATE POLICY "Employers can view worker profiles for discovery"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'employer'::app_role)
  AND public.has_role(profiles.id, 'worker'::app_role)
);

-- Allow employers to view worker_profiles rows for any worker.
CREATE POLICY "Employers can view all worker profiles"
ON public.worker_profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'employer'::app_role)
);
