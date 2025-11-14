-- Create application status history table
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  changed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post-approval formalities table
CREATE TABLE IF NOT EXISTS public.job_formalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  
  -- Visa processing
  visa_required BOOLEAN DEFAULT true,
  visa_status TEXT DEFAULT 'NOT_STARTED',
  visa_application_date TIMESTAMP WITH TIME ZONE,
  visa_approval_date TIMESTAMP WITH TIME ZONE,
  visa_expiry_date DATE,
  visa_type TEXT,
  
  -- ECR checks
  ecr_check_required BOOLEAN DEFAULT true,
  ecr_check_status TEXT DEFAULT 'NOT_STARTED',
  ecr_clearance_date TIMESTAMP WITH TIME ZONE,
  ecr_certificate_url TEXT,
  
  -- Medical examination
  medical_exam_required BOOLEAN DEFAULT true,
  medical_exam_status TEXT DEFAULT 'NOT_STARTED',
  medical_exam_date TIMESTAMP WITH TIME ZONE,
  medical_certificate_url TEXT,
  
  -- Police verification
  police_verification_required BOOLEAN DEFAULT true,
  police_verification_status TEXT DEFAULT 'NOT_STARTED',
  police_verification_date TIMESTAMP WITH TIME ZONE,
  police_certificate_url TEXT,
  
  -- Contract signing
  contract_sent BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  contract_signed_date TIMESTAMP WITH TIME ZONE,
  contract_url TEXT,
  
  -- Travel arrangements
  flight_booking_status TEXT DEFAULT 'NOT_STARTED',
  departure_date TIMESTAMP WITH TIME ZONE,
  arrival_date TIMESTAMP WITH TIME ZONE,
  travel_details JSONB,
  
  -- Overall status
  overall_status TEXT DEFAULT 'IN_PROGRESS',
  completion_percentage INTEGER DEFAULT 0,
  expected_joining_date DATE,
  actual_joining_date DATE,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_formalities ENABLE ROW LEVEL SECURITY;

-- RLS policies for application_status_history
CREATE POLICY "Workers can view their own application history"
  ON public.application_status_history
  FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM public.job_applications WHERE worker_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view application history for their jobs"
  ON public.application_status_history
  FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM public.job_applications WHERE employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can insert application history"
  ON public.application_status_history
  FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM public.job_applications WHERE employer_id = auth.uid()
    )
  );

-- RLS policies for job_formalities
CREATE POLICY "Workers can view their own formalities"
  ON public.job_formalities
  FOR SELECT
  USING (worker_id = auth.uid());

CREATE POLICY "Workers can update their own formalities"
  ON public.job_formalities
  FOR UPDATE
  USING (worker_id = auth.uid());

CREATE POLICY "Employers can view formalities for their jobs"
  ON public.job_formalities
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can manage formalities for their jobs"
  ON public.job_formalities
  FOR ALL
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE employer_id = auth.uid()
    )
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_job_formalities_updated_at
  BEFORE UPDATE ON public.job_formalities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to track application status changes
CREATE OR REPLACE FUNCTION public.track_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.application_status_history (application_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_application_status_changes
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.track_application_status_change();

-- Create function to auto-create formalities entry when application is approved
CREATE OR REPLACE FUNCTION public.create_job_formalities_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'APPROVED' AND OLD.status != 'APPROVED') THEN
    INSERT INTO public.job_formalities (
      application_id,
      worker_id,
      job_id,
      visa_required,
      ecr_check_required,
      medical_exam_required,
      police_verification_required
    )
    VALUES (
      NEW.id,
      NEW.worker_id,
      NEW.job_id,
      true,
      true,
      true,
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_formalities_on_approval
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_job_formalities_on_approval();