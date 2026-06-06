-- Notify all admins when a partner submits (or re-submits) an application.

CREATE OR REPLACE FUNCTION public.notify_admins_partner_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.submitted_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.submitted_at IS DISTINCT FROM NEW.submitted_at) THEN
    INSERT INTO public.notifications (user_id, type, title, message, is_read)
    SELECT
      ur.user_id,
      'partner_application',
      'New partner application',
      COALESCE(NEW.center_name, NEW.owner_name, 'An E-Mitra partner')
        || ' submitted an application for review.',
      false
    FROM public.user_roles ur
    WHERE ur.role = 'admin';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_submitted_notify_admins ON public.partner_profiles;
CREATE TRIGGER partner_submitted_notify_admins
  AFTER INSERT OR UPDATE OF submitted_at, status ON public.partner_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_partner_submitted();
