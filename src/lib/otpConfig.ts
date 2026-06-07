/** OTP channel for worker registration. Backend SMS is default (Fast2SMS/MSG91). */
export type OtpChannel = 'backend' | 'firebase';

export function getOtpChannel(): OtpChannel {
  const provider = (import.meta.env.VITE_OTP_PROVIDER || 'backend').toLowerCase();
  return provider === 'firebase' ? 'firebase' : 'backend';
}

export function useBackendOtp(): boolean {
  return getOtpChannel() === 'backend';
}
