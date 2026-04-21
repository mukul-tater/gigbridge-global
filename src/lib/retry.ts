/**
 * Retry an async operation with exponential backoff.
 * - Skips retry for 4xx-style errors that won't change on retry (auth, validation, conflict).
 * - Calls onAttempt(attempt) before each try (1-indexed) so the UI can show "Retrying…".
 */
export interface RetryOptions {
  retries?: number;          // total attempts including the first one (default 3)
  baseDelayMs?: number;      // first backoff delay (default 500ms)
  maxDelayMs?: number;       // cap (default 4000ms)
  onAttempt?: (attempt: number, lastError?: unknown) => void;
}

const NON_RETRYABLE_CODES = new Set([
  '23505', // unique_violation (already exists)
  '23503', // foreign_key_violation
  '42501', // insufficient_privilege (RLS)
  'PGRST301', // JWT expired / not authenticated
]);

function isNonRetryable(err: any): boolean {
  if (!err) return false;
  if (err.code && NON_RETRYABLE_CODES.has(String(err.code))) return true;
  const status = err.status ?? err.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return true;
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const retries = Math.max(1, opts.retries ?? 3);
  const base = opts.baseDelayMs ?? 500;
  const max = opts.maxDelayMs ?? 4000;

  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      opts.onAttempt?.(attempt, lastError);
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries || isNonRetryable(err)) throw err;
      const delay = Math.min(max, base * 2 ** (attempt - 1)) + Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}