import type {
  SendOtpResponse,
  VerifyOtpResponse,
  WorkerAuthResponse,
  WorkerRegisterPayload,
} from '../types/worker.types';

const OTP_SENT_KEY = 'safework_mock_otp_sent';
const OTP_TOKEN_KEY = 'safework_mock_otp_token';
const TOKEN_TTL_MS = 15 * 60 * 1000;

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, '');
}

function randomToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function validationError(message: string, field: string): never {
  const err = new Error(message) as Error & { errors?: Record<string, string[]> };
  err.errors = { [field]: [message] };
  throw err;
}

export const mockWorkerPortal = {
  sendOtp(mobileNumber: string): SendOtpResponse {
    const mobile = normalizeMobile(mobileNumber);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      validationError('Invalid mobile number', 'mobileNumber');
    }

    sessionStorage.setItem(OTP_SENT_KEY, JSON.stringify({ mobile, sentAt: Date.now() }));
    sessionStorage.removeItem(OTP_TOKEN_KEY);

    return {
      demo: true,
      message: 'OTP sent (demo mode — enter any 6 digits)',
    };
  },

  verifyOtp(mobileNumber: string, otp: string): VerifyOtpResponse {
    const mobile = normalizeMobile(mobileNumber);
    const code = otp.replace(/\D/g, '');

    if (!/^[6-9]\d{9}$/.test(mobile) || code.length !== 6) {
      validationError('Invalid OTP', 'otp');
    }

    const raw = sessionStorage.getItem(OTP_SENT_KEY);
    if (!raw) {
      validationError('OTP expired or not requested. Tap Send OTP again.', 'otp');
    }

    const sent = JSON.parse(raw) as { mobile: string };
    if (sent.mobile !== mobile) {
      validationError('OTP expired or not requested. Tap Send OTP again.', 'otp');
    }

    const otpToken = randomToken();
    sessionStorage.setItem(
      OTP_TOKEN_KEY,
      JSON.stringify({ mobile, otpToken, expiresAt: Date.now() + TOKEN_TTL_MS }),
    );
    sessionStorage.removeItem(OTP_SENT_KEY);

    return { otpToken, expiresInSeconds: TOKEN_TTL_MS / 1000 };
  },

  register(payload: WorkerRegisterPayload): WorkerAuthResponse {
    const mobile = normalizeMobile(payload.mobileNumber);
    const raw = sessionStorage.getItem(OTP_TOKEN_KEY);

    if (!raw) {
      validationError('Mobile verification expired', 'mobileNumber');
    }

    const tokenState = JSON.parse(raw) as { mobile: string; otpToken: string; expiresAt: number };
    if (
      tokenState.otpToken !== payload.otpToken ||
      tokenState.mobile !== mobile ||
      tokenState.expiresAt < Date.now()
    ) {
      validationError('Mobile verification expired', 'mobileNumber');
    }

    if (payload.password !== payload.confirmPassword) {
      validationError('Passwords do not match', 'confirmPassword');
    }

    sessionStorage.removeItem(OTP_TOKEN_KEY);

    const email = payload.email.trim().toLowerCase();
    const workerId = Math.abs([...mobile].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)) % 1_000_000 || 1;
    const fullName = payload.fullName.trim();

    return {
      token: randomToken(),
      worker: {
        id: workerId,
        workerCode: `WRK-${String(workerId).padStart(6, '0')}`,
        fullName,
        email,
        mobileNumber: mobile,
        aadhaarNumber: 'PENDING',
        stateId: 0,
        stateName: '',
        districtId: 0,
        districtName: '',
        primarySkillId: 0,
        primarySkillName: '',
        experienceLevel: 'FRESHER',
        profileCompletionPercentage: 10,
        registrationSource: 'WEB',
        status: 'PROFILE_INCOMPLETE',
        onboardingCompleted: false,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    };
  },
};
