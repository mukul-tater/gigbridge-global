-- E-Mitra partner application columns (safe to re-run)
-- Fixes: PGRST204 "Could not find the 'address_proof_url' column"

DO $$ BEGIN
  CREATE TYPE public.partner_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS emitra_id text,
  ADD COLUMN IF NOT EXISTS village_city text,
  ADD COLUMN IF NOT EXISTS has_computer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_scanner boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_printer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_internet boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS worker_categories text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS emitra_certificate_url text,
  ADD COLUMN IF NOT EXISTS address_proof_url text,
  ADD COLUMN IF NOT EXISTS owner_photo_url text,
  ADD COLUMN IF NOT EXISTS partner_code text,
  ADD COLUMN IF NOT EXISTS tier public.partner_tier DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS mobile_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS compliance_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS info_request_message text,
  ADD COLUMN IF NOT EXISTS no_jobs_promise boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_unauthorized_fees boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_incentives_earned numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workers_registered integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workers_placed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leaderboard_rank integer;

-- partner_code unique when set
CREATE UNIQUE INDEX IF NOT EXISTS partner_profiles_partner_code_key
  ON public.partner_profiles(partner_code)
  WHERE partner_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS partner_profiles_emitra_id_idx ON public.partner_profiles(emitra_id);

-- Allow partners to update draft / pending / rejected applications
DROP POLICY IF EXISTS "Partners can update own profile pre-approval" ON public.partner_profiles;
CREATE POLICY "Partners can update own profile pre-approval"
  ON public.partner_profiles FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND status IN ('applied', 'under_review', 'rejected')
  )
  WITH CHECK (auth.uid() = user_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
