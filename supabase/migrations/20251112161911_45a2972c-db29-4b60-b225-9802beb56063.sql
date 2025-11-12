-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED')),
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(job_id, worker_id)
);

-- Create indexes for job applications
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_worker_id ON public.job_applications(worker_id);
CREATE INDEX idx_job_applications_employer_id ON public.job_applications(employer_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);

-- Enable RLS on job applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for job applications
CREATE POLICY "Workers can view their own applications"
  ON public.job_applications
  FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can create applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Employers can view applications for their jobs"
  ON public.job_applications
  FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can update applications for their jobs"
  ON public.job_applications
  FOR UPDATE
  USING (auth.uid() = employer_id);

-- Create shortlisted workers table
CREATE TABLE public.shortlisted_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_name TEXT DEFAULT 'General',
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employer_id, worker_id, list_name)
);

-- Create indexes for shortlisted workers
CREATE INDEX idx_shortlisted_workers_employer_id ON public.shortlisted_workers(employer_id);
CREATE INDEX idx_shortlisted_workers_worker_id ON public.shortlisted_workers(worker_id);
CREATE INDEX idx_shortlisted_workers_list_name ON public.shortlisted_workers(list_name);

-- Enable RLS on shortlisted workers
ALTER TABLE public.shortlisted_workers ENABLE ROW LEVEL SECURITY;

-- RLS policies for shortlisted workers
CREATE POLICY "Employers can manage their shortlists"
  ON public.shortlisted_workers
  FOR ALL
  USING (auth.uid() = employer_id);

-- Create trigger for updated_at on job_applications
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on shortlisted_workers
CREATE TRIGGER update_shortlisted_workers_updated_at
  BEFORE UPDATE ON public.shortlisted_workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();