# @sdetflow/ai

**Provider-agnostic GenAI-powered and Agentic AI quality engineering tools** for SDETFlow, created by **Sumanth Gumedelli**.

This SDK adds AI assistance to test engineering without making an LLM a hard dependency of test execution. It supports explicit task routing, provider/model fallback, privacy redaction, budgets, retries, concurrency/rate controls, circuit breaking, structured quality-engineering analyzers, and a host-controlled Agentic Quality Engineering runtime.

## Providers

The initial adapters support the OpenAI Responses API and Google's Gemini Interactions API. The provider interface is public so additional providers can be added without changing calling code. Keep provider credentials in environment or CI secret stores, not model prompts or source control.

## Quick start

```ts
import {
  createAIConfig,
  SdetFlowAIClient,
  OpenAIProvider,
  GeminiProvider,
  FailureTriageAnalyzer
} from '@sdetflow/ai';

const config = createAIConfig({
  enabled: true,
  routes: [{
    task: 'failure-triage',
    targets: [
      { provider: 'openai', model: process.env.SDETFLOW_OPENAI_MODEL! },
      { provider: 'gemini', model: process.env.SDETFLOW_GEMINI_MODEL! }
    ]
  }],
  budget: { maxEstimatedCostUsdPerCall: 0.05, maxEstimatedCostUsdPerDay: 2 }
});

const client = new SdetFlowAIClient({
  config,
  providers: [
    new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY! }),
    new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY! })
  ]
});

const triage = new FailureTriageAnalyzer(client);
const result = await triage.analyze({
  testName: 'checkout payment',
  error: 'Timeout waiting for payment iframe'
});
```

## Agentic Quality Engineering

`AgenticQualityEngineer` provides a bounded, application-controlled agent loop for quality-engineering workflows. The model may **propose** a registered tool, but the host application owns validation, authorization, execution, timeout, redaction, and human approval.

```ts
import { AgenticQualityEngineer } from '@sdetflow/ai';

const agent = new AgenticQualityEngineer({
  client,
  tools: [{
    name: 'read-test-result',
    description: 'Read a non-secret test-result summary by id',
    sensitivity: 'low',
    validate: (input) => {
      if (!input || typeof input !== 'object') throw new Error('object input required');
    },
    execute: async (input) => resultStore.read(input)
  }],
  config: { maxSteps: 6, stepTimeoutMs: 10_000 }
});

const run = await agent.run({
  goal: 'Analyze run-1042 and recommend the next safe investigation step.'
});
```

Agentic controls include:

- explicit registered-tool allowlisting; no arbitrary shell/code execution;
- strict JSON decision parsing that fails closed on malformed model output;
- maximum step count to prevent unbounded loops;
- per-tool input validation;
- tool execution timeouts;
- high-sensitivity human approval, denied by default when no approver exists;
- secret/PII redaction on goals, context, tool inputs, observations, and errors;
- bounded observations to control prompt size/cost;
- tool output wrapped as **untrusted data** to reduce prompt-injection risk;
- deterministic transcripts suitable for audit and debugging.

The runtime is intentionally host-controlled rather than "fully autonomous": external side effects should remain governed by explicit application tools and approval policy.

## Built-in analyzers

- failure triage: application vs automation vs environment vs data vs unknown;
- test design from supplied requirements without inventing missing business rules;
- log analysis with evidence and recommended checks;
- accessibility finding explanation;
- common provider-agnostic generation API for custom engineering workflows;
- bounded Agentic AI orchestration for tool-using quality-engineering workflows.

## Safety and reliability

- AI is disabled by default;
- bearer tokens, passwords, API keys, cookies, common provider keys, JWTs, and optional emails/URLs/IPs are redacted;
- diagnostic artifacts and agent tool observations are explicitly wrapped as untrusted data to reduce prompt-injection risk;
- malformed structured output fails closed rather than fabricating certainty;
- per-call and per-day estimated-cost controls;
- max concurrency and requests/minute controls;
- exponential retry and provider fallback;
- per-model circuit breaker after repeated failures;
- agent step caps, tool allowlists, validation, timeouts, and approval gates;
- provider API keys remain in request headers and are never intentionally placed into model input.

## Recommended environment variables

```bash
export OPENAI_API_KEY='...'
export GEMINI_API_KEY='...'
export SDETFLOW_AI_ENABLED='true'
```

Do not commit keys to source control. Use repository/environment secrets in CI.

## License

Apache-2.0
