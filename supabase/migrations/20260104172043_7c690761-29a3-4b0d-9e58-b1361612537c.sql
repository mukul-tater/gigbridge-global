-- Create contract_versions table to track contract amendments and history
CREATE TABLE public.contract_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formality_id UUID NOT NULL REFERENCES public.job_formalities(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  contract_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  change_summary TEXT,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_contract_versions_formality_id ON public.contract_versions(formality_id);

-- Enable RLS
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

-- Employers can manage contract versions for their jobs
CREATE POLICY "Employers can manage contract versions"
ON public.contract_versions
FOR ALL
USING (
  formality_id IN (
    SELECT jf.id FROM job_formalities jf
    JOIN jobs j ON jf.job_id = j.id
    WHERE j.employer_id = auth.uid()
  )
);

-- Workers can view contract versions for their formalities
CREATE POLICY "Workers can view their contract versions"
ON public.contract_versions
FOR SELECT
USING (
  formality_id IN (
    SELECT id FROM job_formalities
    WHERE worker_id = auth.uid()
  )
);

-- Function to set previous versions as not current when new version is added
CREATE OR REPLACE FUNCTION public.update_contract_version_current()
RETURNS TRIGGER AS $$
BEGIN
  -- Set all previous versions of this contract as not current
  UPDATE public.contract_versions
  SET is_current = false
  WHERE formality_id = NEW.formality_id AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update is_current on new version insert
CREATE TRIGGER set_contract_version_current
AFTER INSERT ON public.contract_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_contract_version_current();