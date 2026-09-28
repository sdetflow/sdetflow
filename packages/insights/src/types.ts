export type TestStatus = 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted' | 'unknown';
export type ResultSource = 'playwright' | 'junit' | 'cucumber' | 'allure' | 'custom';
export interface NormalizedTestResult {
  runId:string; testId:string; title:string; file?:string; project?:string; suite?:string; source?:ResultSource;
  status:TestStatus; durationMs:number; retry:number; error?:string; timestamp?:string; tags?:string[]; metadata?:Record<string,string>;
}
export interface FlakeAnalysis { testId:string; sampleSize:number; passCount:number; failCount:number; transitionRate:number; failureRate:number; score:number|null; classification:'insufficient-data'|'stable-pass'|'stable-fail'|'flaky'; }
export interface FailureCluster { fingerprint:string; count:number; tests:string[]; sample:string; }
export interface TrendSummary { count:number; min:number; max:number; mean:number; p50:number; p95:number; }
export interface RunSummary { runId:string; total:number; passed:number; failed:number; skipped:number; timedOut:number; interrupted:number; unknown:number; passRate:number; totalDurationMs:number; }
export interface InsightsSnapshot { schemaVersion:'1.0'; results:NormalizedTestResult[]; }
export interface InsightsStore { add(results:NormalizedTestResult[]):void|Promise<void>; all():NormalizedTestResult[]|Promise<NormalizedTestResult[]>; byTest(testId:string):NormalizedTestResult[]|Promise<NormalizedTestResult[]>; byRun(runId:string):NormalizedTestResult[]|Promise<NormalizedTestResult[]>; }
