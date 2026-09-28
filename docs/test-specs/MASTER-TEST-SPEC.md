# SDETFlow Master Test Specification

Version: 0.2  
Owner: Sumanth Gumedelli  
Purpose: define release behavior **before implementation** for every SDETFlow product.

> **Scope note for v0.2.0:** this document is the long-term master specification through v1.0, not a claim that every future module is already shipped. The v0.2.0 public-release scope is tracked in `docs/BUILD-STATUS.md` and `docs/RELEASE-CHECKLIST.md`. Items such as a hosted Insights dashboard/API, full OpenAPI engine, database adapters, and framework-specific example apps remain later-version scope unless explicitly marked complete.


## Test conventions

- **P0**: release blocker; core correctness/security/installability.
- **P1**: high priority; required for production-ready release.
- **P2**: important but can ship with a documented limitation in a pre-1.0 release.
- **Blocker = Yes** means the release must not be published while the test fails.
- AI functionality is advisory; deterministic test outcomes must not depend on an LLM.

---

# A. `@sdetflow/playwright`

| ID | Pri | Blocker | Scenario | Preconditions / Steps | Expected result |
|---|---|---:|---|---|---|
| PW-INSTALL-001 | P0 | Yes | Clean npm install | New project; install `@playwright/test` and package | Package installs without postinstall side effects or hidden downloads |
| PW-INSTALL-002 | P0 | Yes | Import public API | Import package from Node/TS project | No unresolved module errors; supported exports available |
| PW-INSTALL-003 | P1 | Yes | ESM compatibility | Use from ESM project | Imports resolve and execute |
| PW-INSTALL-004 | P1 | Yes | TypeScript declarations | Run `tsc --noEmit` in consumer example | Public APIs type-check without local shims |
| PW-CONFIG-001 | P0 | Yes | Defaults | Create config with no overrides | Secure deterministic defaults returned |
| PW-CONFIG-002 | P0 | Yes | Deep merge | Override one nested retry field | Unspecified nested defaults remain intact |
| PW-CONFIG-003 | P0 | Yes | Invalid numeric config | Set negative timeout/attempt count | Clear validation error with field name |
| PW-CONFIG-004 | P1 | Yes | Env booleans | Set supported true/false variants | Values parsed consistently |
| PW-CONFIG-005 | P1 | Yes | Config immutability | Attempt mutation after creation | Config remains immutable or documented copy semantics hold |
| PW-LOC-001 | P0 | Yes | Test-id first | Element exists by `data-testid` | Resolver selects test-id without trying lower strategies |
| PW-LOC-002 | P0 | Yes | Fallback to role | Test-id fails; role works | Role is used; attempt telemetry records first failure |
| PW-LOC-003 | P0 | Yes | Fallback to label/text/CSS | Earlier strategies fail | Strategies execute in configured order |
| PW-LOC-004 | P0 | Yes | No selector succeeds | All candidates fail | Deterministic error includes attempted strategies without secrets |
| PW-LOC-005 | P1 | Yes | Custom strategy order | Configure role before test-id | Runtime honors configured order |
| PW-LOC-006 | P1 | Yes | Unsupported strategy omitted | Target lacks a candidate for one strategy | Strategy is skipped rather than failing the whole operation |
| PW-LOC-007 | P1 | Yes | Fill action | Resolved locator supports fill | Correct locator is filled once |
| PW-LOC-008 | P1 | Yes | Click action | Resolved locator supports click | Correct locator is clicked once |
| PW-LOC-009 | P1 | Yes | Timeout isolation | First strategy times out | Remaining strategies still receive configured timeout behavior |
| PW-LOC-010 | P1 | No | Telemetry callback | Callback configured | Structured attempts emitted in stable schema |
| PW-RETRY-001 | P0 | Yes | Success first attempt | Operation succeeds | Executes once; returns value |
| PW-RETRY-002 | P0 | Yes | Transient failure | Fails N-1 times then succeeds | Retries within limit and returns final value |
| PW-RETRY-003 | P0 | Yes | Exhausted retries | Always fails | Original/latest error propagated with retry metadata |
| PW-RETRY-004 | P1 | Yes | Non-retryable predicate | Predicate rejects error | Stops immediately |
| PW-RETRY-005 | P1 | No | Backoff cap | Large attempt count | Delay never exceeds max delay |
| PW-SEC-001 | P0 | Yes | Bearer token redaction | Diagnostic contains Authorization bearer token | Token value is masked |
| PW-SEC-002 | P0 | Yes | Password redaction | `password=...`, JSON-like secret text | Secret value is masked |
| PW-SEC-003 | P0 | Yes | API key redaction | Diagnostic contains common API-key syntax | Key value is masked |
| PW-SEC-004 | P1 | Yes | Custom redaction | User provides regex | Matching data is masked |
| PW-SEC-005 | P0 | Yes | AI disabled by default | Default config | No AI callback or external transmission occurs |
| PW-SEC-006 | P0 | Yes | DOM off by default | Capture failure with defaults | Raw DOM is not captured |
| PW-ART-001 | P0 | Yes | Failure metadata capture | Failed test + compatible page/testInfo | Redacted metadata JSON is attached/written |
| PW-ART-002 | P1 | Yes | Screenshot opt-in/out | Toggle screenshot config | Screenshot behavior follows config |
| PW-ART-003 | P1 | Yes | DOM capture opt-in | Enable DOM explicitly | HTML captured as a local artifact only |
| PW-ART-004 | P1 | Yes | Artifact failure isolation | Screenshot or attach throws | Diagnostic capture reports failure without masking original test failure |
| PW-HOOK-001 | P0 | Yes | AI hook disabled | Failed test; no adapter | No exception and no AI invocation |
| PW-HOOK-002 | P0 | Yes | AI adapter success | Explicit adapter supplied | Sanitized diagnostic payload sent once |
| PW-HOOK-003 | P0 | Yes | AI adapter failure | Adapter throws/times out | Test result remains unchanged; warning telemetry emitted |
| PW-HOOK-004 | P0 | Yes | No secret passed to AI | Payload includes token before sanitization | Adapter receives redacted payload |
| PW-COMPAT-001 | P1 | Yes | Chromium/Firefox/WebKit duck typing | Use standard Playwright-like Page APIs | Helpers do not assume Chromium-only behavior |
| PW-DOC-001 | P1 | Yes | README quick start | New user follows README only | Working test can be configured without reading source |
| PW-DOC-002 | P1 | Yes | Failure example | Follow documented failure example | User can see smart-locator and diagnostics behavior |

