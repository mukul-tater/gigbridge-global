-- Create interviews table
CREATE TABLE public.interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  employer_id uuid NOT NULL,
  worker_id uuid NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  interview_mode text NOT NULL DEFAULT 'VIDEO',
  meeting_link text,
  location text,
  status text NOT NULL DEFAULT 'SCHEDULED',
  notes text,
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create offers table
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  employer_id uuid NOT NULL,
  worker_id uuid NOT NULL,
  salary_amount numeric NOT NULL,
  salary_currency text NOT NULL DEFAULT 'INR',
  benefits text[],
  start_date date NOT NULL,
  expiry_date date,
  status text NOT NULL DEFAULT 'DRAFT',
  sent_at timestamp with time zone,
  responded_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Interviews RLS policies
CREATE POLICY "Employers can manage their interviews"
ON public.interviews
FOR ALL
TO authenticated
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Workers can view their interviews"
ON public.interviews
FOR SELECT
TO authenticated
USING (auth.uid() = worker_id);

-- Offers RLS policies
CREATE POLICY "Employers can manage their offers"
ON public.offers
FOR ALL
TO authenticated
USING (auth.uid() = employer_id)
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Workers can view their offers"
ON public.offers
FOR SELECT
TO authenticated
USING (auth.uid() = worker_id);

-- Add updated_at triggers
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON public.interviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();