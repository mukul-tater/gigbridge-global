-- E-Mitra Partner Management Module

-- Partner tier enum
DO $$ BEGIN
  CREATE TYPE public.partner_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Partner worker lifecycle status
DO $$ BEGIN
  CREATE TYPE public.partner_worker_status AS ENUM (
    'registered', 'verified', 'shortlisted', 'interview_scheduled',
    'interviewed', 'selected', 'placed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Migration readiness category
DO $$ BEGIN
  CREATE TYPE public.migration_readiness_category AS ENUM (
    'placement_ready', 'needs_preparation', 'not_ready'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Incentive type
DO $$ BEGIN
  CREATE TYPE public.partner_incentive_type AS ENUM (
    'verified', 'interview_qualified', 'placement'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend partner_profiles with E-Mitra fields
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
  ADD COLUMN IF NOT EXISTS partner_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS tier public.partner_tier NOT NULL DEFAULT 'bronze',
  ADD COLUMN IF NOT EXISTS mobile_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS compliance_acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS info_request_message text,
  ADD COLUMN IF NOT EXISTS no_jobs_promise boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_unauthorized_fees boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_incentives_earned numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workers_registered integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workers_placed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leaderboard_rank integer;

CREATE INDEX IF NOT EXISTS partner_profiles_partner_code_idx ON public.partner_profiles(partner_code);
CREATE INDEX IF NOT EXISTS partner_profiles_emitra_id_idx ON public.partner_profiles(emitra_id);

-- Partner workers registered by E-Mitra operators
CREATE TABLE IF NOT EXISTS public.partner_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_profile_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  mobile text NOT NULL,
  whatsapp text,
  skill text NOT NULL,
  experience_level text NOT NULL,
  passport_available boolean DEFAULT false,
  preferred_country text,
  state text,
  district text,
  skill_level text,
  operator_notes text,
  ready_to_relocate boolean,
  family_consent boolean,
  previous_gcc_experience boolean,
  expected_salary numeric(12,2),
  migration_readiness_score integer DEFAULT 0,
  migration_category public.migration_readiness_category DEFAULT 'not_ready',
  photo_url text,
  video_url text,
  status public.partner_worker_status NOT NULL DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_workers_partner_idx ON public.partner_workers(partner_profile_id);
CREATE INDEX IF NOT EXISTS partner_workers_status_idx ON public.partner_workers(status);
CREATE INDEX IF NOT EXISTS partner_workers_skill_idx ON public.partner_workers(skill);

DROP TRIGGER IF EXISTS update_partner_workers_updated_at ON public.partner_workers;
CREATE TRIGGER update_partner_workers_updated_at
  BEFORE UPDATE ON public.partner_workers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Worker status timeline
CREATE TABLE IF NOT EXISTS public.partner_worker_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES public.partner_workers(id) ON DELETE CASCADE,
  status public.partner_worker_status NOT NULL,
  notes text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_worker_status_history_worker_idx
  ON public.partner_worker_status_history(worker_id);

-- Partner incentives ledger
CREATE TABLE IF NOT EXISTS public.partner_incentives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_profile_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.partner_workers(id) ON DELETE SET NULL,
  incentive_type public.partner_incentive_type NOT NULL,
  amount numeric(12,2) NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_incentives_partner_idx ON public.partner_incentives(partner_profile_id);

-- Partner activity feed
CREATE TABLE IF NOT EXISTS public.partner_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_profile_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS partner_activities_partner_idx ON public.partner_activities(partner_profile_id);

-- Generate unique partner code on approval
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_seq integer;
  v_code text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(partner_code FROM 5) AS integer)), 0) + 1
  INTO v_seq
  FROM public.partner_profiles
  WHERE partner_code ~ '^SWP-[0-9]+$';

  v_code := 'SWP-' || LPAD(v_seq::text, 5, '0');
  RETURN v_code;
END;
$$;

