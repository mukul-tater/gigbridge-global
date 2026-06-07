import { lovable } from '@/integrations/lovable';

type OAuthProvider = 'google' | 'apple' | 'microsoft';

export interface GoogleAuthResult {
  error: Error | null;
  redirected?: boolean;
}

/** Lovable-managed Google OAuth — works on Lovable preview & published apps. */
export async function signInWithGoogle(
  provider: OAuthProvider = 'google',
  opts?: { redirect_uri?: string }
): Promise<GoogleAuthResult> {
  const result = await lovable.auth.signInWithOAuth(provider, {
    redirect_uri: opts?.redirect_uri,
  });

  if (result.error) {
    return { error: result.error };
  }

  if (result.redirected) {
    return { error: null, redirected: true };
  }

  return { error: null };
}
