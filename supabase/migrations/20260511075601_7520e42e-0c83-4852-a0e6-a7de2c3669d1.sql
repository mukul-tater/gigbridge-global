
-- 1. WORKER_PROFILES
DROP POLICY IF EXISTS "Employers can view all worker profiles" ON public.worker_profiles;

CREATE POLICY "Employers view applicant worker profiles"
ON public.worker_profiles FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'employer'::app_role)
  AND (
    EXISTS (SELECT 1 FROM public.job_applications ja
            WHERE ja.worker_id = worker_profiles.user_id AND ja.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.interviews i
            WHERE i.worker_id = worker_profiles.user_id AND i.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.shortlisted_workers sw
            WHERE sw.worker_id = worker_profiles.user_id AND sw.employer_id = auth.uid())
  )
);

-- 2. EMPLOYER_PROFILES: drop blanket worker view; expose safe cols via view
DROP POLICY IF EXISTS "Workers can view employer profiles for their applications" ON public.employer_profiles;

DROP VIEW IF EXISTS public.employer_company_info;
CREATE VIEW public.employer_company_info AS
SELECT
  user_id, company_name, industry, business_type, company_size,
  country, office_state, website, bio, company_logo_url,
  follows_safety_standards, provides_ppe, site_safety_level, created_at
FROM public.employer_profiles;

ALTER VIEW public.employer_company_info SET (security_invoker = false);
GRANT SELECT ON public.employer_company_info TO anon, authenticated;

-- 3. USER_ROLES: restrictive policy preventing self-promotion via direct insert
DROP POLICY IF EXISTS "Block direct role self-insert" ON public.user_roles;
CREATE POLICY "Block direct role self-insert"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. STORAGE worker-documents
DROP POLICY IF EXISTS "Employers can view worker documents" ON storage.objects;
CREATE POLICY "Employers view applicant worker documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'worker-documents'
  AND has_role(auth.uid(), 'employer'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.worker_id::text = (storage.foldername(name))[1]
      AND ja.employer_id = auth.uid()
  )
);

-- 5. list_public_workers: just revoke anon, keep signature
REVOKE EXECUTE ON FUNCTION public.list_public_workers(int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.list_public_workers(int) TO authenticated;

-- 6. REALTIME
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated may use realtime" ON realtime.messages;
CREATE POLICY "Authenticated may use realtime"
ON realtime.messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated may publish realtime" ON realtime.messages;
CREATE POLICY "Authenticated may publish realtime"
ON realtime.messages FOR INSERT TO authenticated WITH CHECK (true);
