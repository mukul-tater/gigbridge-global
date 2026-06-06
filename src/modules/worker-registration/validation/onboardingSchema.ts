import { z } from 'zod';

const pincodeRegex = /^[1-9]\d{5}$/;

export const onboardingStep1Schema = z.object({
  step: z.literal(1),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().trim().min(10, 'Address must be at least 10 characters'),
  pincode: z.string().regex(pincodeRegex, 'Enter a valid 6-digit pincode'),
});

export const onboardingStep2Schema = z.object({
  step: z.literal(2),
  secondarySkillIds: z.array(z.number()).max(5).optional(),
  previousEmployer: z.string().optional(),
  hasPassport: z.boolean(),
  passportNumber: z.string().optional(),
  ecrStatus: z.enum(['ECR', 'ECNR', 'NOT_CHECKED'], { required_error: 'ECR status is required' }),
}).refine(
  (d) => !d.hasPassport || (d.passportNumber && d.passportNumber.length >= 6),
  { message: 'Passport number is required', path: ['passportNumber'] }
);

export const onboardingStep3Schema = z.object({
  step: z.literal(3),
  preferredCountries: z.array(z.string()).min(1, 'Select at least one country'),
  availability: z.enum(['IMMEDIATE', 'WITHIN_15_DAYS', 'WITHIN_30_DAYS', 'WITHIN_60_DAYS']),
  openToRelocation: z.boolean(),
  expectedSalaryMin: z.coerce.number().positive().optional(),
  expectedSalaryCurrency: z.enum(['INR', 'AED', 'SAR', 'QAR', 'USD']).default('INR'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
});

export type OnboardingStep1Values = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Values = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Values = z.infer<typeof onboardingStep3Schema>;
