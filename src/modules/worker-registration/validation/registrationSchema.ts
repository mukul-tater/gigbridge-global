import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;

export const workerRegisterSchema = z
  .object({
    mobileNumber: z
      .string()
      .regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z.string().trim().min(2, 'Full name is required').max(120),
    aadhaarNumber: z.string().regex(aadhaarRegex, 'Aadhaar must be 12 digits'),
    stateId: z.coerce.number().int().positive('Please select a state'),
    districtId: z.coerce.number().int().positive('Please select a district'),
    primarySkillId: z.coerce.number().int().positive('Please select a primary skill'),
    experienceLevel: z.enum(['FRESHER', 'ONE_TO_THREE', 'THREE_TO_FIVE', 'FIVE_PLUS'], {
      required_error: 'Please select experience level',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const workerLoginSchema = z.object({
  mobileNumber: z
    .string()
    .regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(1, 'Password is required'),
});

export type WorkerRegisterFormValues = z.infer<typeof workerRegisterSchema>;
export type WorkerLoginFormValues = z.infer<typeof workerLoginSchema>;
