import type { TrendSummary } from './types.js';

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower]!;
  const weight = index - lower;
  return sorted[lower]! * (1 - weight) + sorted[upper]! * weight;
}

export function summarizeDurations(values: number[]): TrendSummary {
  const clean = values.filter((v) => Number.isFinite(v) && v >= 0).sort((a, b) => a - b);
  if (clean.length === 0) return { count: 0, min: 0, max: 0, mean: 0, p50: 0, p95: 0 };
  const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
  return {
    count: clean.length,
    min: clean[0]!, max: clean.at(-1)!, mean,
    p50: percentile(clean, 0.5), p95: percentile(clean, 0.95),
  };
}
