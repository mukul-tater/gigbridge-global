import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'node:fs';
import { ValidationException } from '../exception/AppException.js';

let initialized = false;

function getApiKey(): string | undefined {
  return process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
}

function getProjectId(): string | undefined {
  return process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
}

function loadServiceAccountFromFile(): admin.ServiceAccount | null {
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!path || !existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as admin.ServiceAccount;
  } catch {
    return null;
  }
}

function hasServiceAccountEnv(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

function ensureAdminInitialized(): boolean {
  if (initialized) return true;

  const fileAccount = loadServiceAccountFromFile();
  if (fileAccount) {
    admin.initializeApp({ credential: admin.credential.cert(fileAccount) });
    initialized = true;
    return true;
  }

  if (hasServiceAccountEnv()) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    });
    initialized = true;
    return true;
  }

  return false;
}

export function isFirebaseAdminConfigured(): boolean {
  return ensureAdminInitialized() || Boolean(getApiKey() && getProjectId());
}

/** Normalize Firebase phone (+91XXXXXXXXXX) to 10-digit Indian mobile. */
export function normalizeIndianMobile(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    const local = digits.slice(2);
    return /^[6-9]\d{9}$/.test(local) ? local : null;
  }
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

async function verifyViaIdentityToolkit(idToken: string): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new ValidationException({
      idToken: ['Firebase API key is not configured on the server'],
    });
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  const body = (await response.json()) as {
    users?: { phoneNumber?: string }[];
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new ValidationException({
      idToken: [body.error?.message || 'Invalid or expired Firebase token'],
    });
  }

  const phoneNumber = body.users?.[0]?.phoneNumber;
  if (!phoneNumber) {
    throw new ValidationException({
      idToken: ['Phone number not verified in Firebase token'],
    });
  }

  return phoneNumber;
}

async function verifyViaAdminSdk(idToken: string): Promise<string> {
  let decoded: admin.auth.DecodedIdToken;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch {
    throw new ValidationException({ idToken: ['Invalid or expired Firebase token'] });
  }

  if (!decoded.phone_number) {
    throw new ValidationException({ idToken: ['Phone number not verified in Firebase token'] });
  }

  return decoded.phone_number;
}

export async function verifyPhoneIdToken(
  idToken: string,
  expectedMobile: string
): Promise<void> {
  const expected = normalizeIndianMobile(expectedMobile);
  if (!expected) {
    throw new ValidationException({ mobileNumber: ['Enter a valid 10-digit mobile number'] });
  }

  const phoneNumber = ensureAdminInitialized()
    ? await verifyViaAdminSdk(idToken)
    : await verifyViaIdentityToolkit(idToken);

  const tokenMobile = normalizeIndianMobile(phoneNumber);
  if (!tokenMobile || tokenMobile !== expected) {
    throw new ValidationException({
      mobileNumber: ['Verified phone does not match the number you entered'],
    });
  }
}
