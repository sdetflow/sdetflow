export type ProviderName = 'openai' | 'gemini' | (string & {});
export type QualityTask =
  | 'failure-triage'
  | 'test-design'
  | 'api-test-design'
  | 'log-analysis'
  | 'accessibility-explanation'
  | 'locator-analysis'
  | 'risk-regression'
  | 'general';

export interface GenerationRequest {
  task: QualityTask;
  system?: string;
  input: string;
  maxOutputTokens?: number;
  temperature?: number;
  metadata?: Record<string, string>;
}

export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostUsd?: number;
}

export interface GenerationResult {
  provider: ProviderName;
  model: string;
  text: string;
  usage: Usage;
  latencyMs: number;
  requestId?: string;
}

export interface AIProvider {
  readonly name: ProviderName;
  generate(model: string, request: GenerationRequest, signal?: AbortSignal): Promise<GenerationResult>;
}

export interface ModelTarget {
  provider: ProviderName;
  model: string;
  inputCostPerMillionUsd?: number;
  outputCostPerMillionUsd?: number;
}

export interface Route {
  task: QualityTask | '*';
  targets: ModelTarget[];
}

export interface RetryPolicy {
  maxAttemptsPerTarget: number;
  baseDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitterRatio: number;
}

export interface BudgetPolicy {
  maxInputChars: number;
  maxOutputTokens: number;
  maxEstimatedCostUsdPerCall?: number;
  maxEstimatedCostUsdPerDay?: number;
}

export interface ConcurrencyPolicy {
  maxConcurrent: number;
  maxRequestsPerMinute: number;
}

export interface CircuitBreakerPolicy {
  failureThreshold: number;
  resetAfterMs: number;
}

export interface PrivacyPolicy {
  redactEmails: boolean;
  redactUrls: boolean;
  redactIpAddresses: boolean;
  replacement: string;
  customPatterns: RegExp[];
}

export interface SdetFlowAIConfig {
  enabled: boolean;
  requestTimeoutMs: number;
  retry: RetryPolicy;
  budget: BudgetPolicy;
  concurrency: ConcurrencyPolicy;
  circuitBreaker: CircuitBreakerPolicy;
  privacy: PrivacyPolicy;
  routes: Route[];
}

export interface ClientEvent {
  type:
    | 'queued'
    | 'attempt'
    | 'success'
    | 'fallback'
    | 'budget-block'
    | 'rate-limit-wait'
    | 'circuit-open'
    | 'provider-error';
  task: QualityTask;
  provider?: ProviderName;
  model?: string;
  attempt?: number;
  error?: string;
  latencyMs?: number;
  estimatedCostUsd?: number;
}

export interface UsageLedger {
  getSpendUsd(dayKey: string): Promise<number>;
  addSpendUsd(dayKey: string, amount: number): Promise<void>;
}

export interface FailureDiagnostic {
  testName?: string;
  status?: string;
  error?: string;
  url?: string;
  logs?: string[];
  network?: string[];
  locatorAttempts?: unknown[];
  historySummary?: string;
  additionalContext?: string;
}

export type FailureCategory = 'application' | 'automation' | 'environment' | 'data' | 'unknown';

export interface FailureTriageResult {
  category: FailureCategory;
  confidence: number;
  summary: string;
  evidence: string[];
  recommendations: string[];
  aiGenerated: true;
  provider?: ProviderName;
  model?: string;
}

export interface TestDesignInput {
  requirement: string;
  context?: string;
  constraints?: string[];
}

export interface GeneratedTestCase {
  title: string;
  type: 'positive' | 'negative' | 'boundary' | 'security' | 'accessibility' | 'performance' | 'integration' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  preconditions: string[];
  steps: string[];
  expectedResults: string[];
  rationale?: string;
}

export interface TestDesignResult {
  summary: string;
  cases: GeneratedTestCase[];
  gaps: string[];
  aiGenerated: true;
  provider?: ProviderName;
  model?: string;
}

export interface LogAnalysisResult {
  summary: string;
  probableCauses: string[];
  evidence: string[];
  recommendedChecks: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  aiGenerated: true;
  provider?: ProviderName;
  model?: string;
}

export interface AccessibilityExplanationResult {
  summary: string;
  impact: string;
  wcagReferences: string[];
  remediation: string[];
  aiGenerated: true;
  provider?: ProviderName;
  model?: string;
}
