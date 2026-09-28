import type { FlakeAnalysis, NormalizedTestResult } from './types.js';

export function analyzeFlakiness(testId: string, results: NormalizedTestResult[], minimumSamples = 5): FlakeAnalysis {
  const samples = results.filter((r) => r.testId === testId && ['passed', 'failed', 'timedOut'].includes(r.status));
  const passCount = samples.filter((r) => r.status === 'passed').length;
  const failCount = samples.length - passCount;
  let transitions = 0;
  for (let i = 1; i < samples.length; i += 1) if (samples[i]!.status !== samples[i - 1]!.status) transitions += 1;
  const transitionRate = samples.length > 1 ? transitions / (samples.length - 1) : 0;
  const failureRate = samples.length ? failCount / samples.length : 0;

  if (samples.length < minimumSamples) {
    return { testId, sampleSize: samples.length, passCount, failCount, transitionRate, failureRate, score: null, classification: 'insufficient-data' };
  }
  if (failCount === 0) return { testId, sampleSize: samples.length, passCount, failCount, transitionRate, failureRate, score: 0, classification: 'stable-pass' };
  if (passCount === 0) return { testId, sampleSize: samples.length, passCount, failCount, transitionRate, failureRate, score: 0, classification: 'stable-fail' };

  const balance = 4 * failureRate * (1 - failureRate);
  const score = Math.min(1, Number((0.7 * balance + 0.3 * transitionRate).toFixed(4)));
  return { testId, sampleSize: samples.length, passCount, failCount, transitionRate, failureRate, score, classification: 'flaky' };
}
