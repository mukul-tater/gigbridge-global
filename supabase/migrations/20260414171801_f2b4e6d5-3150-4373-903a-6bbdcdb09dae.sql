
-- Step 1: Basic Details
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS employer_role text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS country text;

-- Step 2: Business Info
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS work_locations text[] DEFAULT '{}';
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS office_address text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS office_state text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS cin_number text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS tax_info_number text;

-- Step 3: Hiring Needs
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS hiring_roles text[] DEFAULT '{}';
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS worker_type_needed text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS workers_required integer;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS job_type text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS preferred_countries text[] DEFAULT '{}';
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS expected_start_date date;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS salary_type text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS salary_amount numeric;

-- Step 4: Business Verification
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS id_type text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS id_number text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS company_logo_url text;

-- Step 5: Payment & Billing
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS payment_method_preference text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS billing_address text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS gst_number text;

-- Safety
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS follows_safety_standards boolean DEFAULT false;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS provides_ppe text;
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS site_safety_level text;

-- Onboarding flag
ALTER TABLE public.employer_profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
