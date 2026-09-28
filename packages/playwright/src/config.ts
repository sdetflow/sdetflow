import type {
  AIHookPolicy,
  ArtifactPolicy,
  RedactionPolicy,
  RetryPolicy,
  SdetFlowPlaywrightConfig,
  SmartLocatorPolicy,
} from './types.js';

export type ConfigInput = {
  smartLocator?: Partial<SmartLocatorPolicy>;
  retry?: Partial<RetryPolicy>;
  artifacts?: Partial<ArtifactPolicy>;
  redaction?: Partial<RedactionPolicy>;
  ai?: Partial<AIHookPolicy>;
};

const DEFAULT_CONFIG: SdetFlowPlaywrightConfig = {
  smartLocator: {
    enabled: true,
    timeoutMs: 2_000,
    order: ['testId', 'role', 'label', 'text', 'css'],
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 200,
    maxDelayMs: 2_000,
    factor: 2,
    jitterRatio: 0.1,
  },
  artifacts: {
    attachMetadata: true,
    screenshotOnFailure: true,
    includeDom: false,
    fullPageScreenshot: true,
    maxDomChars: 200_000,
    maxLogEntries: 200,
  },
  redaction: {
    redactEmails: false,
    redactUrls: false,
    redactIpAddresses: false,
    replacement: '[REDACTED]',
    customPatterns: [],
  },
  ai: {
    enabled: false,
    includeDom: false,
  },
};

function assertFiniteNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number`);
  }
}

function validate(config: SdetFlowPlaywrightConfig): void {
  if (!Number.isInteger(config.retry.maxAttempts) || config.retry.maxAttempts < 1) {
    throw new Error('retry.maxAttempts must be an integer >= 1');
  }
  assertFiniteNonNegative('retry.baseDelayMs', config.retry.baseDelayMs);
  assertFiniteNonNegative('retry.maxDelayMs', config.retry.maxDelayMs);
  if (config.retry.maxDelayMs < config.retry.baseDelayMs) {
    throw new Error('retry.maxDelayMs must be >= retry.baseDelayMs');
  }
  if (!Number.isFinite(config.retry.factor) || config.retry.factor < 1) {
    throw new Error('retry.factor must be a finite number >= 1');
  }
  if (!Number.isFinite(config.retry.jitterRatio) || config.retry.jitterRatio < 0 || config.retry.jitterRatio > 1) {
    throw new Error('retry.jitterRatio must be between 0 and 1');
  }
  assertFiniteNonNegative('smartLocator.timeoutMs', config.smartLocator.timeoutMs);
  if (config.smartLocator.order.length === 0) {
    throw new Error('smartLocator.order must contain at least one strategy');
  }
  if (!Number.isInteger(config.artifacts.maxDomChars) || config.artifacts.maxDomChars < 1000) throw new Error('artifacts.maxDomChars must be >= 1000');
  if (!Number.isInteger(config.artifacts.maxLogEntries) || config.artifacts.maxLogEntries < 1) throw new Error('artifacts.maxLogEntries must be >= 1');
  if (!config.redaction.replacement) {
    throw new Error('redaction.replacement must not be empty');
  }
}

function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      freezeDeep(nested);
    }
  }
  return value;
}

export function createConfig(input: ConfigInput = {}): Readonly<SdetFlowPlaywrightConfig> {
  const config: SdetFlowPlaywrightConfig = {
    smartLocator: {
      ...DEFAULT_CONFIG.smartLocator,
      ...input.smartLocator,
      order: input.smartLocator?.order ? [...input.smartLocator.order] : [...DEFAULT_CONFIG.smartLocator.order],
    },
    retry: { ...DEFAULT_CONFIG.retry, ...input.retry },
    artifacts: { ...DEFAULT_CONFIG.artifacts, ...input.artifacts },
    redaction: {
      ...DEFAULT_CONFIG.redaction,
      ...input.redaction,
      customPatterns: input.redaction?.customPatterns ? [...input.redaction.customPatterns] : [],
    },
    ai: { ...DEFAULT_CONFIG.ai, ...input.ai },
  };

  validate(config);
  return freezeDeep(config);
}

function parseBoolean(name: string, value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  throw new Error(`${name} must be true/false, yes/no, on/off, or 1/0`);
}

function parseNumber(name: string, value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number`);
  return parsed;
}

export function configFromEnv(env: Record<string, string | undefined>): Readonly<SdetFlowPlaywrightConfig> {
  const aiEnabled = parseBoolean('SDETFLOW_AI_ENABLED', env.SDETFLOW_AI_ENABLED);
  const includeDom = parseBoolean('SDETFLOW_INCLUDE_DOM', env.SDETFLOW_INCLUDE_DOM);
  const screenshot = parseBoolean('SDETFLOW_SCREENSHOT_ON_FAILURE', env.SDETFLOW_SCREENSHOT_ON_FAILURE);
  const locatorTimeout = parseNumber('SDETFLOW_LOCATOR_TIMEOUT_MS', env.SDETFLOW_LOCATOR_TIMEOUT_MS);
  const maxAttempts = parseNumber('SDETFLOW_RETRY_MAX_ATTEMPTS', env.SDETFLOW_RETRY_MAX_ATTEMPTS);

  const input: ConfigInput = {};
  if (aiEnabled !== undefined) input.ai = { enabled: aiEnabled };
  if (includeDom !== undefined || screenshot !== undefined) {
    input.artifacts = {
      ...(includeDom === undefined ? {} : { includeDom }),
      ...(screenshot === undefined ? {} : { screenshotOnFailure: screenshot }),
    };
  }
  if (locatorTimeout !== undefined) input.smartLocator = { timeoutMs: locatorTimeout };
  if (maxAttempts !== undefined) input.retry = { maxAttempts };

  return createConfig(input);
}
