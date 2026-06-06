import { z } from 'zod';

const pincodeRegex = /^[1-9]\d{5}$/;
const emailRegex = /^\S+@\S+\.\S+$/;

export const onboardingStep1Schema = z.object({
  step: z.literal(1),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Gender is required' }),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().trim().min(10, 'Address must be at least 10 characters').max(500),
  pincode: z.string().regex(pincodeRegex, 'Enter a valid 6-digit pincode'),
});

export const onboardingStep2Schema = z.object({
  step: z.literal(2),
  secondarySkillIds: z.array(z.number().int().positive()).max(5, 'Maximum 5 secondary skills').optional(),
  previousEmployer: z.string().trim().max(150).optional().or(z.literal('')),
  hasPassport: z.boolean(),
  passportNumber: z.string().trim().max(20).optional().or(z.literal('')),
  ecrStatus: z.enum(['ECR', 'ECNR', 'NOT_CHECKED'], { required_error: 'ECR status is required' }),
}).refine(
  (data) => !data.hasPassport || (data.passportNumber && data.passportNumber.length >= 6),
  { message: 'Passport number is required when passport is available', path: ['passportNumber'] }
);

export const onboardingStep3Schema = z.object({
  step: z.literal(3),
  preferredCountries: z.array(z.string()).min(1, 'Select at least one preferred country').max(5),
  availability: z.enum(['IMMEDIATE', 'WITHIN_15_DAYS', 'WITHIN_30_DAYS', 'WITHIN_60_DAYS'], {
    required_error: 'Availability is required',
  }),
  openToRelocation: z.boolean(),
  expectedSalaryMin: z.coerce.number().positive('Expected salary must be positive').optional(),
  expectedSalaryCurrency: z.enum(['INR', 'AED', 'SAR', 'QAR', 'USD']).default('INR'),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
});

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }
  return errors;
}
