-- Grant admin role to demo admin (run after creating account at /admin/register)

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = 'admin@safeworkglobal.demo'
ON CONFLICT (user_id, role) DO NOTHING;
