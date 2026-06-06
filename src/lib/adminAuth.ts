import { supabase } from '@/integrations/supabase/client';

export const WHITELISTED_ADMIN_EMAILS = [
  'admin@safeworkglobal.com',
  'ops@safeworkglobal.com',
  'admin@safeworkglobal.demo',
] as const;

export function isWhitelistedAdminEmail(email: string): boolean {
  return WHITELISTED_ADMIN_EMAILS.includes(
    email.trim().toLowerCase() as (typeof WHITELISTED_ADMIN_EMAILS)[number],
  );
}

async function hasAdminRole(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  return !!data;
}

export async function ensureAdminAccess(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Authentication failed.' };
  }

  if (!isWhitelistedAdminEmail(user.email ?? '')) {
    return { ok: false, error: 'This account is not an administrator.' };
  }

  const { data: ensured, error } = await supabase.rpc('ensure_whitelisted_admin');

  if (!error && ensured) {
    return { ok: true };
  }

  if (await hasAdminRole(user.id)) {
    return { ok: true };
  }

  const missingFn =
    error &&
    /could not find the function|function public.ensure_whitelisted_admin|PGRST202/i.test(error.message);

  if (missingFn) {
    return {
      ok: false,
      error:
        'Admin database setup is incomplete. Run scripts/fix-admin-login.sql in Supabase SQL Editor, then try again.',
    };
  }

  return {
    ok: false,
    error: error?.message || 'This account is not an administrator.',
  };
}
