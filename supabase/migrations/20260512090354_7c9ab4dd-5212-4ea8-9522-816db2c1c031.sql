-- Replace security-definer employer company view with a safe table
DROP VIEW IF EXISTS public.employer_company_info CASCADE;

CREATE TABLE IF NOT EXISTS public.employer_company_info (
  user_id uuid PRIMARY KEY,
  company_name text,
  industry text,
  business_type text,
  company_size text,
  country text,
  office_state text,
  website text,
  bio text,
  company_logo_url text,
  follows_safety_standards boolean,
  provides_ppe text,
  site_safety_level text,
  created_at timestamptz
);

ALTER TABLE public.employer_company_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view safe employer company info" ON public.employer_company_info;
CREATE POLICY "Public can view safe employer company info"
ON public.employer_company_info
FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.sync_employer_company_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.employer_company_info (
    user_id, company_name, industry, business_type, company_size, country,
    office_state, website, bio, company_logo_url, follows_safety_standards,
    provides_ppe, site_safety_level, created_at
  ) VALUES (
    NEW.user_id, NEW.company_name, NEW.industry, NEW.business_type, NEW.company_size, NEW.country,
    NEW.office_state, NEW.website, NEW.bio, NEW.company_logo_url, NEW.follows_safety_standards,
    NEW.provides_ppe, NEW.site_safety_level, NEW.created_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    industry = EXCLUDED.industry,
    business_type = EXCLUDED.business_type,
    company_size = EXCLUDED.company_size,
    country = EXCLUDED.country,
    office_state = EXCLUDED.office_state,
    website = EXCLUDED.website,
    bio = EXCLUDED.bio,
    company_logo_url = EXCLUDED.company_logo_url,
    follows_safety_standards = EXCLUDED.follows_safety_standards,
    provides_ppe = EXCLUDED.provides_ppe,
    site_safety_level = EXCLUDED.site_safety_level,
    created_at = EXCLUDED.created_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_employer_company_info_trigger ON public.employer_profiles;
CREATE TRIGGER sync_employer_company_info_trigger
AFTER INSERT OR UPDATE ON public.employer_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_employer_company_info();

INSERT INTO public.employer_company_info (
  user_id, company_name, industry, business_type, company_size, country,
  office_state, website, bio, company_logo_url, follows_safety_standards,
  provides_ppe, site_safety_level, created_at
)
SELECT
  user_id, company_name, industry, business_type, company_size, country,
  office_state, website, bio, company_logo_url, follows_safety_standards,
  provides_ppe, site_safety_level, created_at
FROM public.employer_profiles
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  business_type = EXCLUDED.business_type,
  company_size = EXCLUDED.company_size,
  country = EXCLUDED.country,
  office_state = EXCLUDED.office_state,
  website = EXCLUDED.website,
  bio = EXCLUDED.bio,
  company_logo_url = EXCLUDED.company_logo_url,
  follows_safety_standards = EXCLUDED.follows_safety_standards,
  provides_ppe = EXCLUDED.provides_ppe,
  site_safety_level = EXCLUDED.site_safety_level,
  created_at = EXCLUDED.created_at;

-- Safe worker profile projection for employer-facing screens; passport_number is intentionally omitted
CREATE TABLE IF NOT EXISTS public.worker_profile_employer_info (
  user_id uuid PRIMARY KEY,
  bio text,
  nationality text,
  current_location text,
  years_of_experience integer,
  expected_salary_min numeric,
  expected_salary_max numeric,
  currency text,
  availability text,
  has_passport boolean,
  has_visa boolean,
  visa_countries text[],
  languages text[],
  ecr_status text,
  ecr_category text,
  current_city text,
  country text,
  primary_work_type text,
  secondary_skills text[],
  skill_level text,
  project_types_worked text[],
  experience_range text,
  open_to_relocation boolean,
  expected_wage_type text,
  expected_wage_amount numeric,
  preferred_shift text,
  work_preference text,
  onboarding_completed boolean,
  created_at timestamptz,
  updated_at timestamptz
);

ALTER TABLE public.worker_profile_employer_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view safe worker profile summaries" ON public.worker_profile_employer_info;
CREATE POLICY "Admins can view safe worker profile summaries"
ON public.worker_profile_employer_info
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Workers can view their own safe worker profile summary" ON public.worker_profile_employer_info;
CREATE POLICY "Workers can view their own safe worker profile summary"
ON public.worker_profile_employer_info
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Employers can view related safe worker profile summaries" ON public.worker_profile_employer_info;
CREATE POLICY "Employers can view related safe worker profile summaries"
ON public.worker_profile_employer_info
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'employer'::app_role)
  AND (
    EXISTS (SELECT 1 FROM public.job_applications ja WHERE ja.worker_id = worker_profile_employer_info.user_id AND ja.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.interviews i WHERE i.worker_id = worker_profile_employer_info.user_id AND i.employer_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.shortlisted_workers sw WHERE sw.worker_id = worker_profile_employer_info.user_id AND sw.employer_id = auth.uid())
  )
);

