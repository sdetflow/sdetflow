import type { NormalizedTestResult, TestStatus } from './types.js';

function normalizeStatus(value: unknown): TestStatus {
  return ['passed', 'failed', 'skipped', 'timedOut', 'interrupted'].includes(String(value)) ? String(value) as TestStatus : 'unknown';
}

function walkSuites(suites: any[], runId: string, parents: string[], output: NormalizedTestResult[]): void {
  for (const suite of suites ?? []) {
    const path = suite.title ? [...parents, suite.title] : parents;
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const project = test.projectName ?? test.project?.name;
        for (const result of test.results ?? []) {
          const title = [...path, spec.title].filter(Boolean).join(' > ');
          const file = spec.file ?? suite.file;
          const testId = test.testId ?? `${file ?? 'unknown'}::${title}::${project ?? 'default'}`;
          const error = result.error?.message ?? result.error?.value ?? result.error?.stack;
          output.push({
            runId,
            testId,
            title,
            ...(file ? { file } : {}),
            ...(project ? { project } : {}),
            source: 'playwright',
            status: normalizeStatus(result.status ?? test.status),
            durationMs: Number(result.duration ?? 0),
            retry: Number(result.retry ?? 0),
            ...(error ? { error: String(error) } : {}),
            ...(result.startTime ? { timestamp: String(result.startTime) } : {}),
          });
        }
      }
    }
    walkSuites(suite.suites ?? [], runId, path, output);
  }
}

export function parsePlaywrightJson(input: string | object, runId = `run-${Date.now()}`): NormalizedTestResult[] {
  const data: any = typeof input === 'string' ? JSON.parse(input) : input;
  if (!data || !Array.isArray(data.suites)) throw new Error('Invalid Playwright JSON report: suites array is required');
  const output: NormalizedTestResult[] = [];
  walkSuites(data.suites, runId, [], output);
  return output;
}
