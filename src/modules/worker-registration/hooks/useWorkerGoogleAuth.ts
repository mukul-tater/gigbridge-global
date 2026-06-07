import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkerAuth } from '../context/WorkerAuthContext';
import { workerApi } from '../services/workerApi';

/** Handles Google OAuth callback on /login and completes worker session or redirects to register. */
export function useWorkerGoogleAuth() {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithGoogle } = useWorkerAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (isAuthenticated || handled.current) return;

    const returnPath = sessionStorage.getItem('worker_oauth_return');
    if (!returnPath) return;

    const completeOAuth = async () => {
      if (handled.current) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      handled.current = true;
      sessionStorage.removeItem('worker_oauth_return');

      const email = session.user.email;
      const fullName =
        (session.user.user_metadata?.full_name as string) ||
        (session.user.user_metadata?.name as string) ||
        email?.split('@')[0] ||
        'Worker';

      if (!email) {
        toast.error('Google account has no email. Use email registration instead.');
        await supabase.auth.signOut();
        return;
      }

      try {
        const result = await workerApi.googleAuth({ email, fullName });
        if ('needsRegistration' in result && result.needsRegistration) {
          sessionStorage.setItem(
            'worker_google_prefill',
            JSON.stringify({ email: result.email, fullName: result.fullName })
          );
          await supabase.auth.signOut();
          toast.info('Complete your worker registration to continue.');
          navigate('/register', { replace: true });
          return;
        }

        const loginResult = await loginWithGoogle(result);
        if (loginResult.success) {
          await supabase.auth.signOut();
          toast.success('Signed in with Google!');
          navigate('/home', { replace: true });
        } else {
          toast.error(loginResult.error || 'Google sign-in failed');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
        await supabase.auth.signOut();
      }
    };

    completeOAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        completeOAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [isAuthenticated, loginWithGoogle, navigate]);
}

/** Read and clear Google prefill data saved during OAuth redirect to /register. */
export function consumeGooglePrefill(): { email: string; fullName: string } | null {
  const raw = sessionStorage.getItem('worker_google_prefill');
  if (!raw) return null;
  sessionStorage.removeItem('worker_google_prefill');
  try {
    return JSON.parse(raw) as { email: string; fullName: string };
  } catch {
    return null;
  }
}