-- Compute partner tier from placements
CREATE OR REPLACE FUNCTION public.compute_partner_tier(p_placements integer)
RETURNS public.partner_tier LANGUAGE plpgsql AS $$
BEGIN
  IF p_placements >= 100 THEN RETURN 'platinum';
  ELSIF p_placements >= 30 THEN RETURN 'gold';
  ELSIF p_placements >= 10 THEN RETURN 'silver';
  ELSE RETURN 'bronze';
  END IF;
END;
$$;

-- Award incentive on worker status transitions
CREATE OR REPLACE FUNCTION public.handle_partner_worker_status_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_amount numeric(12,2);
  v_type public.partner_incentive_type;
  v_desc text;
  v_partner_user_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.partner_worker_status_history (worker_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Worker registered');
    UPDATE public.partner_profiles
    SET workers_registered = workers_registered + 1
    WHERE id = NEW.partner_profile_id;
    INSERT INTO public.partner_activities (partner_profile_id, activity_type, title, description, metadata)
    VALUES (NEW.partner_profile_id, 'worker_registered', 'New worker registered',
            NEW.full_name || ' registered as ' || NEW.skill,
            jsonb_build_object('worker_id', NEW.id, 'skill', NEW.skill));
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.partner_worker_status_history (worker_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status updated to ' || NEW.status::text);

    v_amount := NULL;
    v_type := NULL;
    v_desc := NULL;

    IF NEW.status = 'verified' THEN
      v_amount := 50; v_type := 'verified'; v_desc := 'Worker verification incentive';
    ELSIF NEW.status = 'interviewed' THEN
      v_amount := 100; v_type := 'interview_qualified'; v_desc := 'Interview qualified incentive';
    ELSIF NEW.status = 'placed' THEN
      v_amount := 750; v_type := 'placement'; v_desc := 'Successful placement incentive';
      UPDATE public.partner_profiles
      SET workers_placed = workers_placed + 1,
          tier = public.compute_partner_tier(workers_placed + 1)
      WHERE id = NEW.partner_profile_id;
    END IF;

    IF v_amount IS NOT NULL AND v_type IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.partner_incentives
        WHERE worker_id = NEW.id AND incentive_type = v_type
      ) THEN
        INSERT INTO public.partner_incentives (partner_profile_id, worker_id, incentive_type, amount, description)
        VALUES (NEW.partner_profile_id, NEW.id, v_type, v_amount, v_desc);

        UPDATE public.partner_profiles
        SET total_incentives_earned = total_incentives_earned + v_amount
        WHERE id = NEW.partner_profile_id;

        SELECT user_id INTO v_partner_user_id FROM public.partner_profiles WHERE id = NEW.partner_profile_id;

        IF v_partner_user_id IS NOT NULL THEN
          INSERT INTO public.notifications (user_id, type, title, message, is_read)
          VALUES (
            v_partner_user_id,
            'partner_incentive',
            'Incentive credited: ₹' || v_amount::text,
            v_desc || ' for ' || NEW.full_name,
            false
          );
        END IF;

        INSERT INTO public.partner_activities (partner_profile_id, activity_type, title, description, metadata)
        VALUES (NEW.partner_profile_id, 'incentive_credited', 'Incentive credited',
                '₹' || v_amount::text || ' — ' || v_desc,
                jsonb_build_object('worker_id', NEW.id, 'amount', v_amount, 'type', v_type));
      END IF;
    END IF;

    -- Notify partner on key milestones
    SELECT user_id INTO v_partner_user_id FROM public.partner_profiles WHERE id = NEW.partner_profile_id;
    IF v_partner_user_id IS NOT NULL AND NEW.status IN ('shortlisted', 'interview_scheduled', 'selected', 'placed') THEN
      INSERT INTO public.notifications (user_id, type, title, message, is_read)
      VALUES (
        v_partner_user_id,
        'partner_worker_status',
        CASE NEW.status
          WHEN 'shortlisted' THEN 'Worker shortlisted'
          WHEN 'interview_scheduled' THEN 'Interview scheduled'
          WHEN 'selected' THEN 'Worker selected'
          WHEN 'placed' THEN 'Placement completed'
          ELSE 'Worker status updated'
        END,
        NEW.full_name || ' — ' || NEW.status::text,
        false
      );
    END IF;

    INSERT INTO public.partner_activities (partner_profile_id, activity_type, title, description, metadata)
    VALUES (NEW.partner_profile_id, 'status_change', 'Worker status updated',
            NEW.full_name || ' → ' || NEW.status::text,
            jsonb_build_object('worker_id', NEW.id, 'status', NEW.status));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_worker_status_trigger ON public.partner_workers;
CREATE TRIGGER partner_worker_status_trigger
  AFTER INSERT OR UPDATE ON public.partner_workers
  FOR EACH ROW EXECUTE FUNCTION public.handle_partner_worker_status_change();

-- Auto-generate partner code when approved/active
CREATE OR REPLACE FUNCTION public.handle_partner_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF (NEW.status IN ('approved', 'active')) AND (OLD.status IS NULL OR OLD.status NOT IN ('approved', 'active')) THEN
    IF NEW.partner_code IS NULL THEN
      NEW.partner_code := public.generate_partner_code();
    END IF;
    IF NEW.reviewed_at IS NULL THEN
      NEW.reviewed_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_approval_trigger ON public.partner_profiles;
CREATE TRIGGER partner_approval_trigger
  BEFORE UPDATE ON public.partner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_partner_approval();

-- Storage bucket for partner worker media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-worker-media',
  'partner-worker-media',
  false,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.partner_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_worker_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_activities ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_workers TO authenticated;
GRANT SELECT ON public.partner_worker_status_history TO authenticated;
GRANT SELECT ON public.partner_incentives TO authenticated;
GRANT SELECT ON public.partner_activities TO authenticated;
GRANT ALL ON public.partner_workers TO service_role;
GRANT ALL ON public.partner_worker_status_history TO service_role;
GRANT ALL ON public.partner_incentives TO service_role;
GRANT ALL ON public.partner_activities TO service_role;

-- Partners manage their own workers
CREATE POLICY "Partners view own workers"
  ON public.partner_workers FOR SELECT TO authenticated
  USING (
    partner_profile_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Partners insert own workers"
  ON public.partner_workers FOR INSERT TO authenticated
  WITH CHECK (
    partner_profile_id IN (
      SELECT id FROM public.partner_profiles
      WHERE user_id = auth.uid() AND status IN ('approved', 'active')
    )
  );

CREATE POLICY "Partners update own workers"
  ON public.partner_workers FOR UPDATE TO authenticated
  USING (
    partner_profile_id IN (
      SELECT id FROM public.partner_profiles
      WHERE user_id = auth.uid() AND status IN ('approved', 'active')
    )
  )
  WITH CHECK (
    partner_profile_id IN (
      SELECT id FROM public.partner_profiles
      WHERE user_id = auth.uid() AND status IN ('approved', 'active')
    )
  );

CREATE POLICY "Admins manage all partner workers"
  ON public.partner_workers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Status history
CREATE POLICY "Partners view own worker history"
  ON public.partner_worker_status_history FOR SELECT TO authenticated
  USING (
    worker_id IN (
      SELECT pw.id FROM public.partner_workers pw
      JOIN public.partner_profiles pp ON pp.id = pw.partner_profile_id
      WHERE pp.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System insert worker history"
  ON public.partner_worker_status_history FOR INSERT TO authenticated
  WITH CHECK (true);

-- Incentives
CREATE POLICY "Partners view own incentives"
  ON public.partner_incentives FOR SELECT TO authenticated
  USING (
    partner_profile_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Activities
CREATE POLICY "Partners view own activities"
  ON public.partner_activities FOR SELECT TO authenticated
  USING (
    partner_profile_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Storage policies for partner-worker-media
CREATE POLICY "Partners upload worker media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-worker-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Partners read own worker media"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'partner-worker-media'
    AND (auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Partners update own worker media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'partner-worker-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
