# SDETFlow

[![SDETFlow CI](https://github.com/sdetflow/sdetflow/actions/workflows/ci.yml/badge.svg)](https://github.com/sdetflow/sdetflow/actions/workflows/ci.yml)
[![Playwright Browser Matrix](https://github.com/sdetflow/sdetflow/actions/workflows/playwright-browser-matrix.yml/badge.svg)](https://github.com/sdetflow/sdetflow/actions/workflows/playwright-browser-matrix.yml)

**Open-source test automation, GenAI-powered quality engineering, and Agentic AI tools by Sumanth Gumedelli.**

SDETFlow is a multi-language quality-engineering ecosystem focused on reusable automation architecture rather than one-off test scripts. The v0.2 line contains independently consumable TypeScript/Playwright, GenAI + Agentic AI, test-intelligence, Java API, and Ruby automation libraries with deterministic behavior, privacy controls, packaging checks, and CI-ready documentation.

> **Release status:** v0.2.0 is a production-oriented release candidate. GitHub CI, the Chromium/Firefox/WebKit browser matrix, local package tests, clean-consumer packaging checks, and live OpenAI/Gemini provider contracts are green. Public registry publication now depends only on registry ownership/bootstrap and release approval.

## Packages

| Package | Purpose | Version |
|---|---|---|
| `@sdetflow/playwright` | Playwright diagnostics, smart locator fallback, evidence capture, retries, test data, optional AI hooks | 0.2.0 |
| `@sdetflow/ai` | Provider-agnostic GenAI + Agentic AI quality engineering SDK with OpenAI/Gemini adapters, routing, budgets, analyzers, registered tools and approval gates | 0.2.0 |
| `@sdetflow/insights` | Playwright/JUnit/Cucumber/Allure normalization, flake scoring, clustering, trends and portable persistence | 0.2.0 |
| `io.sdetflow:sdetflow-api` | Java 17 API automation SDK with safe retries, auth, JSON assertions and telemetry | 0.2.0 |
| `sdet_flow` | Ruby quality-engineering Gem with API automation, retries, redaction and Capybara/Watir adapters | 0.2.0 |

## Engineering principles

1. **Deterministic first.** Core tests do not depend on an LLM being available.
2. **AI is optional and advisory.** GenAI can analyze evidence, but does not silently change test outcomes.
3. **Agentic side effects are host-controlled.** Models may propose registered tools; the application owns validation, authorization, execution and approval.
4. **Secure defaults.** Common credentials/tokens are redacted, sensitive artifacts are bounded or opt-in, and provider keys stay outside prompts.
5. **Safe retries.** Unsafe operations are not retried by default.
6. **Explainability.** Locator fallback, retries, failure clusters, AI routing and agent steps emit evidence/telemetry.
7. **Consumer usability.** Release verification installs generated artifacts into clean temporary consumers before a release is considered ready.

## Agentic Quality Engineering

`@sdetflow/ai` includes a bounded, host-controlled Agentic AI runtime for quality-engineering workflows. It supports registered-tool allowlists, strict JSON decisions, tool input validation, execution timeouts, maximum-step limits, untrusted-output boundaries, secret/PII redaction, and explicit human approval for high-sensitivity tools. It does **not** grant models arbitrary shell access or bypass application authorization.

Typical use cases include evidence-driven failure investigation, test-result analysis, safe workflow orchestration, and human-governed quality actions. MCP/CI/Jira adapters can be layered on the public tool contract without changing the core orchestration model.

## Local verification

```bash
./scripts/verify-all.sh
./scripts/verify-release.sh
```

The first command runs package test suites and website checks. The second builds/packs installable artifacts and validates them from clean consumer projects.

## Documentation

Start with:
- `docs/ARCHITECTURE.md`
- `docs/AGENTIC-AI.md`
- `docs/BUILD-STATUS.md`
- `docs/test-specs/MASTER-TEST-SPEC.md`
- `docs/PUBLISHING.md`
- `SECURITY.md`

## Author

**Sumanth Gumedelli** — Senior SDET / QA Automation Architect building scalable test platforms, open-source automation libraries, and **GenAI-powered quality engineering tools with Agentic AI workflows**.

- LinkedIn: https://www.linkedin.com/in/sumanth-gumedelli-ba763191/
- Email: sumantthh@gmail.com

## License

Apache License 2.0.
