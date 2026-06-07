import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;

export const experienceLevelSchema = z.enum([
  'FRESHER',
  'ONE_TO_THREE',
  'THREE_TO_FIVE',
  'FIVE_PLUS',
]);

const emailSchema = z.string().trim().email('Enter a valid email address').max(255);

export const workerRegisterSchema = z
  .object({
    email: emailSchema,
    mobileNumber: z
      .string()
      .regex(phoneRegex, 'Mobile number must be 10 digits starting with 6-9'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    fullName: z.string().trim().min(2, 'Full name is required').max(120),
    aadhaarNumber: z.string().regex(aadhaarRegex, 'Aadhaar must be 12 digits'),
    stateId: z.coerce.number().int().positive('State is required'),
    districtId: z.coerce.number().int().positive('District is required'),
    primarySkillId: z.coerce.number().int().positive('Primary skill is required'),
    experienceLevel: experienceLevelSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const workerLoginSchema = z
  .object({
    mobileNumber: z
      .string()
      .regex(phoneRegex, 'Mobile number must be 10 digits starting with 6-9')
      .optional(),
    email: emailSchema.optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.mobileNumber || data.email, {
    message: 'Enter your mobile number or email',
    path: ['mobileNumber'],
  });

export const workerGoogleAuthSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
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
