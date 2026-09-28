import type { Route, SdetFlowAIConfig } from './types.js';

export type AIConfigInput = {
  enabled?: boolean;
  requestTimeoutMs?: number;
  retry?: Partial<SdetFlowAIConfig['retry']>;
  budget?: Partial<SdetFlowAIConfig['budget']>;
  concurrency?: Partial<SdetFlowAIConfig['concurrency']>;
  circuitBreaker?: Partial<SdetFlowAIConfig['circuitBreaker']>;
  privacy?: Partial<SdetFlowAIConfig['privacy']>;
  routes?: Route[];
};

const defaults: SdetFlowAIConfig = {
  enabled: false,
  requestTimeoutMs: 30_000,
  retry: { maxAttemptsPerTarget: 2, baseDelayMs: 300, maxDelayMs: 3_000, factor: 2, jitterRatio: 0.15 },
  budget: { maxInputChars: 200_000, maxOutputTokens: 4_000 },
  concurrency: { maxConcurrent: 4, maxRequestsPerMinute: 60 },
  circuitBreaker: { failureThreshold: 5, resetAfterMs: 30_000 },
  privacy: { redactEmails: true, redactUrls: false, redactIpAddresses: false, replacement: '[REDACTED]', customPatterns: [] },
  routes: [],
};

function freezeDeep<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) freezeDeep(nested);
  }
  return value;
}

function positiveInt(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) throw new Error(`${name} must be an integer >= 1`);
}

export function createAIConfig(input: AIConfigInput = {}): Readonly<SdetFlowAIConfig> {
  const config: SdetFlowAIConfig = {
    enabled: input.enabled ?? defaults.enabled,
    requestTimeoutMs: input.requestTimeoutMs ?? defaults.requestTimeoutMs,
    retry: { ...defaults.retry, ...input.retry },
    budget: { ...defaults.budget, ...input.budget },
    concurrency: { ...defaults.concurrency, ...input.concurrency },
    circuitBreaker: { ...defaults.circuitBreaker, ...input.circuitBreaker },
    privacy: {
      ...defaults.privacy,
      ...input.privacy,
      customPatterns: input.privacy?.customPatterns ? [...input.privacy.customPatterns] : [],
    },
    routes: input.routes ? input.routes.map((r) => ({ ...r, targets: r.targets.map((t) => ({ ...t })) })) : [],
  };

  if (!Number.isFinite(config.requestTimeoutMs) || config.requestTimeoutMs <= 0) throw new Error('requestTimeoutMs must be > 0');
  positiveInt(config.retry.maxAttemptsPerTarget, 'retry.maxAttemptsPerTarget');
  if (config.retry.baseDelayMs < 0 || config.retry.maxDelayMs < config.retry.baseDelayMs) throw new Error('invalid retry delay policy');
  if (config.retry.factor < 1) throw new Error('retry.factor must be >= 1');
  if (config.retry.jitterRatio < 0 || config.retry.jitterRatio > 1) throw new Error('retry.jitterRatio must be between 0 and 1');
  positiveInt(config.budget.maxInputChars, 'budget.maxInputChars');
  positiveInt(config.budget.maxOutputTokens, 'budget.maxOutputTokens');
  positiveInt(config.concurrency.maxConcurrent, 'concurrency.maxConcurrent');
  positiveInt(config.concurrency.maxRequestsPerMinute, 'concurrency.maxRequestsPerMinute');
  positiveInt(config.circuitBreaker.failureThreshold, 'circuitBreaker.failureThreshold');
  if (!Number.isFinite(config.circuitBreaker.resetAfterMs) || config.circuitBreaker.resetAfterMs < 0) throw new Error('circuitBreaker.resetAfterMs must be >= 0');
  if (config.enabled && config.routes.length === 0) throw new Error('At least one route is required when AI is enabled');
  for (const route of config.routes) {
    if (route.targets.length === 0) throw new Error(`Route ${route.task} must have at least one target`);
    for (const target of route.targets) {
      if (!target.provider || !target.model) throw new Error('Every route target requires provider and model');
      for (const [name, value] of [['inputCostPerMillionUsd', target.inputCostPerMillionUsd], ['outputCostPerMillionUsd', target.outputCostPerMillionUsd]] as const) {
        if (value !== undefined && (!Number.isFinite(value) || value < 0)) throw new Error(`${name} must be >= 0`);
      }
    }
  }
  return freezeDeep(config);
}

export function aiConfigFromEnv(env: Record<string, string | undefined> = (((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>)): AIConfigInput {
  const enabled = env.SDETFLOW_AI_ENABLED?.toLowerCase() === 'true';
  const provider = env.SDETFLOW_AI_PROVIDER;
  const model = env.SDETFLOW_AI_MODEL;
  return {
    enabled,
    ...(enabled && provider && model ? { routes: [{ task: '*', targets: [{ provider, model }] }] } : {}),
  };
}
