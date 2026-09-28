# Agentic Quality Engineering Architecture

SDETFlow Agentic Quality Engineering is a **bounded, host-controlled orchestration layer** for quality-engineering workflows. It is designed so a language model can reason about evidence and propose actions without being granted unrestricted execution authority.

## Design goals

- Keep deterministic test execution independent from AI availability.
- Treat model output as untrusted input that must be parsed and validated.
- Permit only explicitly registered tools.
- Require application-owned authorization and human approval for high-sensitivity actions.
- Redact sensitive data before model requests, approval prompts, and audit output.
- Bound cost, execution time, observation size, and orchestration steps.
- Produce auditable lifecycle events for every decision and tool call.
- Fail closed when decisions are malformed, tools are unavailable, or required approval cannot be obtained.

## Trust boundary

```text
Requirements / test evidence / logs / traces
                  |
                  v
          Redaction + bounds
                  |
                  v
             AI provider
                  |
          strict JSON decision
                  |
                  v
        SDETFlow Agentic runtime
          |       |       |
          |       |       +--> audit events
          |       +----------> policy / validation
          +------------------> approval gate
                  |
                  v
          registered host tool
                  |
                  v
        sanitized observation
                  |
                  +----> next bounded step or final answer
```

The model never receives an implicit shell, filesystem, CI, Jira, browser, database, or network capability. A capability exists only when the host application registers a tool implementation.

## Tool contract

A registered tool has a stable name, description, sensitivity level, optional input validator, timeout policy, and host-owned execution function. The runtime validates a model-proposed tool call against the registry and the configured allowlist before any execution occurs.

Recommended sensitivity policy:

- **low** — read-only, bounded diagnostic retrieval.
- **medium** — stateful but reversible or low-impact quality operations.
- **high** — changes external state, publishes artifacts, mutates tickets, modifies environments, or can trigger costly/privileged execution. Human approval should remain required by default.

## Human-in-the-loop behavior

High-sensitivity tools require an approval handler by default. If approval is required and no handler is configured, execution is denied. Approval requests receive redacted inputs so secrets are not exposed merely because a human decision is required.

A production host may implement additional controls such as role-based approval, change-ticket validation, dual approval, environment restrictions, and time-bounded authorization.

## Prompt-injection and untrusted observations

Tool output, logs, DOM text, API bodies, issue comments, and other retrieved content are treated as untrusted observations. They are sanitized, size-bounded, and wrapped as evidence rather than promoted to system instructions. Hosts should additionally constrain the tools they register and the data each tool can access.

## Failure behavior

The runtime fails closed on malformed model decisions, unknown tools, denied tools, missing required approval, invalid tool input, and policy violations. Tool failures can either stop the run or be surfaced as bounded observations based on the host's explicit `continueOnToolError` policy.

Execution is also bounded by a maximum step count and per-tool timeout so a model cannot create an unbounded action loop.

## Privacy and secrets

SDETFlow applies configurable redaction before sending prompts or observations to an AI provider. Provider API keys are supplied externally and are not embedded in prompts. Redaction is defense-in-depth, not a substitute for organizational data classification: consumers remain responsible for deciding what data may be sent to an external provider.

## Intended quality-engineering use cases

The runtime is suitable for human-governed workflows such as:

- failure investigation using test artifacts and logs;
- root-cause assistance across UI/API/test evidence;
- bounded test-result or flake analysis;
- safe regression-selection assistance;
- proposing quality actions that require approval before external mutation;
- orchestration over future MCP, CI, issue-tracker, or test-management adapters implemented as registered tools.

## Non-goals

SDETFlow does not claim autonomous production authority. The runtime does not bypass authentication, does not provide unrestricted shell execution, does not silently modify test outcomes, and does not treat model confidence as proof of root cause.

## Verification

Agentic behavior is covered by the `AI-AGENT-*` master test cases and executable tests in `packages/ai/test/agentic.test.mjs`, including allowlisting, approval, redaction, malformed decisions, timeouts, maximum steps, prompt-injection boundaries, lifecycle auditing, and fail-closed behavior.

Run:

```bash
cd packages/ai
npm install
npm test
```

For the complete release gates, run from the repository root:

```bash
./scripts/verify-all.sh
./scripts/verify-release.sh
```

## Extension guidance

When adding a new integration, prefer a thin adapter that implements a registered tool rather than placing provider-specific behavior into the orchestration core. Keep tool inputs typed and minimal, return bounded structured observations, apply least privilege, and classify any state-changing action as high sensitivity unless there is a documented reason not to.
