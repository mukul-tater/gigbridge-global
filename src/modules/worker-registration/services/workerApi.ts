import type {
  ApiResponse,
  District,
  Skill,
  State,
  WorkerAuthResponse,
  WorkerLoginPayload,
  WorkerGoogleAuthPayload,
  WorkerGoogleAuthResponse,
  WorkerProfile,
  WorkerRegisterPayload,
} from '../types/worker.types';
import type { OnboardingCompleteResult, WorkerOnboardingData } from '../types/onboarding.types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const body = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !body.success) {
    const message = body.message || 'Request failed';
    const error = new Error(message) as Error & { errors?: Record<string, string[]> };
    error.errors = body.errors;
    throw error;
  }

  return body.data as T;
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export const workerApi = {
  getReferenceData(): Promise<{ states: State[]; skills: Skill[] }> {
    return request('/workers/reference-data');
  },

  getDistricts(stateId: number): Promise<District[]> {
    return request(`/workers/districts/${stateId}`);
  },

  register(payload: WorkerRegisterPayload): Promise<WorkerAuthResponse> {
    return request('/workers/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload: WorkerLoginPayload): Promise<WorkerAuthResponse> {
    return request('/workers/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  googleAuth(payload: WorkerGoogleAuthPayload): Promise<WorkerGoogleAuthResponse> {
    return request('/workers/google-auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getProfile(id: number, token: string): Promise<WorkerProfile> {
    return request(`/workers/profile/${id}`, {
      headers: authHeaders(token),
    });
  },

  getOnboarding(token: string): Promise<WorkerOnboardingData> {
    return request('/workers/onboarding', { headers: authHeaders(token) });
  },

  saveOnboardingStep(token: string, payload: Record<string, unknown>): Promise<WorkerOnboardingData> {
    return request('/workers/onboarding/step', {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },

  completeOnboarding(token: string, payload: Record<string, unknown>): Promise<OnboardingCompleteResult> {
    return request('/workers/onboarding/complete', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
  },
};
