import { AIBudgetError, AIProviderError } from './errors.js';
import { MemoryUsageLedger } from './ledger.js';
import { redact } from './redaction.js';
import type {
  AIProvider, ClientEvent, GenerationRequest, GenerationResult, ModelTarget, ProviderName,
  QualityTask, SdetFlowAIConfig, UsageLedger,
} from './types.js';

export interface SdetFlowAIClientOptions {
  config: Readonly<SdetFlowAIConfig>;
  providers: AIProvider[];
  onEvent?: (event: ClientEvent) => void | Promise<void>;
  sleep?: (ms: number) => Promise<void>;
  usageLedger?: UsageLedger;
  now?: () => number;
  random?: () => number;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function estimatedCost(target: ModelTarget, result: GenerationResult): number | undefined {
  const input = result.usage.inputTokens;
  const output = result.usage.outputTokens;
  if (input === undefined || output === undefined || target.inputCostPerMillionUsd === undefined || target.outputCostPerMillionUsd === undefined) return undefined;
  return (input / 1_000_000) * target.inputCostPerMillionUsd + (output / 1_000_000) * target.outputCostPerMillionUsd;
}

function worstCaseEstimatedCost(target: ModelTarget, inputChars: number, maxOutputTokens: number): number | undefined {
  if (target.inputCostPerMillionUsd === undefined || target.outputCostPerMillionUsd === undefined) return undefined;
  const estimatedInputTokens = Math.ceil(inputChars / 4);
  return (estimatedInputTokens / 1_000_000) * target.inputCostPerMillionUsd + (maxOutputTokens / 1_000_000) * target.outputCostPerMillionUsd;
}

class Semaphore {
  private active = 0;
  private readonly queue: Array<() => void> = [];
  public constructor(private readonly max: number) {}
  public async acquire(): Promise<() => void> {
    if (this.active >= this.max) await new Promise<void>((resolve) => this.queue.push(resolve));
    this.active += 1;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active -= 1;
      this.queue.shift()?.();
    };
  }
}

interface CircuitState { failures: number; openedAt?: number; }

export class SdetFlowAIClient {
  private readonly config: Readonly<SdetFlowAIConfig>;
  private readonly providers = new Map<ProviderName, AIProvider>();
  private readonly onEvent: ((event: ClientEvent) => void | Promise<void>) | undefined;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly ledger: UsageLedger;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly semaphore: Semaphore;
  private readonly recentRequests: number[] = [];
  private readonly circuits = new Map<string, CircuitState>();

  public constructor(options: SdetFlowAIClientOptions) {
    this.config = options.config;
    for (const provider of options.providers) this.providers.set(provider.name, provider);
    this.onEvent = options.onEvent;
    this.sleep = options.sleep ?? wait;
    this.ledger = options.usageLedger ?? new MemoryUsageLedger();
    this.now = options.now ?? Date.now;
    this.random = options.random ?? Math.random;
    this.semaphore = new Semaphore(this.config.concurrency.maxConcurrent);
  }

  private route(task: QualityTask): ModelTarget[] {
    return this.config.routes.find((r) => r.task === task)?.targets ?? this.config.routes.find((r) => r.task === '*')?.targets ?? [];
  }
  private async emit(event: ClientEvent): Promise<void> { await this.onEvent?.(event); }
  private targetKey(target: ModelTarget): string { return `${target.provider}:${target.model}`; }
  private dayKey(): string { return new Date(this.now()).toISOString().slice(0, 10); }

  private circuitAllows(target: ModelTarget): boolean {
    const state = this.circuits.get(this.targetKey(target));
    if (!state?.openedAt) return true;
    if (this.now() - state.openedAt >= this.config.circuitBreaker.resetAfterMs) {
      this.circuits.set(this.targetKey(target), { failures: 0 });
      return true;
    }
    return false;
  }
  private circuitSuccess(target: ModelTarget): void { this.circuits.set(this.targetKey(target), { failures: 0 }); }
  private circuitFailure(target: ModelTarget): void {
    const key = this.targetKey(target);
    const current = this.circuits.get(key) ?? { failures: 0 };
    const failures = current.failures + 1;
    this.circuits.set(key, failures >= this.config.circuitBreaker.failureThreshold ? { failures, openedAt: this.now() } : { failures });
  }

  private async enforceRateLimit(task: QualityTask): Promise<void> {
    const minuteAgo = this.now() - 60_000;
    while (this.recentRequests.length && this.recentRequests[0]! <= minuteAgo) this.recentRequests.shift();
    if (this.recentRequests.length < this.config.concurrency.maxRequestsPerMinute) return;
    const delay = Math.max(1, this.recentRequests[0]! + 60_000 - this.now());
    await this.emit({ type: 'rate-limit-wait', task, latencyMs: delay });
    await this.sleep(delay);
    const nextMinuteAgo = this.now() - 60_000;
    while (this.recentRequests.length && this.recentRequests[0]! <= nextMinuteAgo) this.recentRequests.shift();
  }

