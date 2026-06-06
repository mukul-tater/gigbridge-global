import {
  WorkerRepository,
  LocationRepository,
  SkillRepository,
} from '../repository/WorkerRepository.js';
import { WorkerOnboardingRepository } from '../repository/WorkerOnboardingRepository.js';
import type { WorkerOnboardingResponseDto, SaveOnboardingStepDto } from '../dto/WorkerOnboardingDto.js';
import type { WorkerProfileResponseDto } from '../dto/WorkerDto.js';
import type { WorkerStatus } from '../entity/Worker.js';
import { NotFoundException } from '../exception/AppException.js';

const STEP_COMPLETION: Record<1 | 2 | 3, number> = {
  1: 40,
  2: 65,
  3: 80,
};

export class WorkerOnboardingService {
  constructor(
    private readonly workerRepo = new WorkerRepository(),
    private readonly onboardingRepo = new WorkerOnboardingRepository(),
    private readonly locationRepo = new LocationRepository(),
    private readonly skillRepo = new SkillRepository()
  ) {}

  getOnboarding(workerId: number): WorkerOnboardingResponseDto {
    this.ensureWorkerExists(workerId);
    let record = this.onboardingRepo.findByWorkerId(workerId);
    if (!record) {
      record = this.onboardingRepo.createEmpty(workerId);
    }
    return this.toResponse(record);
  }

  saveStep(workerId: number, dto: SaveOnboardingStepDto): WorkerOnboardingResponseDto {
    this.ensureWorkerExists(workerId);

    const input = this.buildUpsertInput(workerId, dto);
    const record = this.onboardingRepo.upsert(input);

    const completion = STEP_COMPLETION[dto.step];
    const status: WorkerStatus = dto.step < 3 ? 'PROFILE_INCOMPLETE' : record.onboardingCompleted ? 'PROFILE_COMPLETED' : 'PROFILE_INCOMPLETE';
    this.workerRepo.updateProgress(workerId, completion, status);

    return this.toResponse(record);
  }

  complete(workerId: number, dto: SaveOnboardingStepDto & { step: 3 }): {
    onboarding: WorkerOnboardingResponseDto;
    worker: WorkerProfileResponseDto;
  } {
    this.ensureWorkerExists(workerId);

    const input = {
      ...this.buildUpsertInput(workerId, dto),
      currentStep: 3,
      onboardingCompleted: true,
    };
    const record = this.onboardingRepo.upsert(input);

    const completion = record.hasPassport ? 90 : 80;
    const status: WorkerStatus = record.hasPassport ? 'PASSPORT_AVAILABLE' : 'PROFILE_COMPLETED';
    this.workerRepo.updateProgress(workerId, completion, status);

    return { onboarding: this.toResponse(record), worker: this.buildWorkerProfile(workerId) };
  }

  private buildUpsertInput(workerId: number, dto: SaveOnboardingStepDto) {
    const base = { workerId, currentStep: Math.min(dto.step + 1, 3) as number };

    if (dto.step === 1) {
      return {
        ...base,
        dateOfBirth: dto.dateOfBirth ?? null,
        gender: dto.gender ?? null,
        email: dto.email || null,
        address: dto.address ?? null,
        pincode: dto.pincode ?? null,
      };
    }

    if (dto.step === 2) {
      if (dto.secondarySkillIds?.length) {
        for (const skillId of dto.secondarySkillIds) {
          if (!this.skillRepo.findById(skillId)) {
            throw new NotFoundException(`Invalid skill id: ${skillId}`);
          }
        }
      }
      return {
        ...base,
        secondarySkillIds: dto.secondarySkillIds ?? [],
        previousEmployer: dto.previousEmployer || null,
        hasPassport: dto.hasPassport ?? false,
        passportNumber: dto.hasPassport ? dto.passportNumber || null : null,
        ecrStatus: dto.ecrStatus ?? null,
      };
    }

    return {
      ...base,
      preferredCountries: dto.preferredCountries ?? [],
      availability: dto.availability ?? null,
      openToRelocation: dto.openToRelocation ?? true,
      expectedSalaryMin: dto.expectedSalaryMin ?? null,
      expectedSalaryCurrency: dto.expectedSalaryCurrency ?? 'INR',
      languages: dto.languages ?? [],
    };
  }

  private toResponse(record: import('../entity/WorkerOnboarding.js').WorkerOnboarding): WorkerOnboardingResponseDto {
    const secondarySkillNames = record.secondarySkillIds
      .map((id) => this.skillRepo.findById(id)?.name)
      .filter((name): name is string => !!name);

    return {
      workerId: record.workerId,
      dateOfBirth: record.dateOfBirth,
      gender: record.gender,
      email: record.email,
      address: record.address,
      pincode: record.pincode,
      secondarySkillIds: record.secondarySkillIds,
      secondarySkillNames,
      previousEmployer: record.previousEmployer,
      hasPassport: record.hasPassport,
      passportNumber: record.passportNumber,
      ecrStatus: record.ecrStatus,
      preferredCountries: record.preferredCountries,
      availability: record.availability,
      openToRelocation: record.openToRelocation,
      expectedSalaryMin: record.expectedSalaryMin,
      expectedSalaryCurrency: record.expectedSalaryCurrency,
      languages: record.languages,
      currentStep: record.currentStep,
      onboardingCompleted: record.onboardingCompleted,
    };
  }

  private buildWorkerProfile(workerId: number): WorkerProfileResponseDto {
    const worker = this.workerRepo.findById(workerId);
    if (!worker) throw new NotFoundException('Worker not found');

    const state = this.locationRepo.findStateById(worker.stateId);
    const district = this.locationRepo.findDistrictById(worker.districtId);
    const skill = this.skillRepo.findById(worker.primarySkillId);
    const onboarding = this.onboardingRepo.findByWorkerId(workerId);

    return {
      id: worker.id,
      workerCode: worker.workerCode,
      fullName: worker.fullName,
      mobileNumber: worker.mobileNumber,
      aadhaarNumber: worker.aadhaarNumber,
      stateId: worker.stateId,
      stateName: state?.name ?? '',
      districtId: worker.districtId,
      districtName: district?.name ?? '',
      primarySkillId: worker.primarySkillId,
      primarySkillName: skill?.name ?? '',
      experienceLevel: worker.experienceLevel,
      profileCompletionPercentage: worker.profileCompletionPercentage,
      registrationSource: worker.registrationSource,
      status: worker.status,
      onboardingCompleted: onboarding?.onboardingCompleted ?? false,
      createdDate: worker.createdDate,
      updatedDate: worker.updatedDate,
    };
  }

  private ensureWorkerExists(workerId: number): void {
    if (!this.workerRepo.findById(workerId)) {
      throw new NotFoundException('Worker not found');
    }
  }
}
