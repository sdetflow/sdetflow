import type { FailureCluster, NormalizedTestResult } from './types.js';

export function normalizeFailure(error: string): string {
  return error
    .toLowerCase()
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, '<uuid>')
    .replace(/https?:\/\/[^\s)]+/g, '<url>')
    .replace(/\b\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}(?:\.\d+)?z\b/gi, '<timestamp>')
    .replace(/\b\d+(?:\.\d+)?\s*(?:ms|s|seconds?|milliseconds?)\b/g, '<duration>')
    .replace(/\b\d{3,}\b/g, '<number>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fingerprintFailure(error: string): string {
  const normalized = normalizeFailure(error);
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function clusterFailures(results: NormalizedTestResult[]): FailureCluster[] {
  const map = new Map<string, FailureCluster>();
  for (const result of results) {
    if (!result.error || !['failed', 'timedOut'].includes(result.status)) continue;
    const fingerprint = fingerprintFailure(result.error);
    const existing = map.get(fingerprint);
    if (existing) {
      existing.count += 1;
      if (!existing.tests.includes(result.testId)) existing.tests.push(result.testId);
    } else {
      map.set(fingerprint, { fingerprint, count: 1, tests: [result.testId], sample: normalizeFailure(result.error) });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.fingerprint.localeCompare(b.fingerprint));
}
