-- Create background verification requests table
CREATE TABLE IF NOT EXISTS public.background_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type text NOT NULL CHECK (verification_type IN ('identity', 'criminal_record', 'employment_history', 'education', 'reference_check', 'credit_check')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  result text CHECK (result IN ('passed', 'failed', 'inconclusive', null)),
  notes text,
  requested_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  documents_verified jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  payment_type text NOT NULL CHECK (payment_type IN ('job_posting_fee', 'worker_payment', 'verification_fee', 'platform_fee', 'escrow')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method text CHECK (payment_method IN ('credit_card', 'bank_transfer', 'paypal', 'stripe', null)),
  transaction_id text,
  description text,
  metadata jsonb,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for background_verifications
CREATE POLICY "Employers can view verifications they requested"
  ON public.background_verifications FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create verification requests"
  ON public.background_verifications FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their verification requests"
  ON public.background_verifications FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Workers can view their own verifications"
  ON public.background_verifications FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Admins can manage all verifications"
  ON public.background_verifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for payments
CREATE POLICY "Employers can view their payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Workers can view payments related to them"
  ON public.payments FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_background_verifications_employer ON public.background_verifications(employer_id);
CREATE INDEX idx_background_verifications_worker ON public.background_verifications(worker_id);
CREATE INDEX idx_background_verifications_status ON public.background_verifications(status);
CREATE INDEX idx_payments_employer ON public.payments(employer_id);
CREATE INDEX idx_payments_worker ON public.payments(worker_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Trigger for updated_at
CREATE TRIGGER update_background_verifications_updated_at
  BEFORE UPDATE ON public.background_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();