# ADR 0003: Sensitive artifacts are opt-in for AI

Status: Accepted

## Decision

DOM and screenshot data are not sent to AI providers by default. Text diagnostics are redacted before they reach an AI adapter.

## Rationale

Test artifacts frequently contain secrets or user-like information. Explicit opt-in and least-data defaults reduce accidental disclosure risk.
