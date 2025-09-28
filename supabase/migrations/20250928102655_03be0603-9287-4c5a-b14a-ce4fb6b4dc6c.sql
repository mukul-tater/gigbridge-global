-- Fix security warnings detected after the previous migration

-- Fix function search paths for the newly created functions
DROP FUNCTION IF EXISTS public.get_signed_document_url(uuid, integer);
DROP FUNCTION IF EXISTS public.mask_pan(text);
DROP FUNCTION IF EXISTS public.mask_aadhaar(text);

-- Recreate functions with proper search_path
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

CREATE OR REPLACE FUNCTION public.mask_pan(pan_number text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
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
SET search_path = public
AS $$
BEGIN
  IF aadhaar_number IS NULL OR length(aadhaar_number) < 4 THEN
    RETURN 'XXXX-XXXX-XXXX';
  END IF;
  
  RETURN 'XXXX-XXXX-' || right(aadhaar_number, 4);
END;
$$;