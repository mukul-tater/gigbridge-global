-- Critical Security Fixes

-- 1. Make onboarding-documents bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'onboarding-documents';

-- 2. Add RLS policies for contracts table
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Contracts: Workers can view their own contracts
CREATE POLICY "Workers can view their own contracts" 
ON public.contracts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM worker_profiles 
    WHERE worker_profiles.id = contracts.worker_id 
    AND worker_profiles.user_id = auth.uid()
  )
);

-- Contracts: Employers can view contracts for their jobs
CREATE POLICY "Employers can view their job contracts" 
ON public.contracts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE jp.id = contracts.job_id 
    AND ep.user_id = auth.uid()
  )
);

-- Contracts: Employers can insert contracts for their jobs
CREATE POLICY "Employers can create contracts for their jobs" 
ON public.contracts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE jp.id = contracts.job_id 
    AND ep.user_id = auth.uid()
  )
);

-- Contracts: Allow updates for contract signing
CREATE POLICY "Parties can update contract signatures" 
ON public.contracts 
FOR UPDATE 
USING (
  -- Worker can sign their contract
  (EXISTS (
    SELECT 1 FROM worker_profiles 
    WHERE worker_profiles.id = contracts.worker_id 
    AND worker_profiles.user_id = auth.uid()
  )) OR
  -- Employer can sign their contract
  (EXISTS (
    SELECT 1 FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE jp.id = contracts.job_id 
    AND ep.user_id = auth.uid()
  ))
);

-- 3. Add RLS policies for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = payer_id OR auth.uid() = payee_id);

CREATE POLICY "Users can create payments they are paying for" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = payer_id);

-- 4. Add RLS policies for job_skills table
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can manage skills for their jobs" 
ON public.job_skills 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE jp.id = job_skills.job_id 
    AND ep.user_id = auth.uid()
  )
);

CREATE POLICY "Workers can view job skills for published jobs" 
ON public.job_skills 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM job_postings 
    WHERE job_postings.id = job_skills.job_id 
    AND job_postings.status = 'published'
  )
);

-- 5. Add RLS policies for onboarding_audit_logs table
ALTER TABLE public.onboarding_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs" 
ON public.onboarding_audit_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Add function to generate signed URLs for documents
CREATE OR REPLACE FUNCTION public.get_signed_document_url(
  document_id uuid,
  expires_in_seconds integer DEFAULT 600
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_record worker_onboarding_documents%ROWTYPE;
  signed_url text;
BEGIN
  -- Get document record and verify access
  SELECT * INTO doc_record
  FROM worker_onboarding_documents 
  WHERE id = document_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Check if user has access to this document
  IF NOT EXISTS (
    SELECT 1 FROM worker_onboarding 
    WHERE id = doc_record.onboarding_id 
    AND user_id = auth.uid()
  ) AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NULL;
  END IF;
  
  -- Generate signed URL (this would need to be implemented with actual storage provider)
  -- For now, return a placeholder that indicates secure access is required
  RETURN '/api/documents/' || document_id || '/download';
END;
$$;

-- 7. Add function to mask PII data
CREATE OR REPLACE FUNCTION public.mask_pan(pan_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF pan_number IS NULL OR length(pan_number) < 4 THEN
    RETURN 'XXXXXXXXXX';
  END IF;
  
  RETURN 'XXXXXX' || right(pan_number, 4);
END;
$$;

CREATE OR REPLACE FUNCTION public.mask_aadhaar(aadhaar_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF aadhaar_number IS NULL OR length(aadhaar_number) < 4 THEN
    RETURN 'XXXX-XXXX-XXXX';
  END IF;
  
  RETURN 'XXXX-XXXX-' || right(aadhaar_number, 4);
END;
$$;