  private retryDelay(attempt: number): number {
    const raw = Math.min(this.config.retry.maxDelayMs, this.config.retry.baseDelayMs * Math.pow(this.config.retry.factor, attempt - 1));
    const jitter = raw * this.config.retry.jitterRatio * (this.random() * 2 - 1);
    return Math.max(0, Math.round(raw + jitter));
  }

  public async generate(request: GenerationRequest): Promise<GenerationResult> {
    if (!this.config.enabled) throw new Error('SDETFlow AI is disabled');
    if (request.input.length > this.config.budget.maxInputChars) {
      await this.emit({ type: 'budget-block', task: request.task });
      throw new AIBudgetError(`Input exceeds maxInputChars (${this.config.budget.maxInputChars})`);
    }
    const release = await this.semaphore.acquire();
    try {
      await this.emit({ type: 'queued', task: request.task });
      await this.enforceRateLimit(request.task);
      this.recentRequests.push(this.now());
      return await this.generateInternal(request);
    } finally {
      release();
    }
  }

  private async generateInternal(request: GenerationRequest): Promise<GenerationResult> {
    const maxOutputTokens = Math.min(request.maxOutputTokens ?? this.config.budget.maxOutputTokens, this.config.budget.maxOutputTokens);
    const sanitized: GenerationRequest = {
      ...request,
      input: redact(request.input, this.config.privacy),
      ...(request.system ? { system: redact(request.system, this.config.privacy) } : {}),
      maxOutputTokens,
    };
    const targets = this.route(request.task);
    if (targets.length === 0) throw new Error(`No AI route configured for task ${request.task}`);

    let lastError: unknown;
    for (let targetIndex = 0; targetIndex < targets.length; targetIndex += 1) {
      const target = targets[targetIndex]!;
      if (!this.circuitAllows(target)) {
        await this.emit({ type: 'circuit-open', task: request.task, provider: target.provider, model: target.model });
        continue;
      }
      const preflight = worstCaseEstimatedCost(target, sanitized.input.length, maxOutputTokens);
      const currentSpend = await this.ledger.getSpendUsd(this.dayKey());
      if (preflight !== undefined) {
        const overCall = this.config.budget.maxEstimatedCostUsdPerCall !== undefined && preflight > this.config.budget.maxEstimatedCostUsdPerCall;
        const overDay = this.config.budget.maxEstimatedCostUsdPerDay !== undefined && currentSpend + preflight > this.config.budget.maxEstimatedCostUsdPerDay;
        if (overCall || overDay) {
          lastError = new AIBudgetError(overCall ? `Estimated maximum call cost $${preflight.toFixed(6)} exceeds per-call budget` : 'Estimated maximum call cost would exceed the daily AI budget');
          await this.emit({ type: 'budget-block', task: request.task, provider: target.provider, model: target.model, estimatedCostUsd: preflight });
          continue;
        }
      }
      const provider = this.providers.get(target.provider);
      if (!provider) {
        lastError = new Error(`Provider ${target.provider} is not registered`);
        await this.emit({ type: 'provider-error', task: request.task, provider: target.provider, model: target.model, error: String(lastError) });
        continue;
      }
      if (targetIndex > 0) await this.emit({ type: 'fallback', task: request.task, provider: target.provider, model: target.model });

      for (let attempt = 1; attempt <= this.config.retry.maxAttemptsPerTarget; attempt += 1) {
        await this.emit({ type: 'attempt', task: request.task, provider: target.provider, model: target.model, attempt });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
        try {
          const result = await provider.generate(target.model, sanitized, controller.signal);
          clearTimeout(timeout);
          this.circuitSuccess(target);
          const cost = estimatedCost(target, result);
          if (cost !== undefined) {
            await this.ledger.addSpendUsd(this.dayKey(), cost);
            result.usage.estimatedCostUsd = cost;
          }
          await this.emit({ type: 'success', task: request.task, provider: target.provider, model: target.model, attempt, latencyMs: result.latencyMs, ...(cost === undefined ? {} : { estimatedCostUsd: cost }) });
          return result;
        } catch (error) {
          clearTimeout(timeout);
          lastError = error;
          this.circuitFailure(target);
          if (error instanceof AIBudgetError) throw error;
          const retryable = error instanceof AIProviderError ? error.retryable : (error instanceof Error && error.name === 'AbortError');
          await this.emit({ type: 'provider-error', task: request.task, provider: target.provider, model: target.model, attempt, error: error instanceof Error ? error.message : String(error) });
          if (!retryable || attempt >= this.config.retry.maxAttemptsPerTarget) break;
          await this.sleep(this.retryDelay(attempt));
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('All configured AI providers failed or were unavailable');
  }
}
