# SDETFlow v0.2.0 Production Candidate Manifest

## Test-first design

- `docs/test-specs/MASTER-TEST-SPEC.md` — long-term test specification across Playwright, GenAI, Java, Ruby, Insights, and website/docs.
- `docs/BUILD-STATUS.md` — implemented/verified v0.2 scope and external release gates.
- `docs/RELEASE-CHECKLIST.md` — exact public release checklist.
- `SECURITY.md` — security/privacy defaults.
- `docs/adr/` — architecture decisions.

## Implemented packages

### `@sdetflow/playwright` 0.2.0
- deterministic smart locator fallback and telemetry;
- bounded retries with jitter;
- secret/JWT/provider-key redaction;
- evidence collection, bounded diagnostics, screenshot/DOM attachment controls;
- seeded test-data utilities;
- optional sanitized GenAI hook;
- 32 automated tests passing;
- npm package + clean consumer smoke verified;
- real Chromium/Firefox/WebKit CI fixture prepared.

### `@sdetflow/ai` 0.2.0
- provider-independent client;
- OpenAI Responses + Gemini Interactions adapters;
- task routing, retry, fallback, concurrency/rate controls and circuit breaker;
- per-call/day budget controls and pluggable usage ledger;
- privacy redaction and untrusted-artifact boundaries;
- failure triage, test-design, log-analysis and accessibility analyzers;
- host-controlled Agentic AI runtime with registered tools, validation, step/time bounds, untrusted-output boundaries and human approval gates;
- 43 automated tests passing;
- npm package + clean consumer smoke verified;
- live provider contract fixture prepared.

### `@sdetflow/insights` 0.2.0
- Playwright/JUnit/Cucumber/Allure normalization;
- deterministic flake analysis;
- failure fingerprinting/clustering;
- duration/run summaries;
- in-memory + JSONL persistence abstraction;
- `sdetflow-insights` CLI;
- 14 automated tests passing;
- npm package + clean consumer smoke verified.

### `io.sdetflow:sdetflow-api` 0.2.0
- Java 17+, zero core runtime dependencies;
- auth, safe retries, Retry-After, default headers, correlation IDs;
- fluent HTTP/body/header/timing assertions;
- dependency-free JSON parser, JSON path and lightweight schema validation;
- redacted telemetry and idempotency-key handling;
- 12 local HTTP integration checks passing;
- binary + sources JAR + clean consumer compile/run verified.

### `sdet_flow` 0.2.0
- Ruby API automation, retries, JSON assertions and redaction;
- idempotency-key handling;
- Capybara/Watir adapters;
- 12 tests / 31 assertions passing;
- Gem build + isolated clean install verified.

### Portfolio/docs website
- responsive static site with project, documentation and experience pages;
- structured Person metadata and professional GenAI/SDET branding;
- intentionally `noindex` until public package/repository URLs are live;
- static verification passing.

## Current local verification

113 executable package/integration checks are passing, plus clean-consumer artifact verification and website static validation. See `docs/BUILD-STATUS.md` for precise scope and external CI/registry gates.
