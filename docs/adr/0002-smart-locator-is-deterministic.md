# ADR 0002: Smart locator fallback is deterministic

Status: Accepted

## Decision

The initial Playwright smart locator uses an explicit ordered fallback strategy rather than an LLM-driven selector rewrite.

## Rationale

Deterministic fallback is explainable, testable, fast, low-cost, and safe for CI. AI may later recommend selector improvements, but it will not silently mutate locators during normal execution.
