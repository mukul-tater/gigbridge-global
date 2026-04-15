-- Admin full access to employer_profiles
CREATE POLICY "Admins can view all employer profiles"
ON public.employer_profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all employer profiles"
ON public.employer_profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin full access to job_applications
CREATE POLICY "Admins can view all applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all applications"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
ON public.job_applications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin full access to offers
CREATE POLICY "Admins can manage all offers"
ON public.offers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin update worker profiles
CREATE POLICY "Admins can update all worker profiles"
ON public.worker_profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin full access to interviews
CREATE POLICY "Admins can manage all interviews"
ON public.interviews
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));