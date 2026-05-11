
-- 1. Harden handle_new_user to block admin self-assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name text;
  v_avatar_url text;
  v_phone text;
  v_role text;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone);
  v_role := NEW.raw_user_meta_data->>'role';

  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url)
  VALUES (NEW.id, NEW.email, v_full_name, v_phone, v_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  -- Only allow self-assignment of non-admin roles. Silently ignore admin
  -- attempts so signup still succeeds without privilege escalation.
  IF v_role IS NOT NULL AND v_role IN ('worker', 'employer', 'agent') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_role::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    IF v_role = 'employer' THEN
      INSERT INTO public.employer_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSIF v_role = 'worker' THEN
      INSERT INTO public.worker_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    ELSIF v_role = 'agent' THEN
      INSERT INTO public.agent_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2. Tighten work_experience reads
DROP POLICY IF EXISTS "Authenticated users can view work experience" ON public.work_experience;

CREATE POLICY "Workers view their own experience"
ON public.work_experience FOR SELECT TO authenticated
USING (auth.uid() = worker_id);

CREATE POLICY "Admins view all work experience"
ON public.work_experience FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employers view applicant work experience"
ON public.work_experience FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.job_applications ja
  WHERE ja.worker_id = work_experience.worker_id
    AND ja.employer_id = auth.uid()
));

-- 3. Tighten worker_skills reads
DROP POLICY IF EXISTS "Authenticated users can view skills" ON public.worker_skills;
DROP POLICY IF EXISTS "Authenticated users can view worker skills" ON public.worker_skills;

CREATE POLICY "Workers view their own skills"
ON public.worker_skills FOR SELECT TO authenticated
USING (auth.uid() = worker_id);

CREATE POLICY "Admins view all worker skills"
ON public.worker_skills FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employers view applicant skills"
ON public.worker_skills FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.job_applications ja
  WHERE ja.worker_id = worker_skills.worker_id
    AND ja.employer_id = auth.uid()
));

-- 4. Tighten worker_certifications reads
DROP POLICY IF EXISTS "Authenticated users can view certifications" ON public.worker_certifications;

CREATE POLICY "Workers view their own certifications"
ON public.worker_certifications FOR SELECT TO authenticated
USING (auth.uid() = worker_id);

CREATE POLICY "Admins view all certifications"
ON public.worker_certifications FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employers view applicant certifications"
ON public.worker_certifications FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.job_applications ja
  WHERE ja.worker_id = worker_certifications.worker_id
    AND ja.employer_id = auth.uid()
));

-- 5. Lock down notifications insert
DROP POLICY IF EXISTS "Authenticated users can receive notifications" ON public.notifications;

CREATE POLICY "Users insert notifications for themselves"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins insert notifications for anyone"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 6. Notes length validation
CREATE OR REPLACE FUNCTION public.validate_notes_length()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.notes IS NOT NULL AND length(NEW.notes) > 2000 THEN
    RAISE EXCEPTION 'Notes must be 2000 characters or fewer';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_job_application_notes ON public.job_applications;
CREATE TRIGGER validate_job_application_notes
BEFORE INSERT OR UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.validate_notes_length();

DROP TRIGGER IF EXISTS validate_shortlist_notes ON public.shortlisted_workers;
CREATE TRIGGER validate_shortlist_notes
BEFORE INSERT OR UPDATE ON public.shortlisted_workers
FOR EACH ROW EXECUTE FUNCTION public.validate_notes_length();
