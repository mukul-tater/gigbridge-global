
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_currency_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_currency_check
  CHECK (currency = ANY (ARRAY['INR','USD','EUR','GBP','AED','SAR','QAR','KWD','OMR','BHD']::text[]));
