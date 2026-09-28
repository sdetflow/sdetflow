# Security Policy

SDETFlow is intended for test environments that may contain credentials, tokens, customer-like test data, logs, screenshots, and other sensitive information. Security defaults therefore matter as much as convenience.

## Core rules

- AI features are **off by default**.
- API keys must be provided through environment variables or an external secret manager; they must not be committed to repositories.
- Diagnostic text is passed through configurable redaction before it is supplied to an AI adapter.
- SDETFlow never intentionally logs provider API keys.
- Raw DOM capture is disabled by default in the Playwright package.
- Screenshots can contain sensitive information and are never automatically transmitted to an AI provider.
- AI recommendations are advisory. They do not silently rewrite tests or override deterministic test outcomes.
- Provider timeouts, rate limits, and failures must degrade gracefully without preventing non-AI test execution.

## Agentic AI security model

- Model output is treated as untrusted input and must pass strict parsing and policy validation.
- Only explicitly registered and allowlisted tools may execute. SDETFlow does not provide arbitrary shell execution to the model.
- High-sensitivity tools require human approval by default; if required approval is unavailable, execution is denied.
- Tool inputs are validated before execution and approval views receive redacted values.
- Tool observations are treated as untrusted content, redacted, size-bounded, and wrapped before being returned to a model.
- Agent runs are bounded by maximum-step and tool-timeout controls.
- Hosts remain responsible for least-privilege credentials, authorization, network boundaries, and data-classification policy for any tool they register.
- A model recommendation or confidence score is not authorization and must not be treated as proof of a defect or root cause.

## Default redaction targets

The initial redactor masks common forms of:

- bearer tokens
- API keys
- passwords/secrets in key/value text
- cookies and authorization headers
- email addresses when configured
- custom project-specific regular expressions

No redaction system can guarantee removal of all sensitive information. Teams must review the data they opt to send externally.

## Vulnerability reporting

Report security issues to `sumantthh@gmail.com` and do not publish exploit details publicly. A dedicated security address can be introduced before the first public stable release.
