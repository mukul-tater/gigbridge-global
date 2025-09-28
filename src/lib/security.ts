/**
 * Client-side security utilities for PII handling and validation
 */

/**
 * Masks PAN number for display purposes
 * Format: AAAPL1234C -> XXXXXX234C
 */
export function maskPAN(panNumber: string): string {
  if (!panNumber || panNumber.length < 4) {
    return 'XXXXXXXXXX';
  }
  return 'XXXXXX' + panNumber.slice(-4);
}

/**
 * Masks Aadhaar number for display purposes
 * Format: 123456789012 -> XXXX-XXXX-9012
 */
export function maskAadhaar(aadhaarNumber: string): string {
  if (!aadhaarNumber || aadhaarNumber.length < 4) {
    return 'XXXX-XXXX-XXXX';
  }
  return 'XXXX-XXXX-' + aadhaarNumber.slice(-4);
}

/**
 * Validates PAN number format
 * Format: 5 letters, 4 digits, 1 letter (e.g., AAAPL1234C)
 */
export function validatePAN(panNumber: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(panNumber);
}

/**
 * Validates Aadhaar number format
 * Format: 12 digits
 */
export function validateAadhaar(aadhaarNumber: string): boolean {
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaarNumber.replace(/\s+/g, ''));
}

/**
 * Validates file type for document uploads
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension || '');
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Sanitizes filename for secure storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Generates a secure document ID for client-side tracking
 */
export function generateSecureDocumentId(): string {
  return crypto.randomUUID();
}

/**
 * Checks if age meets minimum requirement (18 years)
 */
export function validateMinimumAge(dateOfBirth: string): boolean {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return (age - 1) >= 18;
  }
  
  return age >= 18;
}

/**
 * Validates phone number format (E.164)
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Rate limiting for sensitive operations
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  canAttempt(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();