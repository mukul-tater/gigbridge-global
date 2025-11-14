-- Drop the existing check constraint
ALTER TABLE public.job_applications
DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Add the updated check constraint with APPROVED status
ALTER TABLE public.job_applications
ADD CONSTRAINT job_applications_status_check
CHECK (status = ANY (ARRAY[
  'PENDING'::text,
  'REVIEWING'::text,
  'SHORTLISTED'::text,
  'INTERVIEWED'::text,
  'APPROVED'::text,
  'OFFERED'::text,
  'HIRED'::text,
  'REJECTED'::text
]));