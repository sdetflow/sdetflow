import test from 'node:test';
import assert from 'node:assert/strict';
import { retryAsync } from '../dist/index.js';

const base = {
  maxAttempts: 3,
  baseDelayMs: 10,
  maxDelayMs: 100,
  factor: 2,
  jitterRatio: 0,
};

test('returns immediately when first attempt succeeds', async () => {
  let calls = 0;
  const result = await retryAsync(async () => { calls += 1; return 'ok'; }, { ...base, sleep: async () => {} });
  assert.equal(result, 'ok');
  assert.equal(calls, 1);
});

test('retries transient failures and succeeds', async () => {
  const delays = [];
  let calls = 0;
  const result = await retryAsync(async () => {
    calls += 1;
    if (calls < 3) throw new Error('transient');
    return 42;
  }, { ...base, sleep: async (ms) => delays.push(ms) });
  assert.equal(result, 42);
  assert.deepEqual(delays, [10, 20]);
});

test('stops on non-retryable error', async () => {
  let calls = 0;
  await assert.rejects(
    retryAsync(async () => { calls += 1; throw new Error('bad request'); }, {
      ...base,
      sleep: async () => {},
      shouldRetry: () => false,
    }),
    /bad request/,
  );
  assert.equal(calls, 1);
});

test('delay respects maximum cap', async () => {
  const delays = [];
  await assert.rejects(
    retryAsync(async () => { throw new Error('x'); }, {
      ...base,
      maxAttempts: 5,
      baseDelayMs: 80,
      maxDelayMs: 100,
      sleep: async (ms) => delays.push(ms),
    }),
  );
  assert.deepEqual(delays, [80, 100, 100, 100]);
});
