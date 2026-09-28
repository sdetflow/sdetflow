import type { NormalizedTestResult } from './types.js';

export class InMemoryInsightsStore {
  private readonly rows: NormalizedTestResult[] = [];

  public add(results: NormalizedTestResult[]): void {
    this.rows.push(...results.map((r) => ({ ...r })));
  }

  public all(): NormalizedTestResult[] { return this.rows.map((r) => ({ ...r })); }
  public byTest(testId: string): NormalizedTestResult[] { return this.rows.filter((r) => r.testId === testId).map((r) => ({ ...r })); }
  public byRun(runId: string): NormalizedTestResult[] { return this.rows.filter((r) => r.runId === runId).map((r) => ({ ...r })); }
}
