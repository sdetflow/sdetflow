import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePlaywrightJson,
  analyzeFlakiness,
  normalizeFailure,
  fingerprintFailure,
  clusterFailures,
  summarizeDurations,
  InMemoryInsightsStore,
} from '../dist/index.js';

const report = {
  suites: [{
    title: 'Checkout',
    specs: [{
      title: 'places order',
      file: 'tests/checkout.spec.ts',
      tests: [{
        testId: 'checkout-1', projectName: 'chromium',
        results: [{ status: 'failed', duration: 1200, retry: 0, error: { message: 'Timeout 5000ms waiting for https://a.test/x' } }]
      }]
    }]
  }]
};

test('parses Playwright JSON into normalized result', () => {
  const rows = parsePlaywrightJson(report, 'run-1');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].testId, 'checkout-1');
  assert.equal(rows[0].title, 'Checkout > places order');
  assert.equal(rows[0].status, 'failed');
  assert.equal(rows[0].durationMs, 1200);
});

test('invalid Playwright report is rejected', () => {
  assert.throws(() => parsePlaywrightJson({}), /suites array/);
});

test('insufficient flake history does not classify as flaky', () => {
  const rows = [
    { runId: '1', testId: 't', title: 't', status: 'passed', durationMs: 1, retry: 0 },
    { runId: '2', testId: 't', title: 't', status: 'failed', durationMs: 1, retry: 0 },
  ];
  const out = analyzeFlakiness('t', rows, 5);
  assert.equal(out.classification, 'insufficient-data');
  assert.equal(out.score, null);
});

test('mixed long history is classified flaky', () => {
  const statuses = ['passed', 'failed', 'passed', 'passed', 'failed', 'passed', 'failed', 'passed'];
  const rows = statuses.map((status, i) => ({ runId: String(i), testId: 't', title: 't', status, durationMs: 1, retry: 0 }));
  const out = analyzeFlakiness('t', rows, 5);
  assert.equal(out.classification, 'flaky');
  assert.ok(out.score > 0);
});

test('all pass is stable-pass and all fail is stable-fail', () => {
  const pass = Array.from({ length: 5 }, (_, i) => ({ runId: String(i), testId: 'p', title: 'p', status: 'passed', durationMs: 1, retry: 0 }));
  const fail = Array.from({ length: 5 }, (_, i) => ({ runId: String(i), testId: 'f', title: 'f', status: 'failed', durationMs: 1, retry: 0 }));
  assert.equal(analyzeFlakiness('p', pass).classification, 'stable-pass');
  assert.equal(analyzeFlakiness('f', fail).classification, 'stable-fail');
});

test('failure normalization removes dynamic URLs/durations/numbers', () => {
  const a = normalizeFailure('Timeout 5000ms at https://one.test/path request 123456');
  const b = normalizeFailure('Timeout 8000ms at https://two.test/other request 999999');
  assert.equal(a, b);
  assert.equal(fingerprintFailure(a), fingerprintFailure(b));
});

test('failure clustering groups normalized duplicates', () => {
  const rows = [
    { runId: '1', testId: 'a', title: 'a', status: 'failed', durationMs: 1, retry: 0, error: 'Timeout 5000ms at https://one.test/path request 123456' },
    { runId: '1', testId: 'b', title: 'b', status: 'failed', durationMs: 1, retry: 0, error: 'Timeout 8000ms at https://two.test/other request 999999' },
    { runId: '1', testId: 'c', title: 'c', status: 'failed', durationMs: 1, retry: 0, error: 'Database connection refused' },
  ];
  const clusters = clusterFailures(rows);
  assert.equal(clusters.length, 2);
  assert.equal(clusters[0].count, 2);
});

test('duration summary computes percentiles', () => {
  const out = summarizeDurations([10, 20, 30, 40, 50]);
  assert.equal(out.count, 5);
  assert.equal(out.p50, 30);
  assert.equal(out.mean, 30);
  assert.ok(out.p95 >= 40);
});

test('in-memory store returns defensive copies', () => {
  const store = new InMemoryInsightsStore();
  store.add([{ runId: '1', testId: 't', title: 't', status: 'passed', durationMs: 1, retry: 0 }]);
  const rows = store.all();
  rows[0].title = 'changed';
  assert.equal(store.all()[0].title, 't');
});
