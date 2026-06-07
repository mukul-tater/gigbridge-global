-- Draft storage for in-progress E-Mitra worker registrations

CREATE TABLE IF NOT EXISTS public.partner_worker_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_profile_id uuid NOT NULL REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 0,
  draft_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  photo_url text,
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS partner_worker_drafts_partner_user_idx
  ON public.partner_worker_drafts(partner_profile_id, user_id);

DROP TRIGGER IF EXISTS update_partner_worker_drafts_updated_at ON public.partner_worker_drafts;
CREATE TRIGGER update_partner_worker_drafts_updated_at
  BEFORE UPDATE ON public.partner_worker_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.partner_worker_drafts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_worker_drafts TO authenticated;
GRANT ALL ON public.partner_worker_drafts TO service_role;

DROP POLICY IF EXISTS "Partners manage own worker drafts" ON public.partner_worker_drafts;
CREATE POLICY "Partners manage own worker drafts"
  ON public.partner_worker_drafts FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    AND partner_profile_id IN (
      SELECT id FROM public.partner_profiles
      WHERE user_id = auth.uid() AND status IN ('approved', 'active')
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    AND partner_profile_id IN (
      SELECT id FROM public.partner_profiles
      WHERE user_id = auth.uid() AND status IN ('approved', 'active')
    )
  );

DROP POLICY IF EXISTS "Admins manage worker drafts" ON public.partner_worker_drafts;
CREATE POLICY "Admins manage worker drafts"
  ON public.partner_worker_drafts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

NOTIFY pgrst, 'reload schema';
