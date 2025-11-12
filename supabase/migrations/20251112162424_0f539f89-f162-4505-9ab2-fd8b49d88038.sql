-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  responsibilities TEXT,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERNSHIP')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('ENTRY', 'INTERMEDIATE', 'SENIOR', 'EXPERT')),
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR')),
  openings INTEGER NOT NULL DEFAULT 1,
  visa_sponsorship BOOLEAN DEFAULT false,
  remote_allowed BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED')),
  posted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for jobs
CREATE INDEX idx_jobs_employer_id ON public.jobs(employer_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_country ON public.jobs(country);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);

-- Enable RLS on jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs
  FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Employers can view their own jobs"
  ON public.jobs
  FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create jobs"
  ON public.jobs
  FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs"
  ON public.jobs
  FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs
  FOR DELETE
  USING (auth.uid() = employer_id);

-- Create trigger for updated_at on jobs
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create job_skills junction table
CREATE TABLE public.job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, skill_name)
);

-- Create index for job_skills
CREATE INDEX idx_job_skills_job_id ON public.job_skills(job_id);

-- Enable RLS on job_skills
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_skills
CREATE POLICY "Anyone can view skills for active jobs"
  ON public.job_skills
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_skills.job_id
    AND jobs.status = 'ACTIVE'
  ));

CREATE POLICY "Employers can manage skills for their jobs"
  ON public.job_skills
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_skills.job_id
    AND jobs.employer_id = auth.uid()
  ));