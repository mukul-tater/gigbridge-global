export type WorkerStatus =
  | 'REGISTERED'
  | 'PROFILE_INCOMPLETE'
  | 'PROFILE_COMPLETED'
  | 'PASSPORT_AVAILABLE'
  | 'DOCUMENTS_VERIFIED'
  | 'JOB_READY'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'VISA_PROCESSING'
  | 'DEPLOYED';

export type ExperienceLevel =
  | 'FRESHER'
  | 'ONE_TO_THREE'
  | 'THREE_TO_FIVE'
  | 'FIVE_PLUS';

export type RegistrationSource = 'WEB' | 'MOBILE' | 'PARTNER';

export interface Worker {
  id: number;
  workerCode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  passwordHash: string;
  aadhaarNumber: string;
  stateId: number;
  districtId: number;
  primarySkillId: number;
  experienceLevel: ExperienceLevel;
  profileCompletionPercentage: number;
  registrationSource: RegistrationSource;
  status: WorkerStatus;
  createdDate: string;
  updatedDate: string;
}

export interface State {
  id: number;
  name: string;
}

export interface District {
  id: number;
  stateId: number;
  name: string;
}

export interface Skill {
  id: number;
  name: string;
}
