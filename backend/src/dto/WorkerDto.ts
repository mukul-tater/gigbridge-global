import type { ExperienceLevel } from '../entity/Worker.js';

export interface WorkerRegisterRequestDto {
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  aadhaarNumber: string;
  stateId: number;
  districtId: number;
  primarySkillId: number;
  experienceLevel: ExperienceLevel;
}

export interface WorkerLoginRequestDto {
  mobileNumber: string;
  password: string;
}

export interface WorkerAuthResponseDto {
  token: string;
  worker: WorkerProfileResponseDto;
}

export interface WorkerProfileResponseDto {
  id: number;
  workerCode: string;
  fullName: string;
  mobileNumber: string;
  aadhaarNumber: string;
  stateId: number;
  stateName: string;
  districtId: number;
  districtName: string;
  primarySkillId: number;
  primarySkillName: string;
  experienceLevel: ExperienceLevel;
  profileCompletionPercentage: number;
  registrationSource: string;
  status: string;
  onboardingCompleted: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface ApiErrorResponseDto {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiSuccessResponseDto<T> {
  success: true;
  data: T;
  message?: string;
}
