-- Create employer_profiles table
CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  company_name TEXT,
  company_registration TEXT,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Employers can view their own profile"
  ON public.employer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can create their own profile"
  ON public.employer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can update their own profile"
  ON public.employer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_employer_profiles_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();