export interface WorkerOnboarding {
  id: number;
  workerId: number;
  dateOfBirth: string | null;
  gender: string | null;
  email: string | null;
  address: string | null;
  pincode: string | null;
  secondarySkillIds: number[];
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
  createdDate: string;
  updatedDate: string;
}