CREATE OR REPLACE FUNCTION public.sync_worker_profile_employer_info()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.worker_profile_employer_info (
    user_id, bio, nationality, current_location, years_of_experience,
    expected_salary_min, expected_salary_max, currency, availability,
    has_passport, has_visa, visa_countries, languages, ecr_status,
    ecr_category, current_city, country, primary_work_type, secondary_skills,
    skill_level, project_types_worked, experience_range, open_to_relocation,
    expected_wage_type, expected_wage_amount, preferred_shift, work_preference,
    onboarding_completed, created_at, updated_at
  ) VALUES (
    NEW.user_id, NEW.bio, NEW.nationality, NEW.current_location, NEW.years_of_experience,
    NEW.expected_salary_min, NEW.expected_salary_max, NEW.currency, NEW.availability,
    NEW.has_passport, NEW.has_visa, NEW.visa_countries, NEW.languages, NEW.ecr_status,
    NEW.ecr_category, NEW.current_city, NEW.country, NEW.primary_work_type, NEW.secondary_skills,
    NEW.skill_level, NEW.project_types_worked, NEW.experience_range, NEW.open_to_relocation,
    NEW.expected_wage_type, NEW.expected_wage_amount, NEW.preferred_shift, NEW.work_preference,
    NEW.onboarding_completed, NEW.created_at, NEW.updated_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    bio = EXCLUDED.bio,
    nationality = EXCLUDED.nationality,
    current_location = EXCLUDED.current_location,
    years_of_experience = EXCLUDED.years_of_experience,
    expected_salary_min = EXCLUDED.expected_salary_min,
    expected_salary_max = EXCLUDED.expected_salary_max,
    currency = EXCLUDED.currency,
    availability = EXCLUDED.availability,
    has_passport = EXCLUDED.has_passport,
    has_visa = EXCLUDED.has_visa,
    visa_countries = EXCLUDED.visa_countries,
    languages = EXCLUDED.languages,
    ecr_status = EXCLUDED.ecr_status,
    ecr_category = EXCLUDED.ecr_category,
    current_city = EXCLUDED.current_city,
    country = EXCLUDED.country,
    primary_work_type = EXCLUDED.primary_work_type,
    secondary_skills = EXCLUDED.secondary_skills,
    skill_level = EXCLUDED.skill_level,
    project_types_worked = EXCLUDED.project_types_worked,
    experience_range = EXCLUDED.experience_range,
    open_to_relocation = EXCLUDED.open_to_relocation,
    expected_wage_type = EXCLUDED.expected_wage_type,
    expected_wage_amount = EXCLUDED.expected_wage_amount,
    preferred_shift = EXCLUDED.preferred_shift,
    work_preference = EXCLUDED.work_preference,
    onboarding_completed = EXCLUDED.onboarding_completed,
    updated_at = EXCLUDED.updated_at;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_worker_profile_employer_info_trigger ON public.worker_profiles;
CREATE TRIGGER sync_worker_profile_employer_info_trigger
AFTER INSERT OR UPDATE ON public.worker_profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_worker_profile_employer_info();

INSERT INTO public.worker_profile_employer_info (
  user_id, bio, nationality, current_location, years_of_experience,
  expected_salary_min, expected_salary_max, currency, availability,
  has_passport, has_visa, visa_countries, languages, ecr_status,
  ecr_category, current_city, country, primary_work_type, secondary_skills,
  skill_level, project_types_worked, experience_range, open_to_relocation,
  expected_wage_type, expected_wage_amount, preferred_shift, work_preference,
  onboarding_completed, created_at, updated_at
)
SELECT
  user_id, bio, nationality, current_location, years_of_experience,
  expected_salary_min, expected_salary_max, currency, availability,
  has_passport, has_visa, visa_countries, languages, ecr_status,
  ecr_category, current_city, country, primary_work_type, secondary_skills,
  skill_level, project_types_worked, experience_range, open_to_relocation,
  expected_wage_type, expected_wage_amount, preferred_shift, work_preference,
  onboarding_completed, created_at, updated_at
FROM public.worker_profiles
ON CONFLICT (user_id) DO UPDATE SET
  bio = EXCLUDED.bio,
  nationality = EXCLUDED.nationality,
  current_location = EXCLUDED.current_location,
  years_of_experience = EXCLUDED.years_of_experience,
  expected_salary_min = EXCLUDED.expected_salary_min,
  expected_salary_max = EXCLUDED.expected_salary_max,
  currency = EXCLUDED.currency,
  availability = EXCLUDED.availability,
  has_passport = EXCLUDED.has_passport,
  has_visa = EXCLUDED.has_visa,
  visa_countries = EXCLUDED.visa_countries,
  languages = EXCLUDED.languages,
  ecr_status = EXCLUDED.ecr_status,
  ecr_category = EXCLUDED.ecr_category,
  current_city = EXCLUDED.current_city,
  country = EXCLUDED.country,
  primary_work_type = EXCLUDED.primary_work_type,
  secondary_skills = EXCLUDED.secondary_skills,
  skill_level = EXCLUDED.skill_level,
  project_types_worked = EXCLUDED.project_types_worked,
  experience_range = EXCLUDED.experience_range,
  open_to_relocation = EXCLUDED.open_to_relocation,
  expected_wage_type = EXCLUDED.expected_wage_type,
  expected_wage_amount = EXCLUDED.expected_wage_amount,
  preferred_shift = EXCLUDED.preferred_shift,
  work_preference = EXCLUDED.work_preference,
  onboarding_completed = EXCLUDED.onboarding_completed,
  updated_at = EXCLUDED.updated_at;

DROP POLICY IF EXISTS "Employers view applicant worker profiles" ON public.worker_profiles;
DROP POLICY IF EXISTS "Employers can view all worker profiles" ON public.worker_profiles;

-- Storage: workers can remove their own document/video files, and employers only see verified related documents
DROP POLICY IF EXISTS "Workers can delete their own documents" ON storage.objects;
CREATE POLICY "Workers can delete their own documents"
ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'worker-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Workers can delete their own videos" ON storage.objects;
CREATE POLICY "Workers can delete their own videos"
ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'worker-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Employers view applicant worker documents" ON storage.objects;
DROP POLICY IF EXISTS "Employers can view worker documents" ON storage.objects;
CREATE POLICY "Employers view applicant worker documents"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'worker-documents'
  AND public.has_role(auth.uid(), 'employer'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.job_applications ja
    JOIN public.worker_documents wd ON wd.worker_id = ja.worker_id
    WHERE ja.worker_id::text = (storage.foldername(name))[1]
      AND ja.employer_id = auth.uid()
      AND wd.verification_status = 'verified'
      AND (
        wd.file_url = name
        OR wd.file_url LIKE '%' || name
        OR wd.file_url LIKE '%' || replace(name, ' ', '%20') || '%'
      )
  )
);

-- Realtime: remove broad all-authenticated policies and allow only explicit user-scoped private topics
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated may use realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated may publish realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Users can use their own private realtime topics" ON realtime.messages;
CREATE POLICY "Users can use their own private realtime topics"
ON realtime.messages
FOR SELECT TO authenticated
USING (
  realtime.topic() IN (
    'user:' || auth.uid()::text,
    'notifications:' || auth.uid()::text,
    'messages:' || auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Users can publish to their own private realtime topics" ON realtime.messages;
CREATE POLICY "Users can publish to their own private realtime topics"
ON realtime.messages
FOR INSERT TO authenticated
WITH CHECK (
  realtime.topic() IN (
    'user:' || auth.uid()::text,
    'notifications:' || auth.uid()::text,
    'messages:' || auth.uid()::text
  )
);