---

# B. `sdetflow-ai`

| ID | Pri | Blocker | Scenario | Preconditions / Steps | Expected result |
|---|---|---:|---|---|---|
| AI-CONFIG-001 | P0 | Yes | AI disabled by default | Default config | No provider initialized or contacted |
| AI-CONFIG-002 | P0 | Yes | Missing key | Enable provider without required credential | Clear configuration error; key is never printed |
| AI-CONFIG-003 | P0 | Yes | Env key loading | Key supplied via env | Adapter receives credential in memory only |
| AI-CONFIG-004 | P1 | Yes | Explicit model | Provider/model selected | Requested compatible model used |
| AI-ROUTE-001 | P0 | Yes | Auto routing | Task categorized by complexity/cost | Router chooses eligible configured model using deterministic policy |
| AI-ROUTE-002 | P0 | Yes | Primary provider failure | Primary returns retryable error | Retry policy applies, then fallback provider/model used |
| AI-ROUTE-003 | P0 | Yes | Non-retryable provider error | Invalid request | No wasteful retries; structured failure returned |
| AI-ROUTE-004 | P1 | Yes | Budget routing | Expensive model exceeds task budget | Cheaper eligible model selected or task rejected explicitly |
| AI-COST-001 | P0 | Yes | Per-call budget | Estimated cost exceeds max | Request blocked before provider call when estimable |
| AI-COST-002 | P1 | Yes | Daily budget | Accumulated usage reaches cap | Further calls blocked or downgraded according to policy |
| AI-COST-003 | P1 | No | Usage record | Successful/failed call | Tokens/cost/latency/provider/model recorded without prompt secrets |
| AI-SEC-001 | P0 | Yes | API key never logged | Verbose logging enabled | Credentials absent from logs/errors |
| AI-SEC-002 | P0 | Yes | Bearer/cookie/password redaction | Artifact contains secrets | Secrets masked before adapter invocation |
| AI-SEC-003 | P0 | Yes | Custom PII redaction | Custom regex rules configured | Matching values masked |
| AI-SEC-004 | P0 | Yes | Prompt-injection marker | Untrusted page/log text contains instructions | Artifact is treated as data, not system policy; safety wrapper retained |
| AI-SEC-005 | P0 | Yes | Raw screenshot | Image exists in failure artifact | Image not sent unless explicitly enabled by user |
| AI-SEC-006 | P0 | Yes | Raw DOM | DOM exists | DOM not sent unless explicitly enabled; sanitization applied |
| AI-PRIV-001 | P0 | Yes | Opt-in boundary | AI disabled | Zero outbound provider HTTP requests |
| AI-PROV-001 | P0 | Yes | OpenAI adapter contract | Fake OpenAI-compatible response | Normalized SDETFlow result produced |
| AI-PROV-002 | P0 | Yes | Gemini adapter contract | Fake Gemini response | Same normalized result schema produced |
| AI-PROV-003 | P1 | Yes | Unknown provider | Unsupported provider requested | Explicit unsupported-provider error |
| AI-PROV-004 | P1 | Yes | Provider timeout | Delayed fake provider | Timeout/circuit breaker works; deterministic tests continue |
| AI-TRIAGE-001 | P0 | Yes | Automation failure | Known locator timeout fixture | Classification includes evidence and does not assert certainty beyond evidence |
| AI-TRIAGE-002 | P0 | Yes | Application failure | 5xx/network evidence fixture | Classification can identify product/backend failure evidence |
| AI-TRIAGE-003 | P1 | Yes | Environment failure | DNS/service-unavailable fixture | Environment category returned with evidence |
| AI-TRIAGE-004 | P0 | Yes | Ambiguous failure | Insufficient evidence | Result is `unknown`/low-confidence rather than fabricated diagnosis |
| AI-TRIAGE-005 | P1 | Yes | Structured output validation | Provider returns malformed JSON | Repair/retry strategy bounded; invalid output rejected safely |
| AI-FLAKE-001 | P0 | Yes | Historical intermittent test | Alternating run fixture | Flake metrics computed deterministically before AI explanation |
| AI-FLAKE-002 | P1 | Yes | No history | One run only | No unsupported flake claim; insufficient-data status |
| AI-GEN-001 | P1 | Yes | Requirement-to-test suggestions | Requirement supplied | Suggestions clearly labeled proposed, not executed facts |
| AI-GEN-002 | P1 | Yes | OpenAPI test ideas | Valid spec supplied | Happy/negative/boundary candidates generated without changing source spec |
| AI-GEN-003 | P1 | Yes | Generated code safety | Code generation requested | Output not executed automatically |
| AI-A11Y-001 | P1 | No | Axe explanation | Axe violations supplied | Explanation preserves rule IDs/evidence and separates advice from facts |
| AI-LOG-001 | P1 | Yes | Large log truncation | Input exceeds configured size | Deterministic truncation/chunk policy applied; budget respected |
| AI-RES-001 | P0 | Yes | All providers unavailable | Simulate outage | Caller receives graceful unavailable result; base test execution unaffected |

