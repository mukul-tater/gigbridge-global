import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;

export const sendOtpSchema = z.object({
  mobileNumber: z
    .string()
    .regex(phoneRegex, 'Mobile number must be 10 digits starting with 6-9'),
});

export const verifyOtpSchema = z.object({
  mobileNumber: z
    .string()
    .regex(phoneRegex, 'Mobile number must be 10 digits starting with 6-9'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
});
