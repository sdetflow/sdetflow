import type { RetryPolicy } from './types.js';

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  error: unknown;
  nextDelayMs: number;
}

export interface RetryOptions extends RetryPolicy {
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (context: RetryContext) => void | Promise<void>;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function retryAsync<T>(operation: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      const isLast = attempt >= options.maxAttempts;
      const retryable = options.shouldRetry ? options.shouldRetry(error, attempt) : true;
      if (isLast || !retryable) throw error;

      const rawDelay = Math.min(
        options.maxDelayMs,
        options.baseDelayMs * Math.pow(options.factor, attempt - 1),
      );
      const jitter = rawDelay * options.jitterRatio * ((random() * 2) - 1);
      const nextDelayMs = Math.max(0, Math.round(rawDelay + jitter));

      await options.onRetry?.({ attempt, maxAttempts: options.maxAttempts, error, nextDelayMs });
      await sleep(nextDelayMs);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry operation failed');
}
