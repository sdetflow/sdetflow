# SDETFlow

**Open-source test automation, GenAI-powered quality engineering tools, and an evolving Agentic AI quality-engineering ecosystem by Sumanth Gumedelli.**

SDETFlow is a multi-language quality-engineering project focused on reusable automation architecture rather than one-off test scripts. The v0.2 line contains independently consumable TypeScript/Playwright, GenAI, test-intelligence, Java API, and Ruby automation libraries with deterministic behavior, privacy controls, packaging checks, and CI-ready documentation.

> **Release status:** v0.2.0 is a production-oriented release candidate. Core package tests and clean-consumer packaging checks are implemented; public registry publication follows GitHub browser-matrix and live-provider contract validation.

## Packages

| Package | Purpose | Version |
|---|---|---|
| `@sdetflow/playwright` | Playwright diagnostics, smart locator fallback, evidence capture, retries, test data, optional AI hooks | 0.2.0 |
| `@sdetflow/ai` | Provider-agnostic GenAI-powered quality engineering SDK with OpenAI/Gemini adapters, routing, budgets and analyzers | 0.2.0 |
| `@sdetflow/insights` | Playwright/JUnit/Cucumber/Allure normalization, flake scoring, clustering, trends and portable persistence | 0.2.0 |
| `io.sdetflow:sdetflow-api` | Java 17 API automation SDK with safe retries, auth, JSON assertions and telemetry | 0.2.0 |
| `sdet_flow` | Ruby quality-engineering Gem with API automation, retries, redaction and Capybara/Watir adapters | 0.2.0 |

## Engineering principles

1. **Deterministic first.** Core tests do not depend on an LLM being available.
2. **AI is optional and advisory.** GenAI can analyze evidence, but does not silently change test outcomes.
3. **Secure defaults.** Common credentials/tokens are redacted, sensitive artifacts are bounded or opt-in, and provider keys stay outside prompts.
4. **Safe retries.** Unsafe operations are not retried by default.
5. **Explainability.** Locator fallback, retries, failure clusters, and AI routing emit evidence/telemetry.
6. **Consumer usability.** Release verification installs generated artifacts into clean temporary consumers before a release is considered ready.

## Agentic AI direction

SDETFlow's next layer is **Agentic Quality Engineering**: tool-using, human-governed workflows for test design, execution, failure triage, root-cause assistance, regression selection, and engineering insights. Agentic features will be published only as they become implemented and testable; the current v0.2.0 packages do not claim autonomous production decision-making.

## Local verification

```bash
./scripts/verify-all.sh
./scripts/verify-release.sh
```

The first command runs package test suites and website checks. The second builds/packs installable artifacts and validates them from clean consumer projects.

## Documentation

Start with:
- `docs/ARCHITECTURE.md`
- `docs/BUILD-STATUS.md`
- `docs/test-specs/MASTER-TEST-SPEC.md`
- `docs/PUBLISHING.md`
- `SECURITY.md`

## Author

**Sumanth Gumedelli** — Senior SDET / QA Automation Architect building scalable test platforms, open-source automation libraries, and **GenAI-powered quality engineering tools**.

- LinkedIn: https://www.linkedin.com/in/sumanth-gumedelli-ba763191/
- Email: sumantthh@gmail.com

## License

Apache License 2.0.
