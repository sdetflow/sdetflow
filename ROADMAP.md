# SDETFlow Roadmap

## v0.2 — public release candidate

- [x] production-oriented Playwright core
- [x] provider-agnostic GenAI SDK
- [x] OpenAI Responses adapter
- [x] Gemini Interactions adapter
- [x] AI routing / retry / fallback / budgets / rate controls / circuit breaker
- [x] AI failure triage, test design, log analysis, accessibility explanation
- [x] Java API SDK core + JSON-path/schema assertions
- [x] Ruby Gem core + Capybara/Watir adapters
- [x] multi-format Insights ingestion + CLI + JSONL persistence abstraction
- [x] portfolio/docs site source
- [x] clean-consumer artifact verification
- [x] GitHub CI templates
- [ ] bootstrap public GitHub repository
- [ ] run real Playwright Chromium/Firefox/WebKit CI
- [ ] run live OpenAI/Gemini contract CI with protected keys
- [ ] publish npm packages
- [ ] publish Ruby Gem
- [ ] publish Maven Central artifact
- [ ] deploy website and activate indexing

## v0.3 — enterprise integration

- RestAssured adapter for Java while retaining zero-dependency core;
- OpenAPI contract module;
- JDBC/DB verification SPI;
- RSpec/Cucumber integration helpers;
- TestNG result ingestion;
- optional filesystem/object-store persistence adapters for Insights;
- richer AI risk-based regression and locator analysis;
- first technical articles and API reference pages.

## v0.4 — test intelligence service

- versioned Insights REST API;
- authenticated multi-project storage;
- dashboard UI;
- Jira/GitHub/CI deep links;
- trend windows, ownership and quality-gate policies;
- optional GenAI explanations tied to deterministic evidence.

## v1.0 — stable public API

- compatibility/deprecation policy finalized;
- complete package matrix across supported runtimes;
- long-running performance/soak benchmarks;
- documented security threat model and release provenance;
- stable APIs based on real external usage feedback.
