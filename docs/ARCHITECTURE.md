# SDETFlow Architecture

## Goal

SDETFlow separates deterministic testing capabilities from optional GenAI capabilities. Teams can adopt one module at a time and retain normal test execution if an AI provider, network connection, or external service is unavailable.

## Logical architecture

```text
                        +-----------------------------+
                        |  CI / Local / Container     |
                        +--------------+--------------+
                                       |
             +-------------------------+--------------------------+
             |                         |                          |
     +-------v---------+       +-------v---------+       +--------v--------+
     | Playwright SDK  |       | Java API SDK    |       | Ruby SDK       |
     | TypeScript      |       | RestAssured     |       | RSpec/Cucumber |
     +-------+---------+       +-------+---------+       +--------+--------+
             |                         |                          |
             +-------------+-----------+--------------------------+
                           |
                    +------v-------+
                    | Event Model  |
                    | Diagnostics  |
                    +------+-------+
                           |
            +--------------+----------------+
            |                               |
      +-----v------+                  +-----v---------+
      | SDETFlow AI|                  | SDETFlow      |
      | GenAI +    |                  | Insights      |
      | Agentic QE |                  +---------------+
      +-----+------+
            |
   +--------+---------+------------------+
   |                  |                  |
+--v------+      +----v-----+      +-----v------+
| OpenAI  |      | Gemini   |      | Future     |
| Adapter |      | Adapter  |      | Providers  |
+---------+      +----------+      +------------+
```

## Core boundaries

### Deterministic layer

Owns test execution, smart locator fallback, retries, configuration, artifacts, schema validation, and reporting. This layer must never depend on an LLM to pass a test.

### AI layer

Consumes explicitly selected, sanitized diagnostic context. It may classify failures, summarize evidence, suggest test ideas, or recommend likely causes. It must not silently change a passing/failing test outcome.

The Agentic Quality Engineering runtime is host-controlled: the model can propose only registered tools, while the application validates inputs, enforces allowlists, applies timeouts, requests human approval for configured sensitivity levels, redacts/bounds observations, and caps the number of steps. Tool output is treated as untrusted data before it is returned to the model. The runtime does not provide arbitrary shell execution.

### Insights layer

Stores normalized test-run events and computes historical analytics. AI explanations are optional enrichments; base metrics remain deterministic.

## Package compatibility policy

- Public APIs follow Semantic Versioning.
- Breaking changes require migration notes.
- AI provider adapters are isolated behind stable interfaces.
- Tests validate graceful operation when optional integrations are absent.
- Sensitive diagnostic collection is disabled or minimized by default.

## Planned event envelope

```json
{
  "schemaVersion": "1.0",
  "runId": "...",
  "testId": "...",
  "timestamp": "...",
  "framework": "playwright",
  "status": "failed",
  "durationMs": 1234,
  "environment": "qa",
  "artifacts": [],
  "diagnostics": {},
  "redactionApplied": true
}
```

This event model will be shared by the SDKs and SDETFlow Insights.
