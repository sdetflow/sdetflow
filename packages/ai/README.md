# @sdetflow/ai

**Provider-agnostic GenAI-powered quality engineering tools** for SDETFlow, created by **Sumanth Gumedelli**.

This SDK adds AI assistance to test engineering without making an LLM a hard dependency of test execution. It supports explicit task routing, provider/model fallback, privacy redaction, budgets, retries, concurrency/rate controls, circuit breaking, and structured quality-engineering analyzers.

## Providers

The initial adapters support the OpenAI Responses API and Google's Gemini Interactions API. The provider interface is public so additional providers can be added without changing calling code. OpenAI documents current models through the Responses API, while Google recommends the Interactions API for new Gemini projects.

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

## Built-in analyzers

- failure triage: application vs automation vs environment vs data vs unknown;
- test design from supplied requirements without inventing missing business rules;
- log analysis with evidence and recommended checks;
- accessibility finding explanation;
- common provider-agnostic generation API for custom engineering workflows.

## Safety and reliability

- AI is disabled by default;
- bearer tokens, passwords, API keys, cookies, common provider keys, JWTs, and optional emails/URLs/IPs are redacted;
- diagnostic artifacts are explicitly wrapped as untrusted data to reduce prompt-injection risk;
- malformed structured output becomes an unknown/partial result rather than fabricated certainty;
- per-call and per-day estimated-cost controls;
- max concurrency and requests/minute controls;
- exponential retry and provider fallback;
- per-model circuit breaker after repeated failures;
- `store: false` is sent by the built-in OpenAI and Gemini adapters;
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
