// User and Auth Types
export type UserRole = 'ADMIN' | 'EMPLOYER' | 'WORKER';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  mobile: string;
  passwordHash: string;
  avatarUrl?: string;
}

// Worker Types
export type InsuranceStatus = 'LIVE' | 'RUNNING' | 'EXPIRED';

export interface PersonalDetails {
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BankAccount {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  personalDetails: PersonalDetails;
  kycVerified: boolean;
  kycVerifiedAt: string | null;
  passportVerified: boolean;
  passportVerifiedAt: string | null;
  insuranceStatus: InsuranceStatus;
  insuranceExpiresAt: string | null;
  currentJobId: string | null;
  currentEmployerCompanyId: string | null;
  bankAccount?: BankAccount;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Expert';

export interface WorkerSkill {
  id: string;
  workerId: string;
  skillId: string;
  experienceYears: number;
  proficiencyLevel: ProficiencyLevel;
}

// Certification Types
export interface Certification {
  id: string;
  workerId: string;
  name: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string | null;
  certificateUrl: string;
}

// Media Types
export type MediaType = 'IMAGE' | 'VIDEO';

export interface MediaAsset {
  id: string;
  workerId: string;
  type: MediaType;
  url: string;
  caption?: string;
  uploadedAt: string;
}

// Company and Factory Types
export interface Address {
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Company {
  id: string;
  name: string;
  employerId: string;
  headquarters: Address;
  registrationNumber: string;
  gstNumber: string;
  contactEmail: string;
  contactPhone: string;
  escrowEnabled: boolean;
  escrowBalance: number;
  verified: boolean;
}

export interface Factory {
  id: string;
  companyId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  capacity: number;
}

// Job Types
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
export type JobStatus = 'ACTIVE' | 'CLOSED' | 'DRAFT';

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  factoryId: string;
  requiredSkills: string[];
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  openings: number;
  status: JobStatus;
  postedAt: string;
  expiresAt: string;
}

// Application Types
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  coverLetter?: string;
}

// Mock Data Store
export interface MockDataStore {
  users: User[];
  workers: WorkerProfile[];
  companies: Company[];
  factories: Factory[];
  skills: Skill[];
  workerSkills: WorkerSkill[];
  certifications: Certification[];
  mediaAssets: MediaAsset[];
  jobs: Job[];
  applications: Application[];
}
