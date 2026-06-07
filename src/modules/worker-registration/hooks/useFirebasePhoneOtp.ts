import { useCallback, useRef } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

function mapFirebaseAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  const message = err instanceof Error ? err.message : 'Failed to send OTP';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled in Firebase. Enable Phone provider in Firebase Console.';
    case 'auth/invalid-phone-number':
      return 'Invalid mobile number. Use a valid 10-digit Indian number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/invalid-app-credential':
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Refresh the page and try again.';
    case 'auth/code-expired':
      return 'OTP expired. Tap Send OTP again.';
    case 'auth/invalid-verification-code':
      return 'Invalid OTP. Check the code and try again.';
    case 'auth/missing-verification-code':
      return 'Enter the 6-digit OTP.';
    default:
      return message;
  }
}

export function useFirebasePhoneOtp() {
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const resetRecaptcha = useCallback(() => {
    recaptchaRef.current?.clear();
    recaptchaRef.current = null;
    confirmationRef.current = null;
  }, []);

  const ensureRecaptcha = useCallback(async (containerId: string) => {
    if (recaptchaRef.current) {
      return recaptchaRef.current;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error('reCAPTCHA container not found');
    }

    const auth = getFirebaseAuth();
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });

    await verifier.render();
    recaptchaRef.current = verifier;
    return verifier;
  }, []);

  const sendOtp = useCallback(
    async (mobileNumber: string, recaptchaContainerId = 'worker-recaptcha') => {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not configured');
      }

      resetRecaptcha();
      const auth = getFirebaseAuth();
      const verifier = await ensureRecaptcha(recaptchaContainerId);
      const phone = mobileNumber.startsWith('+') ? mobileNumber : `+91${mobileNumber}`;

      try {
        confirmationRef.current = await signInWithPhoneNumber(auth, phone, verifier);
      } catch (err) {
        resetRecaptcha();
        throw new Error(mapFirebaseAuthError(err));
      }
    },
    [ensureRecaptcha, resetRecaptcha]
  );

  const verifyOtp = useCallback(
    async (otp: string): Promise<string> => {
      if (!confirmationRef.current) {
        throw new Error('Request OTP first');
      }

      try {
        const credential = await confirmationRef.current.confirm(otp);
        const idToken = await credential.user.getIdToken();
        resetRecaptcha();
        return idToken;
      } catch (err) {
        throw new Error(mapFirebaseAuthError(err));
      }
    },
    [resetRecaptcha]
  );

  return {
    isAvailable: isFirebaseConfigured(),
    sendOtp,
    verifyOtp,
    resetRecaptcha,
  };
}
