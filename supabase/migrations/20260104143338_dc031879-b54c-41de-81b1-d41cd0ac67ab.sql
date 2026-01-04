-- Create a default admin user for the system
-- Note: This creates the admin user with a temporary password that should be changed

-- Insert admin user into auth.users using Supabase's auth system
-- The admin will need to sign up through the auth flow, so we'll create a function
-- to assign admin role to a specific email when they sign up

CREATE OR REPLACE FUNCTION public.handle_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check if user email is admin email and assign admin role
  IF NEW.email = 'admin@safeworkglobal.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to handle admin user on signup
DROP TRIGGER IF EXISTS on_admin_user_created ON auth.users;
CREATE TRIGGER on_admin_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_user();