-- Partners approved/active can acknowledge compliance via direct profile update (no RPC)

DROP POLICY IF EXISTS "Partners can update own operational profile" ON public.partner_profiles;
CREATE POLICY "Partners can update own operational profile"
  ON public.partner_profiles FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND status IN ('approved', 'active')
  )
  WITH CHECK (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