---

# C. `sdetflow-api` Java SDK

| ID | Pri | Blocker | Scenario | Preconditions / Steps | Expected result |
|---|---|---:|---|---|---|
| JAVA-INSTALL-001 | P0 | Yes | Maven dependency | Clean sample app | SDK resolves with declared transitive dependencies only |
| JAVA-HTTP-001 | P0 | Yes | GET | Mock server endpoint | Request sent; normalized response available |
| JAVA-HTTP-002 | P0 | Yes | POST JSON | JSON body | Content type/body preserved |
| JAVA-HTTP-003 | P0 | Yes | PUT/PATCH/DELETE | Mock endpoints | Correct HTTP verbs and payload semantics |
| JAVA-AUTH-001 | P0 | Yes | OAuth bearer | Token configured | Header applied; token absent from logs |
| JAVA-AUTH-002 | P0 | Yes | API key header/query | Key strategy configured | Correct placement; value redacted in diagnostics |
| JAVA-AUTH-003 | P1 | Yes | JWT passthrough | JWT supplied | Request succeeds; token not parsed unnecessarily |
| JAVA-VAL-001 | P0 | Yes | Status assertion | Expected status | Fluent assertion passes/fails clearly |
| JAVA-VAL-002 | P0 | Yes | JSONPath assertion | Valid path | Correct value comparison and actionable failure |
| JAVA-VAL-003 | P0 | Yes | JSON schema | Valid/invalid payload fixtures | Schema result accurate |
| JAVA-OPENAPI-001 | P1 | Yes | OpenAPI response contract | Spec + response | Contract mismatch identifies path/status/schema location |
| JAVA-RETRY-001 | P0 | Yes | Idempotent retry | Retryable GET failure | Backoff/retry works within policy |
| JAVA-RETRY-002 | P0 | Yes | Unsafe method protection | POST without idempotency opt-in | No automatic retry by default |
| JAVA-DB-001 | P1 | Yes | DB verification hook | Test DB fake/fixture | Query result available through abstraction |
| JAVA-CFG-001 | P0 | Yes | Environment profiles | qa/stage configs | Explicit selected profile used; no silent production fallback |
| JAVA-LOG-001 | P0 | Yes | Request logging | Auth + body | Secret fields redacted |
| JAVA-PAR-001 | P1 | Yes | Parallel tests | Concurrent requests | No shared mutable request contamination |
| JAVA-BDD-001 | P1 | No | Cucumber use | Example project | SDK works without framework-specific global state |
| JAVA-JUNIT-001 | P1 | Yes | JUnit 5 example | Run sample | Green execution |
| JAVA-TESTNG-001 | P1 | No | TestNG example | Run sample | Green execution |
| JAVA-AI-001 | P0 | Yes | AI absent | No AI module/config | API SDK fully functional |
| JAVA-AI-002 | P1 | Yes | AI diagnostics hook | Explicit adapter configured | Sanitized failure context emitted to adapter only on opt-in |

