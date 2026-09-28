# ADR 0001: AI is optional, advisory, and provider-independent

Status: Accepted

## Decision

SDETFlow deterministic testing capabilities must operate without an AI provider. AI is opt-in and advisory. Provider integrations are implemented behind adapters and may not silently alter test pass/fail outcomes.

## Rationale

Quality engineering requires reproducibility, predictable costs, privacy controls, and resilience to external-provider outages. GenAI can add value in analysis and assistance without becoming a single point of failure for test execution.
