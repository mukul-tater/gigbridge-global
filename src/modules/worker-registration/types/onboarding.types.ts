export interface WorkerOnboardingData {
  workerId: number;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  address: string | null;
  pincode: string | null;
  secondarySkillIds: number[];
  secondarySkillNames: string[];
  previousEmployer: string | null;
  hasPassport: boolean;
  passportNumber: string | null;
  ecrStatus: string | null;
  preferredCountries: string[];
  availability: string | null;
  openToRelocation: boolean;
  expectedSalaryMin: number | null;
  expectedSalaryCurrency: string;
  languages: string[];
  currentStep: number;
  onboardingCompleted: boolean;
}

export interface OnboardingCompleteResult {
  worker: import('./worker.types').WorkerProfile;
  onboarding: WorkerOnboardingData;
}

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const ECR_OPTIONS = [
  { value: 'ECR', label: 'ECR (Emigration Check Required)' },
  { value: 'ECNR', label: 'ECNR (Emigration Check Not Required)' },
  { value: 'NOT_CHECKED', label: 'Not checked yet' },
] as const;

export const AVAILABILITY_OPTIONS = [
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: 'WITHIN_15_DAYS', label: 'Within 15 days' },
  { value: 'WITHIN_30_DAYS', label: 'Within 30 days' },
  { value: 'WITHIN_60_DAYS', label: 'Within 60 days' },
] as const;

export const SALARY_CURRENCIES = [
  { value: 'INR', label: '₹ INR' },
  { value: 'AED', label: 'AED' },
  { value: 'SAR', label: 'SAR' },
  { value: 'QAR', label: 'QAR' },
  { value: 'USD', label: '$ USD' },
] as const;

export const PREFERRED_COUNTRIES = [
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
  'Malaysia', 'Singapore', 'Japan', 'South Korea', 'Canada', 'Australia',
] as const;

export const LANGUAGE_OPTIONS = [
  'Hindi', 'English', 'Arabic', 'Tamil', 'Telugu', 'Malayalam',
  'Bengali', 'Punjabi', 'Marathi', 'Urdu', 'Nepali', 'Tagalog',
] as const;

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Personal Details' },
  { id: 2, title: 'Work & Documents' },
  { id: 3, title: 'Job Preferences' },
] as const;