---

# D. `sdetflow-ruby` Gem

| ID | Pri | Blocker | Scenario | Preconditions / Steps | Expected result |
|---|---|---:|---|---|---|
| RB-INSTALL-001 | P0 | Yes | Gem install | Clean supported Ruby | Installs with documented dependencies |
| RB-CFG-001 | P0 | Yes | Default config | Require gem | Safe defaults, no browser/network side effects |
| RB-CFG-002 | P1 | Yes | Env profile | qa/stage configuration | Selected values load predictably |
| RB-WEB-001 | P0 | Yes | Capybara adapter | Fake/sample page | Base navigation/locator helper works |
| RB-WEB-002 | P1 | Yes | Watir adapter | Fake/sample browser | Base actions work through adapter |
| RB-WAIT-001 | P0 | Yes | Smart wait timeout | Condition never true | Bounded timeout and useful error |
| RB-RETRY-001 | P0 | Yes | Retry transient block | Failure then success | Correct attempts and final result |
| RB-API-001 | P0 | Yes | GET/POST | Mock server | Normalized response and JSON parsing |
| RB-API-002 | P0 | Yes | Secret logging | Auth header | Secret masked |
| RB-RSPEC-001 | P0 | Yes | RSpec example | Run suite | Hooks do not leak state across examples |
| RB-CUC-001 | P1 | Yes | Cucumber example | Run scenario | World/hooks integration behaves predictably |
| RB-PAR-001 | P1 | No | Parallel execution | Parallel workers | Config/context isolation maintained |
| RB-AI-001 | P0 | Yes | AI disabled | Default | No provider call |
| RB-AI-002 | P1 | Yes | AI adapter opt-in | Adapter enabled | Only redacted diagnostic text supplied |
| RB-DOC-001 | P1 | Yes | README-only install | New user | First passing example within documented steps |

---

# E. `sdetflow-insights`

