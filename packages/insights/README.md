# @sdetflow/insights

Deterministic test-intelligence primitives for SDETFlow: normalize test results, identify flaky behavior, cluster recurring failures, compute timing trends, and persist portable history for later dashboards or GenAI-powered quality engineering analysis.

## Supported inputs

- Playwright JSON reporter output
- JUnit XML
- Cucumber JSON
- Allure result JSON

## Example

```ts
import {
  parsePlaywrightJson,
  analyzeFlakiness,
  clusterFailures,
  summarizeRun
} from '@sdetflow/insights';

const results = parsePlaywrightJson(reportJson, 'build-142');
const summary = summarizeRun(results);
const clusters = clusterFailures(results);
const flake = analyzeFlakiness(results[0].testId, historicalResults);
```

## Design principles

Flakiness scoring is deterministic and requires a configurable minimum sample size. Failure fingerprints normalize dynamic URLs, timestamps, durations, UUIDs, and long numbers before hashing. AI is not required; this package can feed AI analysis later while keeping the underlying measurements explainable.

`JsonlInsightsStore` supports persistence through an injected text storage adapter so consumers can use files, object storage, databases, or encrypted storage without this package forcing a database dependency.

## License

Apache-2.0
