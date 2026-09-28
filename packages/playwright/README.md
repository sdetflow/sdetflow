# @sdetflow/playwright

Production-oriented Playwright quality-engineering helpers from **SDETFlow**, created by **Sumanth Gumedelli**. The library keeps deterministic browser automation first and adds diagnostics, evidence capture, resilient locator fallbacks, bounded retries, test-data helpers, and optional GenAI-powered quality engineering hooks.

## Why

Large UI suites usually fail for more reasons than product defects: unstable selectors, transient infrastructure, stale test data, hidden network errors, and insufficient diagnostics. This package provides reusable primitives for those problems without replacing Playwright Test.

## Install

```bash
npm install -D @playwright/test @sdetflow/playwright
npx playwright install
```

## Safe defaults

AI is disabled by default. DOM capture is disabled by default. Diagnostics redact common bearer/API/password/token patterns before attachment or AI handoff. Smart locator fallback is deterministic and emits telemetry so teams can see which selector actually worked.

## Quick start

```ts
import { createConfig, SdetFlowSession } from '@sdetflow/playwright';

const config = createConfig({
  artifacts: { screenshotOnFailure: true },
  redaction: { redactEmails: true }
});

// `page` can be a real Playwright Page; the package uses a compatible surface.
const flow = new SdetFlowSession(page, config);
await flow.locator.click({
  testId: 'submit-order',
  role: 'button',
  roleName: 'Place Order',
  text: 'Place Order',
  description: 'checkout submit button'
});
```

On failure, call `flow.onFailure(error, testInfo)` to attach a sanitized diagnostic JSON file and screenshot. When an AI analyzer is explicitly configured, the same sanitized evidence can be analyzed without making AI a test-execution dependency.

## Major capabilities

- deterministic selector order: test id → role → label → text → CSS;
- redacted locator telemetry and diagnostics;
- bounded DOM/log evidence to avoid uncontrolled artifact size;
- retry helper with exponential backoff and jitter;
- deterministic seeded test-data helpers;
- optional screenshot and DOM attachments;
- evidence buffer for console/network/locator events;
- optional GenAI failure-analysis adapter;
- no mandatory runtime dependency besides the consumer's Playwright installation.

## Production guidance

Prefer stable `data-testid` and accessible role/name locators. Fallback selectors are a resilience mechanism, not a substitute for application testability. Keep DOM capture off unless needed. Never put API keys in test source. Use CI secrets/environment variables. Treat AI recommendations as advisory; tests should still fail or pass based on deterministic assertions.

## Compatibility target

Node.js 20+ and current supported Playwright Test releases. Browser-matrix verification is performed in CI once the public repository is connected.

## License

Apache-2.0
