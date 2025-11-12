-- Create worker_profiles table for detailed worker information
CREATE TABLE public.worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  nationality TEXT,
  current_location TEXT,
  years_of_experience INTEGER,
  expected_salary_min NUMERIC,
  expected_salary_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  availability TEXT,
  has_passport BOOLEAN DEFAULT false,
  has_visa BOOLEAN DEFAULT false,
  visa_countries TEXT[],
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create work_experience table
CREATE TABLE public.work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(user_id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create worker_certifications table
CREATE TABLE public.worker_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(user_id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create worker_skills table
CREATE TABLE public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(user_id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_of_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(worker_id, skill_name)
);

-- Create worker_documents table
CREATE TABLE public.worker_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(user_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('resume', 'passport', 'visa', 'certificate', 'id_proof', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id)
);

-- Create worker_videos table for skill demonstration videos
CREATE TABLE public.worker_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.worker_profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  skills_demonstrated TEXT[],
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for worker documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('worker-documents', 'worker-documents', false);

-- Create storage bucket for worker videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('worker-videos', 'worker-videos', true);

-- Enable RLS on all tables
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for worker_profiles
CREATE POLICY "Anyone can view worker profiles"
  ON public.worker_profiles FOR SELECT
  USING (true);

CREATE POLICY "Workers can create their own profile"
  ON public.worker_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workers can update their own profile"
  ON public.worker_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for work_experience
CREATE POLICY "Anyone can view work experience"
  ON public.work_experience FOR SELECT
  USING (true);

CREATE POLICY "Workers can manage their own experience"
  ON public.work_experience FOR ALL
  USING (auth.uid() = worker_id);

-- RLS Policies for worker_certifications
CREATE POLICY "Anyone can view certifications"
  ON public.worker_certifications FOR SELECT
  USING (true);

CREATE POLICY "Workers can manage their own certifications"
  ON public.worker_certifications FOR ALL
  USING (auth.uid() = worker_id);

-- RLS Policies for worker_skills
CREATE POLICY "Anyone can view skills"
  ON public.worker_skills FOR SELECT
  USING (true);

CREATE POLICY "Workers can manage their own skills"
  ON public.worker_skills FOR ALL
  USING (auth.uid() = worker_id);

-- RLS Policies for worker_documents
CREATE POLICY "Workers can view their own documents"
  ON public.worker_documents FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Employers can view verified documents"
  ON public.worker_documents FOR SELECT
  USING (verification_status = 'verified' AND has_role(auth.uid(), 'employer'));

CREATE POLICY "Admins can view all documents"
  ON public.worker_documents FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Workers can upload their own documents"
  ON public.worker_documents FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own documents"
  ON public.worker_documents FOR UPDATE
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can delete their own documents"
  ON public.worker_documents FOR DELETE
  USING (auth.uid() = worker_id);

-- RLS Policies for worker_videos
CREATE POLICY "Anyone can view videos"
  ON public.worker_videos FOR SELECT
  USING (true);

CREATE POLICY "Workers can manage their own videos"
  ON public.worker_videos FOR ALL
  USING (auth.uid() = worker_id);

-- Storage policies for worker-documents bucket
CREATE POLICY "Workers can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'worker-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'worker-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Employers can view worker documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'worker-documents' AND
    has_role(auth.uid(), 'employer')
  );

-- Storage policies for worker-videos bucket
CREATE POLICY "Anyone can view videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'worker-videos');

CREATE POLICY "Workers can upload their own videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'worker-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Workers can update their own videos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'worker-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trigger for updated_at on worker_profiles
CREATE TRIGGER update_worker_profiles_updated_at
  BEFORE UPDATE ON public.worker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_worker_profiles_user_id ON public.worker_profiles(user_id);
CREATE INDEX idx_work_experience_worker_id ON public.work_experience(worker_id);
CREATE INDEX idx_worker_certifications_worker_id ON public.worker_certifications(worker_id);
CREATE INDEX idx_worker_skills_worker_id ON public.worker_skills(worker_id);
CREATE INDEX idx_worker_documents_worker_id ON public.worker_documents(worker_id);
CREATE INDEX idx_worker_videos_worker_id ON public.worker_videos(worker_id);
CREATE INDEX idx_worker_skills_skill_name ON public.worker_skills(skill_name);
CREATE INDEX idx_worker_documents_verification_status ON public.worker_documents(verification_status);