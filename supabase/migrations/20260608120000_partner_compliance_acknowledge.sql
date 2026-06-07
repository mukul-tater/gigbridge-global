-- Allow approved/active partners to acknowledge compliance (RLS blocks direct UPDATE once approved)

CREATE OR REPLACE FUNCTION public.acknowledge_partner_compliance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_updated integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.partner_profiles
  SET compliance_acknowledged_at = now(),
      updated_at = now()
  WHERE user_id = v_uid
    AND status IN ('approved', 'active');

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    RAISE EXCEPTION 'No approved partner profile found for this account';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.acknowledge_partner_compliance() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acknowledge_partner_compliance() TO authenticated;
