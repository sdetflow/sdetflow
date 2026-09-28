# Changelog

All notable changes follow Semantic Versioning.

## 0.2.0 — 2026-09-28

### Added
- production-oriented Playwright evidence collector, bounded diagnostics, seeded test-data utilities and session facade;
- stronger cross-package secret/JWT/provider-key redaction;
- GenAI concurrency/rate controls, circuit breaker, persistent usage-ledger interface and additional test-design/log/accessibility analyzers;
- Gemini Interactions usage parsing and richer OpenAI provider options;
- Insights parsers for JUnit XML, Cucumber JSON and Allure results, run summaries and JSONL persistence adapter;
- Java dependency-free JSON parser, JSON path/schema assertions, basic auth, default headers, correlation IDs, idempotency-key support and retry-after behavior;
- Ruby JSON-path assertions, response helpers, idempotency-key handling, stronger redaction and Capybara/Watir adapters;
- clean-consumer release verification for npm artifacts, JAR and Gem;
- expanded documentation, publishing plan and website content.

### Verification
- `@sdetflow/playwright`: 32 tests passing.
- `@sdetflow/ai`: 25 tests passing.
- `@sdetflow/insights`: 14 tests passing.
- Java SDK: 12 local HTTP integration checks passing.
- Ruby Gem: 12 tests / 31 assertions passing.
- clean consumer artifact verification passing.

### Remaining external release gates
- real Playwright Chromium/Firefox/WebKit matrix on GitHub-hosted CI;
- live OpenAI/Gemini contract tests using user-owned API keys and spend limits;
- actual npm/RubyGems/Maven Central publication and signed release provenance.

## 0.1.0 — 2026-09-28

Initial SDETFlow foundation, architecture, test specifications and package skeletons.