| ID | Pri | Blocker | Scenario | Preconditions / Steps | Expected result |
|---|---|---:|---|---|---|
| INS-INGEST-001 | P0 | Yes | Playwright JSON ingest | Valid fixture | Normalized run/test events stored |
| INS-INGEST-002 | P0 | Yes | JUnit XML ingest | Valid fixture | Correct suites/tests/status/duration parsed |
| INS-INGEST-003 | P1 | Yes | TestNG ingest | Valid fixture | Normalized schema produced |
| INS-INGEST-004 | P1 | Yes | Cucumber JSON ingest | Valid fixture | Scenario identity/status preserved |
| INS-INGEST-005 | P1 | No | Allure results ingest | Valid fixture | Supported history/artifacts linked |
| INS-INGEST-006 | P0 | Yes | Malformed report | Corrupt fixture | Rejected with line/path diagnostic; no partial corrupt state |
| INS-ID-001 | P0 | Yes | Stable test identity | Same test across runs | Historical record groups correctly |
| INS-FLAKE-001 | P0 | Yes | Flake score | Known 100-run fixture | Deterministic score matches formula |
| INS-FLAKE-002 | P0 | Yes | New test | Insufficient runs | Marked insufficient data rather than flaky |
| INS-CLUSTER-001 | P1 | Yes | Similar stack traces | Multiple failures | Deterministic fingerprint groups obvious duplicates |
| INS-CLUSTER-002 | P1 | Yes | Different root causes | Similar test name, distinct errors | Not incorrectly merged solely by name |
| INS-TREND-001 | P1 | Yes | Duration trend | Historical data | Percentiles/trend computed correctly |
| INS-TREND-002 | P1 | Yes | Pass-rate trend | Historical data | Windowing/timezone handling correct |
| INS-SEC-001 | P0 | Yes | Secret ingestion | Report contains token | Stored searchable diagnostic masks configured secrets |
| INS-SEC-002 | P0 | Yes | AuthZ | User without project access | Project data not returned |
| INS-API-001 | P0 | Yes | Run endpoint | Valid request | Stable versioned response schema |
| INS-API-002 | P0 | Yes | Invalid pagination/filter | Bad params | 4xx validation response; no server crash |
| INS-AI-001 | P0 | Yes | AI unavailable | Provider outage | Dashboard base analytics remain usable |
| INS-AI-002 | P1 | Yes | AI explanation | Explicitly enabled | Explanation linked to deterministic evidence and labeled AI-generated |
| INS-PERF-001 | P1 | Yes | Large run | 50k test results fixture | Ingest completes within defined benchmark budget |
| INS-PERF-002 | P1 | No | Query scale | Large history fixture | Common dashboard queries remain within documented SLO |
| INS-EXP-001 | P1 | No | CSV/JSON export | Filtered results | Export matches visible filter and redaction policy |

---

# F. Website / documentation portal

| ID | Pri | Blocker | Scenario | Preconditions / Steps | Expected result |
|---|---|---:|---|---|---|
| WEB-CONTENT-001 | P0 | Yes | No false release claims | Review homepage/packages | Only actually published artifacts described as published |
| WEB-CONTENT-002 | P0 | Yes | No employer confidential info | Review examples/docs | No proprietary code/data/selectors/internal architecture |
| WEB-LINK-001 | P0 | Yes | Link validation | Crawl site | No broken internal links |
| WEB-A11Y-001 | P0 | Yes | Keyboard navigation | Full site | Core navigation usable with keyboard |
| WEB-A11Y-002 | P1 | Yes | Automated WCAG scan | Main templates | No critical/serious violations before release |
| WEB-SEO-001 | P1 | Yes | Unique metadata | Inspect major pages | Unique title/description/canonical metadata |
| WEB-SEO-002 | P1 | Yes | Structured data | Validate schema | Person/SoftwareSourceCode data valid and truthful |
| WEB-SEO-003 | P1 | No | Sitemap/robots | Production build | Valid sitemap and intended crawl policy |
| WEB-PERF-001 | P1 | Yes | Mobile performance | Production build | Meets documented performance budget |
| WEB-RESP-001 | P0 | Yes | Responsive layouts | Phone/tablet/desktop | No clipped navigation/code blocks or horizontal page overflow |
| WEB-DOC-001 | P0 | Yes | README/site parity | Compare install snippets | Versions/commands remain consistent |
| WEB-PRIV-001 | P0 | Yes | Contact handling | Contact form if added | No unnecessary collection; privacy notice present |

---

# Release gates

A public pre-1.0 package release requires:

1. All applicable P0 blocker tests pass.
2. All P1 blocker tests pass or are explicitly waived in a release candidate with a documented reason; **security P1 tests cannot be waived**.
3. Clean-machine installation is verified.
4. No credentials or employer/client confidential material is present.
5. README quick start is exercised from scratch.
6. License, security policy, changelog, and version are present.
7. CI is green on the supported runtime matrix.
8. Package contents are inspected before publication.
9. Public claims match actual implemented functionality.
10. A rollback/deprecation note exists for any breaking release.
