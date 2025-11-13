-- Add ECR (Emigration Check Required) status to worker profiles
ALTER TABLE public.worker_profiles 
ADD COLUMN IF NOT EXISTS ecr_status text DEFAULT 'not_checked' CHECK (ecr_status IN ('not_checked', 'required', 'not_required', 'exempted'));

-- Add ECR category for Indian workers
ALTER TABLE public.worker_profiles 
ADD COLUMN IF NOT EXISTS ecr_category text CHECK (ecr_category IN ('ECNR', 'ECR', null));

-- Add passport number for verification
ALTER TABLE public.worker_profiles 
ADD COLUMN IF NOT EXISTS passport_number text;

-- Add comment for clarity
COMMENT ON COLUMN public.worker_profiles.ecr_status IS 'ECR status for emigration clearance (primarily for Indian workers)';
COMMENT ON COLUMN public.worker_profiles.ecr_category IS 'ECNR (Emigration Check Not Required) or ECR (Emigration Check Required)';