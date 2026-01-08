-- Add escrow-specific columns to payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS gross_amount numeric,
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_percentage numeric DEFAULT 1,
ADD COLUMN IF NOT EXISTS net_amount numeric,
ADD COLUMN IF NOT EXISTS escrow_status text DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS released_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS released_by uuid;

-- Add constraint for escrow status
ALTER TABLE public.payments
ADD CONSTRAINT payments_escrow_status_check 
CHECK (escrow_status IN ('PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'CANCELLED'));

-- Create index for faster escrow queries
CREATE INDEX IF NOT EXISTS idx_payments_escrow_status ON public.payments(escrow_status);
CREATE INDEX IF NOT EXISTS idx_payments_employer_escrow ON public.payments(employer_id, escrow_status);