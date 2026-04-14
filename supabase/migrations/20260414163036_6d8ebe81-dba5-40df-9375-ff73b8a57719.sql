
-- Add new columns to worker_profiles for enhanced onboarding
ALTER TABLE public.worker_profiles 
  ADD COLUMN IF NOT EXISTS current_city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS preferred_work_city text,
  ADD COLUMN IF NOT EXISTS primary_work_type text,
  ADD COLUMN IF NOT EXISTS secondary_skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skill_level text,
  ADD COLUMN IF NOT EXISTS project_types_worked text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_range text,
  ADD COLUMN IF NOT EXISTS open_to_relocation boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expected_wage_type text,
  ADD COLUMN IF NOT EXISTS expected_wage_amount numeric,
  ADD COLUMN IF NOT EXISTS preferred_shift text,
  ADD COLUMN IF NOT EXISTS work_preference text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Add mobile_verified to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile_verified boolean DEFAULT false;
