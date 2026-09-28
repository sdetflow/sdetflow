import { redactText } from './redaction.js';
import type {
  LocatorAttempt,
  LocatorLike,
  LocatorStrategy,
  LocatorTelemetry,
  PageLike,
  RedactionPolicy,
  SmartLocatorPolicy,
  SmartLocatorTarget,
} from './types.js';

export interface SmartLocatorOptions {
  policy: SmartLocatorPolicy;
  redaction?: Partial<RedactionPolicy>;
  onTelemetry?: (event: LocatorTelemetry) => void | Promise<void>;
  now?: () => number;
}

export interface SmartLocatorResolution {
  locator: LocatorLike;
  strategy: LocatorStrategy;
  attempts: LocatorAttempt[];
}

function safeError(error: unknown, redaction?: Partial<RedactionPolicy>): string {
  const text = error instanceof Error ? error.message : String(error);
  return redactText(text, redaction);
}

export class SmartLocator {
  private readonly page: PageLike;
  private readonly options: SmartLocatorOptions;

  public constructor(page: PageLike, options: SmartLocatorOptions) {
    this.page = page;
    this.options = options;
  }

  private candidate(strategy: LocatorStrategy, target: SmartLocatorTarget): LocatorLike | undefined {
    switch (strategy) {
      case 'testId':
        return target.testId && this.page.getByTestId ? this.page.getByTestId(target.testId) : undefined;
      case 'role':
        return target.role && this.page.getByRole
          ? this.page.getByRole(target.role, {
              ...(target.roleName === undefined ? {} : { name: target.roleName }),
              ...(target.exact === undefined ? {} : { exact: target.exact }),
            })
          : undefined;
      case 'label':
        return target.label && this.page.getByLabel
          ? this.page.getByLabel(target.label, target.exact === undefined ? undefined : { exact: target.exact })
          : undefined;
      case 'text':
        return target.text && this.page.getByText
          ? this.page.getByText(target.text, target.exact === undefined ? undefined : { exact: target.exact })
          : undefined;
      case 'css':
        return target.css && this.page.locator ? this.page.locator(target.css) : undefined;
    }
  }

  private async emit(operation: LocatorTelemetry['operation'], target: SmartLocatorTarget, selectedStrategy: LocatorStrategy | undefined, attempts: LocatorAttempt[]): Promise<void> {
    const event: LocatorTelemetry = {
      operation,
      ...(target.description === undefined ? {} : { description: target.description }),
      ...(selectedStrategy === undefined ? {} : { selectedStrategy }),
      attempts,
    };
    await this.options.onTelemetry?.(event);
  }

  public async resolve(target: SmartLocatorTarget): Promise<SmartLocatorResolution> {
    const attempts: LocatorAttempt[] = [];
    const now = this.options.now ?? Date.now;

    for (const strategy of this.options.policy.order) {
      const locator = this.candidate(strategy, target);
      if (!locator) continue;
      const started = now();
      try {
        if (locator.count) {
          const count = await locator.count();
          if (count < 1) throw new Error('No matching element');
        }
        attempts.push({ strategy, success: true, durationMs: Math.max(0, now() - started) });
        await this.emit('resolve', target, strategy, attempts);
        return { locator, strategy, attempts };
      } catch (error) {
        attempts.push({ strategy, success: false, durationMs: Math.max(0, now() - started), error: safeError(error, this.options.redaction) });
      }
    }

    await this.emit('resolve', target, undefined, attempts);
    const tried = attempts.length ? attempts.map((a) => a.strategy).join(', ') : 'none';
    throw new Error(`SDETFlow SmartLocator could not resolve target; attempted strategies: ${tried}`);
  }

  public async click(target: SmartLocatorTarget): Promise<SmartLocatorResolution> {
    return this.runAction('click', target, async (locator) => locator.click({ timeout: this.options.policy.timeoutMs }));
  }

  public async fill(target: SmartLocatorTarget, value: string): Promise<SmartLocatorResolution> {
    return this.runAction('fill', target, async (locator) => locator.fill(value, { timeout: this.options.policy.timeoutMs }));
  }

  private async runAction(
    operation: 'click' | 'fill',
    target: SmartLocatorTarget,
    action: (locator: LocatorLike) => Promise<void>,
  ): Promise<SmartLocatorResolution> {
    const attempts: LocatorAttempt[] = [];
    const now = this.options.now ?? Date.now;

    for (const strategy of this.options.policy.order) {
      const locator = this.candidate(strategy, target);
      if (!locator) continue;
      const started = now();
      try {
        await action(locator);
        attempts.push({ strategy, success: true, durationMs: Math.max(0, now() - started) });
        await this.emit(operation, target, strategy, attempts);
        return { locator, strategy, attempts };
      } catch (error) {
        attempts.push({ strategy, success: false, durationMs: Math.max(0, now() - started), error: safeError(error, this.options.redaction) });
      }
    }

    await this.emit(operation, target, undefined, attempts);
    const details = attempts.map((attempt) => `${attempt.strategy}: ${attempt.error ?? 'failed'}`).join(' | ');
    throw new Error(`SDETFlow SmartLocator ${operation} failed for all candidates${details ? ` (${details})` : ''}`);
  }
}
