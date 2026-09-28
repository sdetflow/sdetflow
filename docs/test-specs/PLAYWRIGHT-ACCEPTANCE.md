# `@sdetflow/playwright` v0.1 Acceptance Criteria

The first package is releasable as a **foundation release** when:

- configuration is validated and immutable;
- deterministic smart locator fallback is tested;
- retry behavior is bounded and observable;
- common secrets are redacted from text diagnostics;
- AI integration is disabled by default and represented only through an explicit adapter hook;
- failure artifact collection cannot hide the original test failure;
- the package compiles to ESM with declarations;
- unit tests pass without requiring a browser;
- the README explains how to combine the package with real Playwright tests;
- example code never depends on proprietary applications or data.
