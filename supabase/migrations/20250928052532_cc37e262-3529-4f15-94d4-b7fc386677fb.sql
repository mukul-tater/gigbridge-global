-- Create enums for onboarding system (skip if exists)
DO $$ BEGIN
    CREATE TYPE onboarding_status AS ENUM ('draft', 'pending_verification', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('uploaded', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE proficiency_level AS ENUM ('basic', 'conversational', 'fluent', 'native');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create worker onboarding table
CREATE TABLE public.worker_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status onboarding_status NOT NULL DEFAULT 'draft',
  current_step INTEGER NOT NULL DEFAULT 1,
  submitted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reasons TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create worker onboarding profile table
CREATE TABLE public.worker_onboarding_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(onboarding_id)
);

-- Create worker documents table
CREATE TABLE public.worker_onboarding_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'uploaded',
  ocr_data JSONB,
  storage_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(onboarding_id, document_type)
);

-- Create worker onboarding skills table
CREATE TABLE public.worker_onboarding_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker certifications table
CREATE TABLE public.worker_onboarding_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker work history table
CREATE TABLE public.worker_onboarding_work_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  responsibilities TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker languages table
CREATE TABLE public.worker_onboarding_languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  proficiency proficiency_level NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker preferences table
CREATE TABLE public.worker_onboarding_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID NOT NULL REFERENCES public.worker_onboarding(id) ON DELETE CASCADE,
  preferred_countries TEXT[] NOT NULL DEFAULT '{}',
  expected_wage_currency TEXT NOT NULL DEFAULT 'USD',
  expected_wage_amount NUMERIC NOT NULL,
  contract_length TEXT NOT NULL,
  availability_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(onboarding_id)
);

-- Create audit log table
CREATE TABLE public.onboarding_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.worker_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_work_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_onboarding_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_audit_logs ENABLE ROW LEVEL SECURITY;