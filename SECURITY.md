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

For the initial private development phase, report security issues to `sumantthh@gmail.com` and do not publish exploit details publicly. A dedicated security address can be introduced before the first public stable release.
