-- Allow a signed-in user to assign themselves an initial non-admin role
-- exactly once (used after OAuth sign-in when no role was set at signup).
CREATE OR REPLACE FUNCTION public.assign_initial_role(_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Never allow self-assigning the admin role.
  IF _role = 'admin'::app_role THEN
    RAISE EXCEPTION 'Cannot self-assign admin role';
  END IF;

  -- Only allow if the user has no existing role yet.
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_uid) THEN
    RAISE EXCEPTION 'Role already assigned';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, _role);

  -- Create role-specific profile row so downstream features work.
  IF _role = 'worker'::app_role THEN
    INSERT INTO public.worker_profiles (user_id) VALUES (v_uid)
    ON CONFLICT DO NOTHING;
  ELSIF _role = 'employer'::app_role THEN
    INSERT INTO public.employer_profiles (user_id) VALUES (v_uid)
    ON CONFLICT DO NOTHING;
  ELSIF _role = 'agent'::app_role THEN
    INSERT INTO public.agent_profiles (user_id) VALUES (v_uid)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.assign_initial_role(app_role) TO authenticated;