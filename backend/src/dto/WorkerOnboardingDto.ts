export interface WorkerOnboardingResponseDto {
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

export interface SaveOnboardingStepDto {
  step: 1 | 2 | 3;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  address?: string;
  pincode?: string;
  secondarySkillIds?: number[];
  previousEmployer?: string;
  hasPassport?: boolean;
  passportNumber?: string;
  ecrStatus?: string;
  preferredCountries?: string[];
  availability?: string;
  openToRelocation?: boolean;
  expectedSalaryMin?: number;
  expectedSalaryCurrency?: string;
  languages?: string[];
}

export interface OnboardingCompleteResponseDto {
  worker: import('./WorkerDto.js').WorkerProfileResponseDto;
  onboarding: WorkerOnboardingResponseDto;
}
