export class AIProviderError extends Error {
  public readonly status?: number;
  public readonly retryable: boolean;
  public readonly provider: string;

  public constructor(provider: string, message: string, options: { status?: number; retryable?: boolean } = {}) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    if (options.status !== undefined) this.status = options.status;
    this.retryable = options.retryable ?? true;
  }
}

export class AIBudgetError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'AIBudgetError';
  }
}
