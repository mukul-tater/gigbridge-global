import crypto from 'node:crypto';
import { ValidationException } from '../exception/AppException.js';

interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}

interface VerifiedToken {
  mobileNumber: string;
  expiresAt: number;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** In-memory OTP store — swap sendSms() for MSG91/Fast2SMS/Twilio in production. */
export class OtpService {
  private readonly pending = new Map<string, OtpRecord>();
  private readonly verifiedTokens = new Map<string, VerifiedToken>();

  async sendOtp(mobileNumber: string): Promise<{ demo?: boolean; message: string }> {
    const code = this.generateCode();
    this.pending.set(mobileNumber, {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
    });

    await this.sendSms(mobileNumber, code);

    const isDemo = process.env.OTP_PROVIDER !== 'msg91' && process.env.OTP_PROVIDER !== 'fast2sms';
    return {
      demo: isDemo,
      message: isDemo
        ? 'Demo OTP sent (check server logs or use any 6 digits in pilot mode)'
        : 'OTP sent to your mobile number',
    };
  }

  verifyOtp(mobileNumber: string, otp: string): { otpToken: string; expiresInSeconds: number } {
    const record = this.pending.get(mobileNumber);
    if (!record) {
      throw new ValidationException({ otp: ['OTP expired or not requested. Tap Send OTP again.'] });
    }

    if (Date.now() > record.expiresAt) {
      this.pending.delete(mobileNumber);
      throw new ValidationException({ otp: ['OTP expired. Request a new one.'] });
    }

    record.attempts += 1;
    if (record.attempts > MAX_ATTEMPTS) {
      this.pending.delete(mobileNumber);
      throw new ValidationException({ otp: ['Too many attempts. Request a new OTP.'] });
    }

    const accepted = this.isValidOtp(record.code, otp);
    if (!accepted) {
      throw new ValidationException({ otp: ['Invalid OTP. Please try again.'] });
    }

    this.pending.delete(mobileNumber);

    const otpToken = crypto.randomBytes(24).toString('hex');
    this.verifiedTokens.set(otpToken, {
      mobileNumber,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });

    return { otpToken, expiresInSeconds: TOKEN_TTL_MS / 1000 };
  }

  consumeRegistrationToken(mobileNumber: string, otpToken: string): void {
    const record = this.verifiedTokens.get(otpToken);
    if (!record || record.mobileNumber !== mobileNumber) {
      throw new ValidationException({
        mobileNumber: ['Mobile number must be verified with OTP before registering'],
      });
    }

    if (Date.now() > record.expiresAt) {
      this.verifiedTokens.delete(otpToken);
      throw new ValidationException({
        mobileNumber: ['Mobile verification expired. Verify your number again.'],
      });
    }

    this.verifiedTokens.delete(otpToken);
  }

  private generateCode(): string {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  private isValidOtp(expected: string, provided: string): boolean {
    const normalized = provided.replace(/\D/g, '');
    if (process.env.OTP_DEMO_MODE !== 'false') {
      return normalized.length === 6;
    }
    return normalized === expected;
  }

  private async sendSms(mobileNumber: string, code: string): Promise<void> {
    const provider = process.env.OTP_PROVIDER || 'mock';

    if (provider === 'msg91' && process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          recipients: [{ mobiles: `91${mobileNumber}`, OTP: code }],
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to send OTP via MSG91');
      }
      return;
    }

    if (provider === 'fast2sms' && process.env.FAST2SMS_API_KEY) {
      const params = new URLSearchParams({
        authorization: process.env.FAST2SMS_API_KEY,
        route: 'otp',
        variables_values: code,
        numbers: mobileNumber,
      });
      const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params}`);
      if (!response.ok) {
        throw new Error('Failed to send OTP via Fast2SMS');
      }
      return;
    }

    console.info(`[OTP mock] ${mobileNumber} => ${code} (pilot: any 6-digit code works)`);
  }
}

export const otpService = new OtpService();
