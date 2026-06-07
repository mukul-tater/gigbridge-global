-- E-Mitra partner_workers module (safe to re-run on production)

DO $$ BEGIN
  CREATE TYPE public.partner_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.partner_worker_status AS ENUM (
    'registered', 'verified', 'shortlisted', 'interview_scheduled',
    'interviewed', 'selected', 'placed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.migration_readiness_category AS ENUM (
    'placement_ready', 'needs_preparation', 'not_ready'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.partner_incentive_type AS ENUM (
    'verified', 'interview_qualified', 'placement'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- updated_at trigger
DROP TRIGGER IF EXISTS update_partner_workers_updated_at ON public.partner_workers;
CREATE TRIGGER update_partner_workers_updated_at
  BEFORE UPDATE ON public.partner_workers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_seq integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(partner_code FROM 5) AS integer)), 0) + 1
  INTO v_seq
  FROM public.partner_profiles
  WHERE partner_code ~ '^SWP-[0-9]+$';
  RETURN 'SWP-' || LPAD(v_seq::text, 5, '0');
END;
$$;

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
    SET workers_registered = COALESCE(workers_registered, 0) + 1
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
      SET workers_placed = COALESCE(workers_placed, 0) + 1
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
        SET total_incentives_earned = COALESCE(total_incentives_earned, 0) + v_amount
        WHERE id = NEW.partner_profile_id;

        SELECT user_id INTO v_partner_user_id FROM public.partner_profiles WHERE id = NEW.partner_profile_id;
        IF v_partner_user_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'notifications'
        ) THEN
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

    SELECT user_id INTO v_partner_user_id FROM public.partner_profiles WHERE id = NEW.partner_profile_id;
    IF v_partner_user_id IS NOT NULL
      AND NEW.status IN ('shortlisted', 'interview_scheduled', 'selected', 'placed')
      AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'notifications'
      ) THEN
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

-- Partner profile counter columns (if missing)
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS workers_registered integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS workers_placed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_incentives_earned numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.partner_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_worker_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_activities ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_workers TO authenticated;
GRANT SELECT, INSERT ON public.partner_worker_status_history TO authenticated;
GRANT SELECT ON public.partner_incentives TO authenticated;
GRANT SELECT ON public.partner_activities TO authenticated;
GRANT ALL ON public.partner_workers TO service_role;
GRANT ALL ON public.partner_worker_status_history TO service_role;
GRANT ALL ON public.partner_incentives TO service_role;
GRANT ALL ON public.partner_activities TO service_role;

DROP POLICY IF EXISTS "Partners view own workers" ON public.partner_workers;
DROP POLICY IF EXISTS "Partners insert own workers" ON public.partner_workers;
DROP POLICY IF EXISTS "Partners update own workers" ON public.partner_workers;
DROP POLICY IF EXISTS "Admins manage all partner workers" ON public.partner_workers;

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

DROP POLICY IF EXISTS "Partners view own worker history" ON public.partner_worker_status_history;
DROP POLICY IF EXISTS "System insert worker history" ON public.partner_worker_status_history;

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

DROP POLICY IF EXISTS "Partners view own incentives" ON public.partner_incentives;

CREATE POLICY "Partners view own incentives"
  ON public.partner_incentives FOR SELECT TO authenticated
  USING (
    partner_profile_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

DROP POLICY IF EXISTS "Partners view own activities" ON public.partner_activities;

CREATE POLICY "Partners view own activities"
  ON public.partner_activities FOR SELECT TO authenticated
  USING (
    partner_profile_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

NOTIFY pgrst, 'reload schema';
