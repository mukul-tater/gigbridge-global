-- Add contract expiry date column to job_formalities
ALTER TABLE public.job_formalities
ADD COLUMN contract_expiry_date date DEFAULT NULL;

-- Add reminder_sent flag to track if reminder was sent
ALTER TABLE public.job_formalities
ADD COLUMN contract_reminder_sent boolean DEFAULT false;

-- Create index for efficient querying of expiring contracts
CREATE INDEX idx_job_formalities_contract_expiry ON public.job_formalities(contract_expiry_date) WHERE contract_expiry_date IS NOT NULL AND contract_signed = false;