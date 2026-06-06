import type { MigrationReadinessCategory } from '../types/emitra.types';

export interface MigrationAnswers {
  passportAvailable: boolean;
  readyToRelocate: boolean;
  familyConsent: boolean;
  previousGccExperience: boolean;
  expectedSalary?: number | null;
}

export function calculateMigrationScore(answers: MigrationAnswers): number {
  let score = 0;
  if (answers.passportAvailable) score += 25;
  if (answers.readyToRelocate) score += 20;
  if (answers.familyConsent) score += 20;
  if (answers.previousGccExperience) score += 20;
  if (answers.expectedSalary && answers.expectedSalary >= 15000 && answers.expectedSalary <= 80000) {
    score += 15;
  } else if (answers.expectedSalary) {
    score += 8;
  }
  return Math.min(100, score);
}

export function getMigrationCategory(score: number): MigrationReadinessCategory {
  if (score >= 70) return 'placement_ready';
  if (score >= 40) return 'needs_preparation';
  return 'not_ready';
}
